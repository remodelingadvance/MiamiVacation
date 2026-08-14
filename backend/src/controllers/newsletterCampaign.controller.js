import { NewsletterCampaign, Newsletter } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import emailService from '../utils/emailService.js';
import logger from '../utils/logger.js';

const BRAND_NAME = 'Stay Wise Miami';
const LEGACY_BRAND_PATTERN = /Miami\s+Luxury\s+Rentals|Miami\s+Vacation\s+Rentals/gi;
const SHORT_BRAND_PATTERN = /Stay\s+Wise(?!\s+Miami)/gi;

const decodeHtmlEntities = (value = '') => {
  const entities = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#34;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
  };

  let decoded = String(value);
  for (let i = 0; i < 3; i += 1) {
    const next = decoded
      .replace(/&(lt|gt|quot|#34|#39|apos|nbsp);/gi, (match) => entities[match.toLowerCase()] || match)
      .replace(/&amp;/gi, '&');

    if (next === decoded) break;
    decoded = next;
  }

  return decoded;
};

const normalizeBrandText = (value = '') =>
  String(value)
    .replace(LEGACY_BRAND_PATTERN, BRAND_NAME)
    .replace(SHORT_BRAND_PATTERN, BRAND_NAME);

const sanitizeCampaignHtml = (value = '') => {
  let html = normalizeBrandText(decodeHtmlEntities(value));

  html = html
    .replace(/href=(["'])\[(https?:\/\/[^\]]+)\]\((https?:\/\/[^)]+)\)\1/gi, 'href="$3"')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<(iframe|object|embed|form|input|button|textarea|select|meta|link)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(iframe|object|embed|form|input|button|textarea|select|meta|link)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(["'])[\s\S]*?\1/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s+(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .replace(/\s+(href|src)\s*=\s*(["'])\s*data:text\/html[\s\S]*?\2/gi, ' $1="#"');

  return html.trim();
};

const stripHtmlToText = (html = '') =>
  normalizeBrandText(decodeHtmlEntities(html))
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeCampaignPayload = (payload = {}) => {
  if (payload.name) payload.name = normalizeBrandText(payload.name).trim();
  if (payload.subject) payload.subject = normalizeBrandText(payload.subject).trim();
  if (payload.content) payload.content = sanitizeCampaignHtml(payload.content);
  return payload;
};

const buildCampaignEmail = (campaign) => {
  const html = sanitizeCampaignHtml(campaign.content);
  return {
    subject: normalizeBrandText(campaign.subject),
    html,
    text: stripHtmlToText(html),
  };
};

const normalizeCampaignForResponse = (campaign) => {
  if (!campaign) return campaign;

  const item = typeof campaign.toObject === 'function' ? campaign.toObject() : { ...campaign };
  item.name = normalizeBrandText(item.name || '').trim();
  item.subject = normalizeBrandText(item.subject || '').trim();
  item.content = sanitizeCampaignHtml(item.content || '');
  return item;
};

// @desc    Create newsletter campaign
// @route   POST /api/v1/newsletter/campaigns
// @access  Private/Admin
export const createCampaign = catchAsync(async (req, res, next) => {
  normalizeCampaignPayload(req.body);
  req.body.createdBy = req.user.id;

  const campaign = await NewsletterCampaign.create(req.body);

  // If scheduled, set up cron job
  if (campaign.status === 'scheduled' && campaign.scheduledAt) {
    scheduleCampaign(campaign);
  }

  logger.info(`Newsletter campaign created: ${campaign.name}`);

  res.status(201).json({
    success: true,
    campaign: normalizeCampaignForResponse(campaign),
  });
});

// @desc    Get all campaigns
// @route   GET /api/v1/newsletter/campaigns
// @access  Private/Admin
export const getCampaigns = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = {};
  if (status) query.status = status;

  const campaigns = await NewsletterCampaign.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('createdBy', 'firstName lastName');

  const total = await NewsletterCampaign.countDocuments(query);

  res.status(200).json({
    success: true,
    count: campaigns.length,
    total,
    campaigns: campaigns.map(normalizeCampaignForResponse),
  });
});

// @desc    Get single campaign
// @route   GET /api/v1/newsletter/campaigns/:id
// @access  Private/Admin
export const getCampaign = catchAsync(async (req, res, next) => {
  const campaign = await NewsletterCampaign.findById(req.params.id)
    .populate('createdBy', 'firstName lastName');

  if (!campaign) {
    return next(new AppError('Campaign not found', 404));
  }

  res.status(200).json({
    success: true,
    campaign: normalizeCampaignForResponse(campaign),
  });
});

// @desc    Update campaign
// @route   PATCH /api/v1/newsletter/campaigns/:id
// @access  Private/Admin
export const updateCampaign = catchAsync(async (req, res, next) => {
  normalizeCampaignPayload(req.body);

  const campaign = await NewsletterCampaign.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!campaign) {
    return next(new AppError('Campaign not found', 404));
  }

  res.status(200).json({
    success: true,
    campaign: normalizeCampaignForResponse(campaign),
  });
});

