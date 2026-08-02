import stripe from '../config/stripe.js';
import { Booking, Payment, User } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import emailService from '../utils/emailService.js';
import logger from '../utils/logger.js';
import { COMPANY_INFO } from '../config/constants.js';

// @desc    Create payment intent
// @route   POST /api/v1/payments/create-payment-intent
// @access  Private
export const createPaymentIntent = catchAsync(async (req, res, next) => {
  const { bookingId, paymentMethodId } = req.body;

  const booking = await Booking.findById(bookingId).populate('property');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.user.toString() !== req.user.id) {
    return next(new AppError('You can only pay for your own bookings', 403));
  }

  if (booking.payment.status === 'paid') {
    return next(new AppError('Booking is already paid', 400));
  }

  try {
    // Create or get Stripe customer
    let stripeCustomerId = req.user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`,
        phone: req.user.phone,
        metadata: {
          userId: req.user.id,
        },
      });
      stripeCustomerId = customer.id;
      req.user.stripeCustomerId = customer.id;
      await req.user.save();
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.pricing.total * 100), // Convert to cents
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      description: `Booking ${booking.bookingNumber} - ${booking.property.name}`,
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user.id,
        bookingNumber: booking.bookingNumber,
      },
      receipt_email: req.user.email,
      setup_future_usage: 'off_session',
    });

    // Confirm payment intent
    const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntent.id);

    // Save payment record
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user.id,
      amount: booking.pricing.total,
      currency: 'usd',
      status: 'processing',
      method: 'card',
      stripePaymentIntentId: confirmedIntent.id,
      stripeCustomerId: stripeCustomerId,
      description: `Payment for booking ${booking.bookingNumber}`,
    });

    // Update booking payment info
    booking.payment.stripePaymentIntentId = confirmedIntent.id;
    booking.payment.status = 'processing';
    await booking.save();

    res.status(200).json({
      success: true,
      clientSecret: confirmedIntent.client_secret,
      paymentIntentId: confirmedIntent.id,
      payment,
    });
  } catch (error) {
    logger.error('Payment intent creation failed:', error);
    return next(new AppError('Payment processing failed. Please try again.', 500));
  }
});

// @desc    Confirm payment
// @route   POST /api/v1/payments/confirm
// @access  Private
export const confirmPayment = catchAsync(async (req, res, next) => {
  const { paymentIntentId, bookingId } = req.body;

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    return next(new AppError('Payment not successful', 400));
  }

  // Update booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  booking.payment.status = 'paid';
  booking.payment.amountPaid = paymentIntent.amount / 100;
  booking.payment.paidAt = new Date();
  booking.status = 'confirmed';
  await booking.save();

  // Update payment record
  const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
  if (payment) {
    payment.status = 'succeeded';
    payment.receiptUrl = paymentIntent.charges.data[0]?.receipt_url;
    await payment.save();
  }

  // Send payment confirmation email
  try {
    await emailService.sendPaymentConfirmation(booking, req.user);
  } catch (error) {
    logger.error('Payment confirmation email failed:', error);
  }

  logger.info(`Payment confirmed for booking ${booking.bookingNumber}`);

  res.status(200).json({
    success: true,
    message: 'Payment successful',
    booking,
  });
});

// @desc    Handle Stripe webhook
// @route   POST /api/v1/payments/webhook
// @access  Public
export const handleWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;

    case 'charge.refunded':
      const refund = event.data.object;
      await handleRefund(refund);
      break;

    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Helper function to handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    const booking = await Booking.findOne({
      'payment.stripePaymentIntentId': paymentIntent.id,
    });

    if (booking) {
      booking.payment.status = 'paid';
      booking.payment.amountPaid = paymentIntent.amount / 100;
      booking.payment.paidAt = new Date();
      booking.status = 'confirmed';
      await booking.save();

      logger.info(`Webhook: Payment succeeded for booking ${booking.bookingNumber}`);
    }
  } catch (error) {
    logger.error('Webhook payment success handling failed:', error);
  }
}

// Helper function to handle failed payment
async function handlePaymentFailure(paymentIntent) {
  try {
    const booking = await Booking.findOne({
      'payment.stripePaymentIntentId': paymentIntent.id,
    });

    if (booking) {
      booking.payment.status = 'failed';
      booking.status = 'pending';
      await booking.save();

      // Notify user
      const user = await User.findById(booking.user);
      if (user) {
        await emailService.send({
          to: user.email,
          subject: `Payment Failed - ${COMPANY_INFO.name}`,
          html: `
            <h2>Payment Failed</h2>
            <p>Your payment for booking ${booking.bookingNumber} has failed.</p>
            <p>Please update your payment method and try again.</p>
            <p>Need help? Contact ${COMPANY_INFO.phone} or ${COMPANY_INFO.email}.</p>
          `,
        });
      }

      logger.info(`Webhook: Payment failed for booking ${booking.bookingNumber}`);
    }
  } catch (error) {
    logger.error('Webhook payment failure handling failed:', error);
  }
}

// Helper function to handle refund
async function handleRefund(refund) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(refund.payment_intent);
    const booking = await Booking.findOne({
      'payment.stripePaymentIntentId': paymentIntent.id,
    });

    if (booking) {
      booking.payment.amountRefunded = refund.amount / 100;
      booking.payment.refundedAt = new Date();
      booking.payment.status = refund.amount === paymentIntent.amount ? 'refunded' : 'partially_refunded';
      await booking.save();

      logger.info(`Webhook: Refund processed for booking ${booking.bookingNumber}`);
    }
  } catch (error) {
    logger.error('Webhook refund handling failed:', error);
  }
}

// @desc    Create Stripe checkout session
// @route   POST /api/v1/payments/create-checkout-session
// @access  Private
export const createCheckoutSession = catchAsync(async (req, res, next) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId).populate('property');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: booking.property.name,
              description: `${booking.pricing.nights} nights stay`,
              images: [booking.property.images[0]?.url],
            },
            unit_amount: Math.round(booking.pricing.total * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking/${bookingId}`,
      customer_email: req.user.email,
      client_reference_id: bookingId,
      metadata: {
        bookingId: booking._id.toString(),
        userId: req.user.id,
        bookingNumber: booking.bookingNumber,
      },
    });

    // Save session ID to booking
    booking.payment.stripeSessionId = session.id;
    await booking.save();

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    logger.error('Checkout session creation failed:', error);
    return next(new AppError('Failed to create checkout session', 500));
  }
});

