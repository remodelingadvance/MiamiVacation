// controllers/newsletter.controller.js
import { Newsletter, Notification } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';
import csv from 'csv-parser';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';
import mongoose from 'mongoose';

// @desc    Subscribe to newsletter
// @route   POST /api/v1/newsletter/subscribe
// @access  Public
export const subscribe = catchAsync(async (req, res, next) => {
  const { email, firstName, lastName, preferences } = req.body;

  // Check if already subscribed
  const existingSubscriber = await Newsletter.findOne({ email });

  if (existingSubscriber) {
    if (existingSubscriber.status === 'unsubscribed') {
      // Re-subscribe
      existingSubscriber.status = 'active';
      existingSubscriber.subscribedAt = Date.now();
      existingSubscriber.unsubscribedAt = undefined;
      if (firstName) existingSubscriber.firstName = firstName;
      if (lastName) existingSubscriber.lastName = lastName;
      if (preferences) existingSubscriber.preferences = preferences;
      await existingSubscriber.save();
      
      await Notification.createNotification({
        type: 'newsletter_subscriber',
        title: 'Newsletter Re-subscription',
        message: `${email} re-subscribed to the newsletter`,
        priority: 'low',
        data: {
          subscriberId: existingSubscriber._id,
          email: email,
          action: 'resubscribed',
        },
        link: `/admin/newsletter`,
      });
      
      return res.status(200).json({
        success: true,
        message: 'You have been re-subscribed to our newsletter',
        subscriber: existingSubscriber,
      });
    }
    
    return next(new AppError('This email is already subscribed to our newsletter', 400));
  }

  // Create new subscriber
  const subscriber = await Newsletter.create({
    email,
    firstName,
    lastName,
    preferences: preferences || {
      promotions: true,
      newProperties: true,
      blog: false,
      events: false,
    },
    source: req.body.source || 'homepage',
    metadata: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  await Notification.createNotification({
    type: 'newsletter_subscriber',
    title: 'New Newsletter Subscriber',
    message: `${email} subscribed to the newsletter`,
    priority: 'low',
    data: {
      subscriberId: subscriber._id,
      email: email,
      firstName: firstName || '',
    },
    link: `/admin/newsletter`,
  });

  logger.info(`Newsletter subscription: ${email}`);

  res.status(201).json({
    success: true,
    message: 'Successfully subscribed to newsletter',
    subscriber,
  });
});

// @desc    Unsubscribe from newsletter
// @route   POST /api/v1/newsletter/unsubscribe
// @access  Public
export const unsubscribe = catchAsync(async (req, res, next) => {
  const { email, reason } = req.body;

  const subscriber = await Newsletter.findOne({ email });

  if (!subscriber) {
    return next(new AppError('Email not found in our subscriber list', 404));
  }

  if (subscriber.status === 'unsubscribed') {
    return next(new AppError('This email is already unsubscribed', 400));
  }

  subscriber.status = 'unsubscribed';
  subscriber.unsubscribedAt = Date.now();
  if (reason) {
    subscriber.unsubscribeReason = reason;
  }
  await subscriber.save();

  logger.info(`Newsletter unsubscription: ${email}`);

  res.status(200).json({
    success: true,
    message: 'Successfully unsubscribed from newsletter',
  });
});

// @desc    Add single subscriber (Admin)
// @route   POST /api/v1/newsletter/admin/add-single
// @access  Private/Admin
export const addSingleSubscriber = catchAsync(async (req, res, next) => {
  const { email, firstName, lastName, phone, preferences } = req.body;

  // Validate email
  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  // Check if exists
  const existing = await Newsletter.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.status === 'unsubscribed') {
      existing.status = 'active';
      existing.firstName = firstName || existing.firstName;
      existing.lastName = lastName || existing.lastName;
      existing.phone = phone || existing.phone;
      existing.unsubscribedAt = undefined;
      await existing.save();
      
      return res.status(200).json({
        success: true,
        message: 'Subscriber reactivated successfully',
        subscriber: existing,
      });
    }
    return next(new AppError('Subscriber already exists', 400));
  }

  const subscriber = await Newsletter.create({
    email: email.toLowerCase(),
    firstName,
    lastName,
    phone,
    preferences: preferences || {
      promotions: true,
      newProperties: true,
      blog: false,
      events: false,
    },
    source: 'manual',
    metadata: {
      importedBy: req.user.id,
    },
  });

  logger.info(`Single subscriber added by admin: ${email}`);

  res.status(201).json({
    success: true,
    message: 'Subscriber added successfully',
    subscriber,
  });
});

