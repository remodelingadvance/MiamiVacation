import mongoose from 'mongoose';
import { ChatConversation, ChatMessage, Notification } from '../models/index.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { getSocketServer } from '../config/socketState.js';
import { notifyTelegramForCustomerMessage } from './telegram.service.js';

export const supportRoom = (conversationId) => `support:conversation:${conversationId}`;

export const isAdminUser = (user) => user?.role === 'admin' || user?.role === 'super-admin';

const getSocket = () => {
  try {
    return getSocketServer();
  } catch {
    return null;
  }
};

const cleanText = (value = '') => String(value).trim().slice(0, 4000);

const normalizeAttachments = (attachments = []) => {
  if (!Array.isArray(attachments)) return [];

  return attachments
    .filter((item) => item?.url)
    .slice(0, 5)
    .map((item) => ({
      url: String(item.url).trim(),
      fileName: item.fileName ? String(item.fileName).trim().slice(0, 180) : undefined,
      mimeType: item.mimeType ? String(item.mimeType).trim().slice(0, 120) : undefined,
      size: Number(item.size || 0),
      publicId: item.publicId,
    }));
};

export const serializeMessage = (message) => ({
  id: message._id,
  messageId: message.messageId,
  conversation: message.conversation,
  senderType: message.senderType,
  sender: message.sender,
  guestSessionId: message.guestSessionId,
  body: message.body,
  attachments: message.attachments || [],
  status: message.status,
  deliveredAt: message.deliveredAt,
  readAt: message.readAt,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

export const serializeConversation = (conversation) => ({
  id: conversation._id,
  conversationId: conversation.conversationId,
  channel: conversation.channel,
  customer: conversation.customer,
  property: conversation.property,
  booking: conversation.booking,
  subject: conversation.subject,
  status: conversation.status,
  priority: conversation.priority,
  assignedTo: conversation.assignedTo,
  tags: conversation.tags || [],
  lastMessage: conversation.lastMessage,
  unread: conversation.unread,
  online: conversation.online,
  metadata: conversation.metadata,
  archivedAt: conversation.archivedAt,
  resolvedAt: conversation.resolvedAt,
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
});

export const canAccessConversation = (conversation, { user, guestSessionId }) => {
  if (!conversation) return false;
  if (isAdminUser(user)) return true;
  if (user && conversation.customer?.user?.toString() === user._id.toString()) return true;
  if (guestSessionId && conversation.customer?.guestSessionId === guestSessionId) return true;
  return false;
};

export const assertConversationAccess = (conversation, context) => {
  if (!canAccessConversation(conversation, context)) {
    throw new AppError('You do not have access to this conversation.', 403);
  }
};

export const getConversationForAccess = async (conversationId, context) => {
  const query = mongoose.Types.ObjectId.isValid(conversationId)
    ? { _id: conversationId }
    : { conversationId };

  const conversation = await ChatConversation.findOne(query);

  if (!conversation) {
    throw new AppError('Conversation not found.', 404);
  }

  assertConversationAccess(conversation, context);
  return conversation;
};

export const createConversation = async ({
  user,
  guestSessionId,
  customer = {},
  subject,
  property,
  booking,
  currentUrl,
  locale,
  referrer,
  ip,
  userAgent,
}) => {
  return ChatConversation.create({
    channel: 'admin',
    customer: {
      user: user?._id,
      guestSessionId,
      name: customer.name || (user ? `${user.firstName} ${user.lastName}` : undefined),
      email: customer.email || user?.email,
      phone: customer.phone || user?.phone,
      ip,
      userAgent,
    },
    subject: subject || 'Booking assistance',
    property,
    booking,
    metadata: {
      currentUrl,
      locale,
      referrer,
      source: 'website',
    },
  });
};

export const addMessageToConversation = async ({
  conversation,
  senderType,
  sender,
  guestSessionId,
  body,
  attachments,
  metadata,
  notifyTelegram = true,
}) => {
  const text = cleanText(body);
  const normalizedAttachments = normalizeAttachments(attachments);

  if (!text && !normalizedAttachments.length) {
    throw new AppError('Message text or attachment is required.', 400);
  }

  const message = await ChatMessage.create({
    conversation: conversation._id,
    senderType,
    sender: sender?._id,
    guestSessionId,
    body: text,
    attachments: normalizedAttachments,
    status: 'delivered',
    deliveredAt: new Date(),
    metadata,
  });

  conversation.lastMessage = {
    text: text || '[attachment]',
    senderType,
    at: message.createdAt,
  };

  if (senderType === 'customer') {
    conversation.unread.admin = (conversation.unread.admin || 0) + 1;
    conversation.status = conversation.status === 'archived' ? 'open' : conversation.status;
  }

  if (senderType === 'admin') {
    conversation.unread.customer = (conversation.unread.customer || 0) + 1;
    conversation.status = conversation.status === 'archived' ? 'open' : conversation.status;
  }

  await conversation.save();

  const io = getSocket();
  const adminUnreadConversations = senderType === 'customer'
    ? await ChatConversation.countDocuments({ 'unread.admin': { $gt: 0 }, status: { $ne: 'archived' } })
    : undefined;
  const payload = {
    conversation: serializeConversation(conversation),
    message: serializeMessage(message),
    adminUnreadConversations,
  };

  if (io) {
    io.to(supportRoom(conversation._id)).emit('support:message', payload);
    io.to('admin:support').emit('support:conversation-updated', payload);
  }

  if (notifyTelegram && senderType === 'customer') {
    Notification.createNotification({
      type: 'admin_message',
      title: 'New support message',
      message: `${conversation.customer?.name || conversation.customer?.email || 'Guest'}: ${text || '[attachment]'}`,
      priority: conversation.priority === 'urgent' ? 'urgent' : 'high',
      data: {
        conversationId: conversation._id,
        publicConversationId: conversation.conversationId,
        customerEmail: conversation.customer?.email,
      },
      link: `/admin/support?chat=${conversation._id}`,
      isAdmin: true,
    }).catch((error) => {
      logger.error('Support notification creation failed:', error);
    });

    notifyTelegramForCustomerMessage({ conversation, message }).catch((error) => {
      logger.error('Telegram support notification error:', error);
    });
  }

  return { conversation, message };
};

export const markConversationRead = async ({ conversation, readerType, reader }) => {
  if (readerType === 'admin') {
    conversation.unread.admin = 0;
    conversation.online.lastAdminSeenAt = new Date();
  } else {
    conversation.unread.customer = 0;
    conversation.online.lastCustomerSeenAt = new Date();
  }

  await conversation.save();

  await ChatMessage.updateMany(
    {
      conversation: conversation._id,
      senderType: readerType === 'admin' ? 'customer' : 'admin',
      status: { $ne: 'read' },
    },
    {
      status: 'read',
      readAt: new Date(),
    }
  );

  const io = getSocket();
  if (io) {
    io.to(supportRoom(conversation._id)).emit('support:read', {
      conversationId: conversation._id,
      readerType,
      readerId: reader?._id,
    });
  }

  return conversation;
};
