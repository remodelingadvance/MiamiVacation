import createTransporter from '../config/brevo.js';
import { COMPANY_INFO } from '../config/constants.js';

class EmailService {
  constructor() {
    this.transporter = createTransporter();
    const senderName = process.env.BREVO_SENDER_NAME || COMPANY_INFO.name;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || COMPANY_INFO.email;
    this.from = `"${senderName}" <${senderEmail}>`;
  }

  async send({ to, subject, html, attachments = [] }) {
    try {
      const mailOptions = {
        from: this.from,
        to,
        subject,
        html,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendBookingConfirmation(booking, user) {
    const subject = `Booking Confirmation - ${booking.bookingNumber}`;
    const totalAmount = Number(booking.pricing?.total || booking.payment?.amountPaid || booking.totalAmount || 0);
    const guestCount = booking.guests?.adults
      ? `${booking.guests.adults || 0} adults, ${booking.guests.children || 0} children, ${booking.guests.infants || 0} infants`
      : booking.guests;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed! 🎉</h1>
            <p>Thank you for choosing ${COMPANY_INFO.name}</p>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName},</h2>
            <p>Your booking has been confirmed. Here are your booking details:</p>
            
            <div class="booking-details">
              <p><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
              <p><strong>Property:</strong> ${booking.property.name}</p>
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
              <p><strong>Guests:</strong> ${guestCount}</p>
              <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
            </div>

            <p>If you have any questions, please contact us at ${COMPANY_INFO.phone} or ${COMPANY_INFO.email}.</p>
            
            <a href="${process.env.FRONTEND_URL}/bookings/${booking._id}" class="button">View Booking</a>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.send({ to: user.email, subject, html });
  }

  async sendPaymentConfirmation(booking, user) {
    const subject = `Payment Confirmed - ${booking.bookingNumber}`;
    const amountPaid = Number(
      booking.pricing?.total || booking.payment?.amountPaid || booking.totalAmount || 0
    );
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Confirmed ✅</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName},</h2>
            <p>Your payment of $${amountPaid.toFixed(2)} has been processed successfully.</p>
            <p>Booking Number: ${booking.bookingNumber}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.send({ to: user.email, subject, html });
  }
}

export default new EmailService();
