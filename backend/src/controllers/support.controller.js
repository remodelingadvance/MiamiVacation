import { ChatConversation, ChatMessage, BusinessKnowledge } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { answerSupportQuestion } from '../services/supportRag.service.js';
import {
  addMessageToConversation,
  assertConversationAccess,
  createConversation,
  getConversationForAccess,
  isAdminUser,
  markConversationRead,
  serializeConversation,
  serializeMessage,
} from '../services/supportChat.service.js';

const getGuestSessionId = (req) =>
  req.body?.guestSessionId ||
  req.headers['x-guest-session-id'] ||
  req.query?.guestSessionId;

const getIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress;

const pagination = (page = 1, limit = 20) => {
  const normalizedPage = Math.max(parseInt(page, 10) || 1, 1);
  const normalizedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
  };
};

const buildConversationQuery = ({ status, priority, assignedTo, search }) => {
  const query = {};

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [
      { conversationId: regex },
      { subject: regex },
      { 'customer.name': regex },
      { 'customer.email': regex },
      { 'lastMessage.text': regex },
      { tags: regex },
    ];
  }

  return query;
};

// @desc    Ask Gemini-powered RAG assistant
// @route   POST /api/v1/support/ai/ask
// @access  Public/Optional auth
export const askAi = catchAsync(async (req, res) => {
  const { message } = req.body;
  const answer = await answerSupportQuestion({ message });
  const guestSessionId = getGuestSessionId(req);

  const aiConversation = await ChatConversation.create({
    channel: 'ai',
    customer: {
      user: req.user?._id,
      guestSessionId,
      name: req.user ? `${req.user.firstName} ${req.user.lastName}` : undefined,
      email: req.user?.email,
      phone: req.user?.phone,
      ip: getIp(req),
      userAgent: req.headers['user-agent'],
    },
    subject: 'AI booking assistance',
    status: 'resolved',
    resolvedAt: new Date(),
    lastMessage: {
      text: answer.answer,
      senderType: 'ai',
      at: new Date(),
    },
    metadata: {
      source: 'ai-widget',
      currentUrl: req.body.currentUrl,
      locale: req.body.locale,
      referrer: req.headers.referer,
    },
  }).catch(() => null);

  if (aiConversation) {
    await ChatMessage.insertMany([
      {
        conversation: aiConversation._id,
        senderType: 'customer',
        sender: req.user?._id,
        guestSessionId,
        body: message,
        status: 'delivered',
        deliveredAt: new Date(),
      },
      {
        conversation: aiConversation._id,
        senderType: 'ai',
        body: answer.answer,
        status: 'delivered',
        deliveredAt: new Date(),
        metadata: {
          model: answer.model,
          sources: answer.sources.map((source) => `${source.type}:${source.id}`),
          currentUrl: req.body.currentUrl,
          ip: getIp(req),
          userAgent: req.headers['user-agent'],
        },
      },
    ]).catch(() => null);
  }

  res.status(200).json({
    success: true,
    answer: answer.answer,
    sources: answer.sources,
    grounded: answer.grounded,
    model: answer.model,
    latencyMs: answer.latencyMs,
    aiConversationId: aiConversation?._id,
  });
});

// @desc    Create support conversation
// @route   POST /api/v1/support/conversations
// @access  Public/Optional auth
export const createSupportConversation = catchAsync(async (req, res) => {
  const guestSessionId = getGuestSessionId(req);

  if (!req.user && !guestSessionId) {
    return res.status(400).json({
      success: false,
      message: 'Guest session is required for visitor chat.',
    });
  }

  const conversation = await createConversation({
    user: req.user,
    guestSessionId,
    customer: req.body.customer || {},
    subject: req.body.subject,
    property: req.body.property,
    booking: req.body.booking,
    currentUrl: req.body.currentUrl,
    locale: req.body.locale,
    referrer: req.headers.referer,
    ip: getIp(req),
    userAgent: req.headers['user-agent'],
  });

  let message = null;
  if (req.body.message) {
    const result = await addMessageToConversation({
      conversation,
      senderType: 'customer',
      sender: req.user,
      guestSessionId,
      body: req.body.message,
      metadata: {
        currentUrl: req.body.currentUrl,
        ip: getIp(req),
        userAgent: req.headers['user-agent'],
      },
    });
    message = result.message;
  }

  res.status(201).json({
    success: true,
    conversation: serializeConversation(conversation),
    message: message ? serializeMessage(message) : null,
  });
});

// @desc    Get support conversation
// @route   GET /api/v1/support/conversations/:conversationId
// @access  Customer owner or admin
export const getSupportConversation = catchAsync(async (req, res) => {
  const conversation = await getConversationForAccess(req.params.conversationId, {
    user: req.user,
    guestSessionId: getGuestSessionId(req),
  });

  const messages = await ChatMessage.find({ conversation: conversation._id })
    .sort({ createdAt: 1 })
    .limit(250)
    .populate('sender', 'firstName lastName email role')
    .lean();

  res.status(200).json({
    success: true,
    conversation: serializeConversation(conversation),
    messages: messages.map(serializeMessage),
  });
});

