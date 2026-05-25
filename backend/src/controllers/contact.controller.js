import { Contact, Notification } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import emailService from '../utils/emailService.js';
import logger from '../utils/logger.js';

// @desc    Submit contact form
// @route   POST /api/v1/contact
// @access  Public
export const submitContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.create({
    ...req.body,
    metadata: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      page: req.get('referer'),
    },
  });

  // ✅ Create notification for admin
  await Notification.createNotification({
    type: 'new_contact',
    title: 'New Contact Message',
    message: `New message from ${contact.name}: ${contact.subject}`,
    priority: contact.priority === 'urgent' ? 'urgent' : 'medium',
    data: {
      contactId: contact._id,
      email: contact.email,
      subject: contact.subject,
      name: contact.name,
    },
    link: `/admin/contacts/${contact._id}`,
  });

  // Send notification email to admin
  try {
    await emailService.send({
      to: process.env.ADMIN_EMAIL || 'admin@miamivacationrentals.com',
      subject: `New Contact Form Submission - ${contact.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; }
            .content { padding: 20px; background: #f9f9f9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <p><strong>From:</strong> ${contact.name} (${contact.email})</p>
              <p><strong>Phone:</strong> ${contact.phone || 'N/A'}</p>
              <p><strong>Subject:</strong> ${contact.subject}</p>
              <p><strong>Message:</strong></p>
              <p>${contact.message}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Send auto-reply to user
    await emailService.send({
      to: contact.email,
      subject: 'Thank you for contacting Miami Luxury Rentals',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You! 🌴</h1>
            </div>
            <div class="content">
              <p>Dear ${contact.name},</p>
              <p>Thank you for reaching out to Miami Luxury Rentals. We have received your message and will get back to you within 24 hours.</p>
              <p>For urgent inquiries, please call us at +1 (305) 123-4567.</p>
              <p>Best regards,<br>The Miami Luxury Rentals Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    logger.error('Contact form email failed:', error);
  }

  logger.info(`Contact form submitted by ${contact.email}`);

  res.status(201).json({
    success: true,
    message: 'Your message has been sent successfully. We will get back to you soon.',
    contact,
  });
});

// @desc    Get all contacts (Admin)
// @route   GET /api/v1/contact
// @access  Private/Admin
export const getContacts = catchAsync(async (req, res, next) => {
  const { status, priority, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const contacts = await Contact.find(query)
    .populate('assignedTo', 'firstName lastName')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Contact.countDocuments(query);

  res.status(200).json({
    success: true,
    count: contacts.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
    contacts,
  });
});

// @desc    Get single contact
// @route   GET /api/v1/contact/:id
// @access  Private/Admin
export const getContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id)
    .populate('assignedTo', 'firstName lastName')
    .populate('replies.sentBy', 'firstName lastName');

  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  // Mark as read if unread
  if (contact.status === 'unread') {
    contact.status = 'read';
    await contact.save();
  }

  res.status(200).json({
    success: true,
    contact,
  });
});

// @desc    Reply to contact
// @route   POST /api/v1/contact/:id/reply
// @access  Private/Admin
export const replyToContact = catchAsync(async (req, res, next) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  const reply = {
    message: req.body.message,
    sentBy: req.user.id,
    isAdmin: req.user.role === 'admin',
  };

  contact.replies.push(reply);
  contact.status = 'replied';
  if (!contact.assignedTo) {
    contact.assignedTo = req.user.id;
  }

  await contact.save();

  // Send email notification to original sender
  try {
    await emailService.send({
      to: contact.email,
      subject: `Re: ${contact.subject} - Miami Luxury Rentals`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Response from Miami Luxury Rentals</h2>
          <p>Dear ${contact.name},</p>
          <p>${req.body.message}</p>
          <p>Best regards,<br>${req.user.firstName} ${req.user.lastName}<br>Miami Luxury Rentals</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error('Contact reply email failed:', error);
  }

  res.status(200).json({
    success: true,
    contact,
  });
});

// @desc    Update contact status
// @route   PATCH /api/v1/contact/:id/status
// @access  Private/Admin
export const updateContactStatus = catchAsync(async (req, res, next) => {
  const { status, priority, assignedTo } = req.body;

  const updates = {};
  if (status) updates.status = status;
  if (priority) updates.priority = priority;
  if (assignedTo) updates.assignedTo = assignedTo;

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  res.status(200).json({
    success: true,
    contact,
  });
});

// @desc    Mark all contacts as read
// @route   POST /api/v1/contact/mark-all-read
// @access  Private/Admin
export const markAllAsRead = catchAsync(async (req, res, next) => {
    await Contact.updateMany(
        { status: 'unread' },
        { status: 'read' }
    );
    
    res.status(200).json({
        success: true,
        message: 'All contacts marked as read',
    });
});