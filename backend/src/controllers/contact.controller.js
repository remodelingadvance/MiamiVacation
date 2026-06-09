import mongoose from 'mongoose';
import { Contact, Notification } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import emailService from '../utils/emailService.js';
import logger from '../utils/logger.js';

const CONTACT_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CONTACT_STATUSES = ['unread', 'read', 'replied', 'resolved', 'spam'];

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

const escapeHtml = (value) =>
  String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));

const buildContactPayload = (body) => {
  const payload = {
    name: cleanText(body.name),
    email: cleanText(body.email).toLowerCase(),
    phone: cleanText(body.phone),
    subject: cleanText(body.subject) || 'General inquiry',
    message: cleanText(body.message),
    priority: CONTACT_PRIORITIES.includes(body.priority) ? body.priority : 'low',
  };

  if (body.booking) {
    if (!mongoose.Types.ObjectId.isValid(body.booking)) {
      throw new AppError('Invalid related booking ID', 400);
    }
    payload.booking = body.booking;
  }

  return payload;
};

const emitContactUnreadCount = async () => {
  try {
    const { getIO } = await import('../config/socket.js');
    const io = getIO();
    if (!io) return;

    const unreadCount = await Contact.countDocuments({ status: 'unread' });
    io.to('admin').emit('admin:contact-unread-count-update', unreadCount);
  } catch (error) {
    logger.error('Contact unread socket update failed:', error);
  }
};

// @desc    Submit contact form
// @route   POST /api/v1/contact
// @access  Public
export const submitContact = catchAsync(async (req, res, next) => {
  const contactPayload = buildContactPayload(req.body);

  if (!contactPayload.name || !contactPayload.email || !contactPayload.message) {
    return next(new AppError('Name, email, and message are required', 400));
  }

  const contact = await Contact.create({
    ...contactPayload,
    metadata: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      page: req.get('referer'),
    },
  });

  await emitContactUnreadCount();

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
              <p><strong>From:</strong> ${escapeHtml(contact.name)} (${escapeHtml(contact.email)})</p>
              <p><strong>Phone:</strong> ${escapeHtml(contact.phone || 'N/A')}</p>
              <p><strong>Subject:</strong> ${escapeHtml(contact.subject)}</p>
              <p><strong>Message:</strong></p>
              <p>${escapeHtml(contact.message)}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

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
              <h1>Thank You</h1>
            </div>
            <div class="content">
              <p>Dear ${escapeHtml(contact.name)},</p>
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
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

  const query = {};
  if (status) query.status = status;
  if (priority) query.priority = priority;

  const contacts = await Contact.find(query)
    .populate('assignedTo', 'firstName lastName')
    .sort('-createdAt')
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const [total, unreadCount] = await Promise.all([
    Contact.countDocuments(query),
    Contact.countDocuments({ status: 'unread' }),
  ]);

  res.status(200).json({
    success: true,
    count: contacts.length,
    total,
    unreadCount,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
    contacts,
  });
});

// @desc    Get unread contact count
// @route   GET /api/v1/contact/unread-count
// @access  Private/Admin
export const getUnreadContactsCount = catchAsync(async (req, res, next) => {
  const unreadCount = await Contact.countDocuments({ status: 'unread' });

  res.status(200).json({
    success: true,
    count: unreadCount,
    unreadCount,
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

  if (contact.status === 'unread') {
    contact.status = 'read';
    await contact.save();
    await emitContactUnreadCount();
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
  const replyMessage = cleanText(req.body.message);
  if (!replyMessage) {
    return next(new AppError('Reply message is required', 400));
  }

  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  contact.replies.push({
    message: replyMessage,
    sentBy: req.user.id,
    isAdmin: ['admin', 'super-admin'].includes(req.user.role),
  });
  contact.status = 'replied';
  if (!contact.assignedTo) {
    contact.assignedTo = req.user.id;
  }

  await contact.save();
  await emitContactUnreadCount();

  try {
    await emailService.send({
      to: contact.email,
      subject: `Re: ${contact.subject} - Miami Luxury Rentals`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Response from Miami Luxury Rentals</h2>
          <p>Dear ${escapeHtml(contact.name)},</p>
          <p>${escapeHtml(replyMessage)}</p>
          <p>Best regards,<br>${escapeHtml(req.user.firstName)} ${escapeHtml(req.user.lastName)}<br>Miami Luxury Rentals</p>
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

  if (status) {
    if (!CONTACT_STATUSES.includes(status)) {
      return next(new AppError('Invalid contact status', 400));
    }
    updates.status = status;
  }

  if (priority) {
    if (!CONTACT_PRIORITIES.includes(priority)) {
      return next(new AppError('Invalid contact priority', 400));
    }
    updates.priority = priority;
  }

  if (assignedTo) {
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return next(new AppError('Invalid assignee ID', 400));
    }
    updates.assignedTo = assignedTo;
  }

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  await emitContactUnreadCount();

  res.status(200).json({
    success: true,
    contact,
  });
});

// @desc    Mark single contact as read
// @route   POST /api/v1/contact/:id/read
// @access  Private/Admin
export const markContactRead = catchAsync(async (req, res, next) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status: 'read' },
    { new: true, runValidators: true }
  );

  if (!contact) {
    return next(new AppError('Contact not found', 404));
  }

  await emitContactUnreadCount();

  res.status(200).json({
    success: true,
    message: 'Contact marked as read',
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

  await emitContactUnreadCount();

  res.status(200).json({
    success: true,
    message: 'All contacts marked as read',
  });
});