// @desc    Bulk add subscribers via text input
// @route   POST /api/v1/newsletter/admin/bulk-text
// @access  Private/Admin
export const bulkAddText = catchAsync(async (req, res, next) => {
  const { subscribers, format = 'csv' } = req.body;
  
  // Format can be 'csv' (email,name) or 'json' or 'simple' (one email per line)
  let subscriberList = [];
  
  if (format === 'simple') {
    // One email per line
    const lines = subscribers.split('\n');
    for (const line of lines) {
      const email = line.trim();
      if (email && email.includes('@')) {
        subscriberList.push({ email });
      }
    }
  } else if (format === 'csv') {
    // CSV format: email,firstName,lastName
    const lines = subscribers.split('\n');
    const headers = lines[0].toLowerCase().split(',');
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const subscriber = {};
      headers.forEach((header, index) => {
        subscriber[header.trim()] = values[index]?.trim();
      });
      if (subscriber.email && subscriber.email.includes('@')) {
        subscriberList.push(subscriber);
      }
    }
  } else if (format === 'json') {
    try {
      subscriberList = JSON.parse(subscribers);
    } catch (error) {
      return next(new AppError('Invalid JSON format', 400));
    }
  }

  if (subscriberList.length === 0) {
    return next(new AppError('No valid subscribers found', 400));
  }

  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    subscribers: [],
  };

  const batchId = new mongoose.Types.ObjectId().toString();

  for (const sub of subscriberList) {
    try {
      if (!sub.email || !sub.email.includes('@')) {
        results.failed++;
        results.errors.push({ email: sub.email || 'unknown', error: 'Invalid email format' });
        continue;
      }

      const existing = await Newsletter.findOne({ email: sub.email.toLowerCase() });
      
      if (existing) {
        if (existing.status === 'unsubscribed') {
          existing.status = 'active';
          existing.firstName = sub.firstName || existing.firstName;
          existing.lastName = sub.lastName || existing.lastName;
          existing.unsubscribedAt = undefined;
          await existing.save();
          results.success++;
          results.subscribers.push(existing);
        } else {
          results.skipped++;
        }
        continue;
      }

      const subscriber = await Newsletter.create({
        email: sub.email.toLowerCase(),
        firstName: sub.firstName || sub.name?.split(' ')[0],
        lastName: sub.lastName || sub.name?.split(' ')[1],
        source: 'bulk_import',
        metadata: {
          importedBy: req.user.id,
          importBatch: batchId,
        },
      });
      
      results.success++;
      results.subscribers.push(subscriber);
    } catch (error) {
      results.failed++;
      results.errors.push({ email: sub.email, error: error.message });
    }
  }

  logger.info(`Bulk text import: ${results.success} added, ${results.failed} failed, ${results.skipped} skipped`);

  res.status(200).json({
    success: true,
    message: `Successfully added ${results.success} subscribers`,
    results,
  });
});

// @desc    Import subscribers from CSV/Excel file
// @route   POST /api/v1/newsletter/admin/import
// @access  Private/Admin
export const importSubscribers = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }

  let subscribers = [];
  const fileType = req.file.mimetype;

  try {
    if (fileType === 'text/csv' || fileType === 'application/vnd.ms-excel') {
      // Parse CSV
      const csvContent = req.file.buffer.toString('utf8');
      const lines = csvContent.split('\n');
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = parseCSVLine(lines[i]);
        const subscriber = {};
        headers.forEach((header, index) => {
          subscriber[header] = values[index]?.trim();
        });
        
        if (subscriber.email && subscriber.email.includes('@')) {
          subscribers.push(subscriber);
        }
      }
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // Parse Excel
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      subscribers = XLSX.utils.sheet_to_json(worksheet);
      
      // Normalize field names
      subscribers = subscribers.map(sub => ({
        email: sub.email || sub.Email || sub.EMAIL,
        firstName: sub.firstName || sub.first_name || sub.FirstName || sub.firstname,
        lastName: sub.lastName || sub.last_name || sub.LastName || sub.lastname,
        phone: sub.phone || sub.Phone || sub.PHONE,
      }));
    } else {
      return next(new AppError('Unsupported file format. Please upload CSV or Excel file.', 400));
    }

    if (subscribers.length === 0) {
      return next(new AppError('No valid subscribers found in file', 400));
    }

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
      subscribers: [],
    };

    const batchId = new mongoose.Types.ObjectId().toString();

    for (const sub of subscribers) {
      try {
        if (!sub.email || !sub.email.includes('@')) {
          results.failed++;
          results.errors.push({ email: sub.email || 'unknown', error: 'Invalid email format' });
          continue;
        }

        const existing = await Newsletter.findOne({ email: sub.email.toLowerCase() });
        
        if (existing) {
          if (existing.status === 'unsubscribed') {
            existing.status = 'active';
            existing.firstName = sub.firstName || existing.firstName;
            existing.lastName = sub.lastName || existing.lastName;
            existing.phone = sub.phone || existing.phone;
            existing.unsubscribedAt = undefined;
            await existing.save();
            results.success++;
            results.subscribers.push(existing);
          } else {
            results.skipped++;
          }
          continue;
        }

        const subscriber = await Newsletter.create({
          email: sub.email.toLowerCase(),
          firstName: sub.firstName,
          lastName: sub.lastName,
          phone: sub.phone,
          source: 'csv_import',
          metadata: {
            importedBy: req.user.id,
            importBatch: batchId,
          },
        });
        
        results.success++;
        results.subscribers.push(subscriber);
      } catch (error) {
        results.failed++;
        results.errors.push({ email: sub.email, error: error.message });
      }
    }

    logger.info(`File import: ${results.success} added, ${results.failed} failed, ${results.skipped} skipped`);

    res.status(200).json({
      success: true,
      message: `Successfully imported ${results.success} subscribers`,
      results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return next(new AppError('Error processing file', 500));
  }
});