// @desc    Send campaign now
// @route   POST /api/v1/newsletter/campaigns/:id/send
// @access  Private/Admin
export const sendCampaign = catchAsync(async (req, res, next) => {
  const campaign = await NewsletterCampaign.findById(req.params.id);

  if (!campaign) {
    return next(new AppError('Campaign not found', 404));
  }

  if (campaign.status === 'sending' || campaign.status === 'sent') {
    return next(new AppError('Campaign is already being sent or has been sent', 400));
  }

  // Start sending in background
  campaign.status = 'sending';
  await campaign.save();

  // Process in background
  processCampaignSend(campaign._id);

  res.status(200).json({
    success: true,
    message: 'Campaign sending started',
    campaign: normalizeCampaignForResponse(campaign),
  });
});

// @desc    Delete campaign
// @route   DELETE /api/v1/newsletter/campaigns/:id
// @access  Private/Admin
export const deleteCampaign = catchAsync(async (req, res, next) => {
  const campaign = await NewsletterCampaign.findByIdAndDelete(req.params.id);

  if (!campaign) {
    return next(new AppError('Campaign not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Campaign deleted',
  });
});

// @desc    Get newsletter subscribers
// @route   GET /api/v1/newsletter/subscribers
// @access  Private/Admin
// controllers/newsletterCampaign.controller.js - Update getSubscribers to include activeCount
export const getSubscribers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, status, source, search } = req.query;

  const query = {};
  if (status) query.status = status;
  if (source) query.source = source;
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
    ];
  }

  const subscribers = await Newsletter.find(query)
    .sort({ subscribedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Newsletter.countDocuments(query);

  // Get stats for badges
  const stats = await Newsletter.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
        unsubscribed: {
          $sum: { $cond: [{ $eq: ['$status', 'unsubscribed'] }, 1, 0] },
        },
        bounced: {
          $sum: { $cond: [{ $eq: ['$status', 'bounced'] }, 1, 0] },
        },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: subscribers.length,
    total,
    activeCount: stats[0]?.active || 0, // For badge
    stats: stats[0] || {},
    subscribers,
  });
});

// @desc    Export subscribers
// @route   GET /api/v1/newsletter/subscribers/export
// @access  Private/Admin
export const exportSubscribers = catchAsync(async (req, res, next) => {
  const subscribers = await Newsletter.find({ status: 'active' })
    .select('email firstName subscribedAt source')
    .lean();

  const csv = [
    'Email,First Name,Subscribed Date,Source',
    ...subscribers.map(s =>
      `${s.email},${s.firstName || ''},${s.subscribedAt},${s.source}`
    ),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
  res.send(csv);
});

// Helper function to process campaign sending
async function processCampaignSend(campaignId) {
  try {
    const campaign = await NewsletterCampaign.findById(campaignId);
    if (!campaign || campaign.status !== 'sending') return;

    // Get target subscribers
    const query = { status: 'active' };
    if (campaign.targetAudience === 'new') {
      query.subscribedAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    const subscribers = await Newsletter.find(query);
    const email = buildCampaignEmail(campaign);
    campaign.name = normalizeBrandText(campaign.name || '').trim();
    campaign.subject = email.subject;
    campaign.content = email.html;
    campaign.recipients.total = subscribers.length;
    await campaign.save();

    let sentCount = 0;
    const batchSize = 50;

    // Send in batches
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (subscriber) => {
          try {
            await emailService.send({
              to: subscriber.email,
              subject: email.subject,
              html: email.html,
              text: email.text,
            });
            sentCount++;
          } catch (error) {
            logger.error(`Failed to send campaign to ${subscriber.email}:`, error);
          }
        })
      );

      // Update progress
      campaign.recipients.sent = sentCount;
      await campaign.save();

      // Small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Mark as sent
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.recipients.sent = sentCount;
    await campaign.save();

    logger.info(`Campaign "${campaign.name}" sent to ${sentCount} subscribers`);
  } catch (error) {
    logger.error(`Campaign sending failed:`, error);
    
    const campaign = await NewsletterCampaign.findById(campaignId);
    if (campaign) {
      campaign.status = 'failed';
      await campaign.save();
    }
  }
}

// Schedule campaign
function scheduleCampaign(campaign) {
  const now = new Date();
  const scheduledTime = new Date(campaign.scheduledAt);
  const delay = scheduledTime.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(async () => {
      try {
        const updatedCampaign = await NewsletterCampaign.findById(campaign._id);
        if (updatedCampaign && updatedCampaign.status === 'scheduled') {
          await processCampaignSend(campaign._id);
        }
      } catch (error) {
        logger.error('Scheduled campaign failed:', error);
      }
    }, delay);
  }
}