// @desc    Get payment history
// @route   GET /api/v1/payments/history
// @access  Private
export const getPaymentHistory = catchAsync(async (req, res, next) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate('booking')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: payments.length,
    payments,
  });
});

// @desc    Get payment details
// @route   GET /api/v1/payments/:id
// @access  Private
export const getPaymentDetails = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate('booking')
    .populate('user', 'firstName lastName email');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only view your own payments', 403));
  }

  res.status(200).json({
    success: true,
    payment,
  });
});

// @desc    Generate invoice
// @route   GET /api/v1/payments/:id/invoice
// @access  Private
export const generateInvoice = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
    .populate({
      path: 'booking',
      populate: {
        path: 'property',
        select: 'name location',
      },
    })
    .populate('user', 'firstName lastName email');

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  // Generate invoice HTML (simplified version)
  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .details { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-size: 1.2em; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <h1>INVOICE</h1>
          <p><strong>${COMPANY_INFO.name}</strong></p>
          <p>${COMPANY_INFO.address}</p>
          <p>${COMPANY_INFO.phone} | ${COMPANY_INFO.email}</p>
          <p>Invoice Date: ${new Date(payment.createdAt).toLocaleDateString()}</p>
          <p>Payment ID: ${payment._id}</p>
        </div>
        <div class="details">
          <p><strong>Bill To:</strong></p>
          <p>${payment.user.firstName} ${payment.user.lastName}</p>
          <p>${payment.user.email}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Booking ${payment.booking.bookingNumber} - ${payment.booking.property.name}</td>
              <td>$${payment.amount.toFixed(2)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="total">Total</td>
              <td class="total">$${payment.amount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(invoiceHtml);
});