// Helper function to parse CSV line with quoted fields
function parseCSVLine(line) {
  const result = [];
  let inQuotes = false;
  let currentField = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField);
  
  return result;
}

// @desc    Export ALL subscribers to CSV/Excel (no pagination limit)
// @route   GET /api/v1/newsletter/admin/export
// @access  Private/Admin
export const exportSubscribers = catchAsync(async (req, res, next) => {
  const { format = 'csv', status, dateFrom, dateTo } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (dateFrom || dateTo) {
    query.subscribedAt = {};
    if (dateFrom) query.subscribedAt.$gte = new Date(dateFrom);
    if (dateTo) query.subscribedAt.$lte = new Date(dateTo);
  }
  
  // Get ALL subscribers - NO LIMIT
  const subscribers = await Newsletter.find(query)
    .sort({ subscribedAt: -1 })
    .lean();
  
  if (format === 'csv') {
    const fields = ['email', 'firstName', 'lastName', 'phone', 'status', 'source', 'subscribedAt', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(subscribers);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } else if (format === 'excel') {
    const worksheet = XLSX.utils.json_to_sheet(subscribers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Subscribers');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=subscribers-${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(buffer);
  } else {
    res.status(200).json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  }
});

// @desc    Get subscriber template
// @route   GET /api/v1/newsletter/admin/template
// @access  Private/Admin
export const getTemplate = catchAsync(async (req, res, next) => {
  const { format = 'csv' } = req.query;
  
  const template = [
    { email: 'john@example.com', firstName: 'John', lastName: 'Doe', phone: '+1234567890' },
    { email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith', phone: '+1987654321' },
  ];
  
  if (format === 'csv') {
    const fields = ['email', 'firstName', 'lastName', 'phone'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(template);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=subscriber-template.csv');
    res.send(csv);
  } else if (format === 'excel') {
    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=subscriber-template.xlsx');
    res.send(buffer);
  }
});

// @desc    Get all subscribers (Admin)
// @route   GET /api/v1/newsletter/subscribers
// @access  Private/Admin
export const getSubscribers = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20, search, source, dateFrom, dateTo } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (source) query.source = source;
  if (dateFrom || dateTo) {
    query.subscribedAt = {};
    if (dateFrom) query.subscribedAt.$gte = new Date(dateFrom);
    if (dateTo) query.subscribedAt.$lte = new Date(dateTo);
  }
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
    ];
  }
  
  const subscribers = await Newsletter.find(query)
    .sort({ subscribedAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));
  
  const total = await Newsletter.countDocuments(query);
  
  // Get stats for dashboard
  const stats = await Newsletter.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        unsubscribed: { $sum: { $cond: [{ $eq: ['$status', 'unsubscribed'] }, 1, 0] } },
        bounced: { $sum: { $cond: [{ $eq: ['$status', 'bounced'] }, 1, 0] } },
      },
    },
  ]);
  
  res.status(200).json({
    success: true,
    count: subscribers.length,
    total,
    activeCount: stats[0]?.active || 0,
    stats: stats[0] || {},
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
    subscribers,
  });
});

// @desc    Delete subscriber (Admin)
// @route   DELETE /api/v1/newsletter/subscribers/:id
// @access  Private/Admin
export const deleteSubscriber = catchAsync(async (req, res, next) => {
  const subscriber = await Newsletter.findById(req.params.id);
  
  if (!subscriber) {
    return next(new AppError('Subscriber not found', 404));
  }
  
  await subscriber.deleteOne();
  
  logger.info(`Subscriber deleted: ${subscriber.email}`);
  
  res.status(200).json({
    success: true,
    message: 'Subscriber deleted successfully',
  });
});

// @desc    Bulk delete subscribers
// @route   DELETE /api/v1/newsletter/admin/bulk-delete
// @access  Private/Admin
export const bulkDeleteSubscribers = catchAsync(async (req, res, next) => {
  const { subscriberIds } = req.body;
  
  if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
    return next(new AppError('Please provide subscriber IDs to delete', 400));
  }

  const invalidIds = subscriberIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    return next(new AppError('One or more selected subscribers are invalid', 400));
  }
  
  const result = await Newsletter.deleteMany({ _id: { $in: subscriberIds } });
  
  logger.info(`Bulk deleted ${result.deletedCount} subscribers by admin ${req.user.id}`);
  
  res.status(200).json({
    success: true,
    message: `${result.deletedCount} subscribers deleted`,
    deletedCount: result.deletedCount,
  });
});