// @desc    Customer sends support message
// @route   POST /api/v1/support/conversations/:conversationId/messages
// @access  Customer owner
export const sendCustomerSupportMessage = catchAsync(async (req, res) => {
  const guestSessionId = getGuestSessionId(req);
  const conversation = await getConversationForAccess(req.params.conversationId, {
    user: req.user,
    guestSessionId,
  });

  if (isAdminUser(req.user)) {
    return res.status(400).json({
      success: false,
      message: 'Use the admin reply endpoint for administrator messages.',
    });
  }

  const { message } = await addMessageToConversation({
    conversation,
    senderType: 'customer',
    sender: req.user,
    guestSessionId,
    body: req.body.message,
    attachments: req.body.attachments,
    metadata: {
      currentUrl: req.body.currentUrl,
      ip: getIp(req),
      userAgent: req.headers['user-agent'],
    },
  });

  res.status(201).json({
    success: true,
    message: serializeMessage(message),
  });
});

// @desc    Admin list conversations
// @route   GET /api/v1/support/admin/conversations
// @access  Admin
export const listAdminConversations = catchAsync(async (req, res) => {
  const { page, limit, skip } = pagination(req.query.page, req.query.limit);
  const query = buildConversationQuery(req.query);

  const [conversations, total] = await Promise.all([
    ChatConversation.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'firstName lastName email role')
      .populate('customer.user', 'firstName lastName email phone')
      .populate('property', 'name slug location pricing')
      .lean(),
    ChatConversation.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    conversations: conversations.map(serializeConversation),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Admin reply to conversation
// @route   POST /api/v1/support/admin/conversations/:conversationId/messages
// @access  Admin
export const sendAdminSupportMessage = catchAsync(async (req, res) => {
  const conversation = await getConversationForAccess(req.params.conversationId, {
    user: req.user,
  });

  const { message } = await addMessageToConversation({
    conversation,
    senderType: 'admin',
    sender: req.user,
    body: req.body.message,
    attachments: req.body.attachments,
    notifyTelegram: false,
  });

  res.status(201).json({
    success: true,
    message: serializeMessage(message),
  });
});

// @desc    Admin update assignment/status/archive
// @route   PATCH /api/v1/support/admin/conversations/:conversationId
// @access  Admin
export const updateAdminConversation = catchAsync(async (req, res) => {
  const conversation = await getConversationForAccess(req.params.conversationId, {
    user: req.user,
  });

  const { status, priority, assignedTo, tags } = req.body;
  if (status) {
    conversation.status = status;
    if (status === 'resolved') conversation.resolvedAt = new Date();
    if (status === 'archived') conversation.archivedAt = new Date();
    if (status === 'open') {
      conversation.resolvedAt = undefined;
      conversation.archivedAt = undefined;
    }
  }

  if (priority) conversation.priority = priority;
  if (assignedTo !== undefined) conversation.assignedTo = assignedTo || undefined;
  if (Array.isArray(tags)) conversation.tags = tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);

  await conversation.save();

  res.status(200).json({
    success: true,
    conversation: serializeConversation(conversation),
  });
});

// @desc    Mark support conversation read
// @route   PATCH /api/v1/support/conversations/:conversationId/read
// @access  Customer owner or admin
export const markSupportRead = catchAsync(async (req, res) => {
  const conversation = await getConversationForAccess(req.params.conversationId, {
    user: req.user,
    guestSessionId: getGuestSessionId(req),
  });

  const readerType = isAdminUser(req.user) ? 'admin' : 'customer';
  await markConversationRead({ conversation, readerType, reader: req.user });

  res.status(200).json({
    success: true,
    conversation: serializeConversation(conversation),
  });
});

// @desc    Admin support analytics
// @route   GET /api/v1/support/admin/analytics
// @access  Admin
export const getSupportAnalytics = catchAsync(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    total,
    open,
    archived,
    unread,
    byStatus,
    byPriority,
    recentMessages,
  ] = await Promise.all([
    ChatConversation.countDocuments(),
    ChatConversation.countDocuments({ status: { $in: ['open', 'pending'] } }),
    ChatConversation.countDocuments({ status: 'archived' }),
    ChatConversation.countDocuments({ 'unread.admin': { $gt: 0 }, status: { $ne: 'archived' } }),
    ChatConversation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    ChatConversation.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    ChatMessage.countDocuments({ createdAt: { $gte: since } }),
  ]);

  res.status(200).json({
    success: true,
    analytics: {
      total,
      open,
      archived,
      unread,
      recentMessages,
      byStatus,
      byPriority,
    },
  });
});

// @desc    Admin manage approved knowledge records
// @route   GET/POST /api/v1/support/admin/knowledge
// @access  Admin
export const listKnowledge = catchAsync(async (req, res) => {
  const records = await BusinessKnowledge.find()
    .sort({ isApproved: -1, priority: -1, updatedAt: -1 })
    .limit(200)
    .lean();

  res.status(200).json({
    success: true,
    records,
  });
});

export const upsertKnowledge = catchAsync(async (req, res) => {
  const payload = {
    category: req.body.category,
    title: req.body.title,
    question: req.body.question,
    answer: req.body.answer,
    tags: req.body.tags,
    source: req.body.source,
    isApproved: Boolean(req.body.isApproved),
    priority: req.body.priority,
    updatedBy: req.user._id,
  };

  const record = req.body.id
    ? await BusinessKnowledge.findByIdAndUpdate(req.body.id, payload, { new: true, runValidators: true })
    : await BusinessKnowledge.create(payload);

  if (!record) {
    throw new AppError('Knowledge record not found.', 404);
  }

  res.status(req.body.id ? 200 : 201).json({
    success: true,
    record,
  });
});

export const ensureConversationAccess = (req, conversation) => {
  assertConversationAccess(conversation, {
    user: req.user,
    guestSessionId: getGuestSessionId(req),
  });
};
