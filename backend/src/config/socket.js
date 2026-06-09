import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ChatConversation, Notification, User } from '../models/index.js';
import logger from '../utils/logger.js';
import { setSocketServer, getSocketServer } from './socketState.js';
import {
  addMessageToConversation,
  getConversationForAccess,
  isAdminUser,
  markConversationRead,
  serializeMessage,
  serializeConversation,
  supportRoom,
} from '../services/supportChat.service.js';

let io;

const getHandshakeToken = (socket) =>
  socket.handshake.auth?.token || socket.handshake.query?.token;

const getHandshakeGuestSession = (socket) =>
  socket.handshake.auth?.guestSessionId || socket.handshake.query?.guestSessionId;

const ack = (callback, payload) => {
  if (typeof callback === 'function') callback(payload);
};

const getSupportContext = (socket, payload = {}) => ({
  user: socket.user,
  guestSessionId: payload.guestSessionId || socket.guestSessionId,
});

const addSocketConversation = (socket, conversationId) => {
  const current = socket.data.supportConversations || new Set();
  current.add(conversationId.toString());
  socket.data.supportConversations = current;
};

const updatePresence = async ({ socket, conversation, online }) => {
  if (!conversation) return;

  if (isAdminUser(socket.user)) {
    const adminId = socket.user._id;
    const admins = (conversation.online?.admins || []).map((id) => id.toString());
    conversation.online = conversation.online || {};

    if (online && !admins.includes(adminId.toString())) {
      conversation.online.admins = [...(conversation.online.admins || []), adminId];
    }

    if (!online) {
      conversation.online.admins = (conversation.online.admins || []).filter(
        (id) => id.toString() !== adminId.toString()
      );
    }

    conversation.online.lastAdminSeenAt = new Date();
  } else {
    conversation.online = conversation.online || {};
    conversation.online.customer = online;
    conversation.online.lastCustomerSeenAt = new Date();
  }

  await conversation.save();

  io.to(supportRoom(conversation._id)).emit('support:presence', {
    conversationId: conversation._id,
    online: conversation.online,
  });
};

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL, 'http://localhost:3000', 'http://localhost:3001'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  setSocketServer(io);

  io.use(async (socket, next) => {
    try {
      const token = getHandshakeToken(socket);
      const guestSessionId = getHandshakeGuestSession(socket);

      if (!token && !guestSessionId) {
        return next(new Error('Authentication or guest support session required'));
      }

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user || user.isActive === false) {
          return next(new Error('User not found'));
        }

        socket.user = user;
      }

      socket.guestSessionId = guestSessionId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const connectedAs = socket.user
      ? `${socket.user._id} (${socket.user.role})`
      : `guest:${socket.guestSessionId}`;
    logger.info(`Socket connected: ${connectedAs}`);

    if (socket.user) {
      socket.join(`user:${socket.user._id}`);
    }

    if (isAdminUser(socket.user)) {
      socket.join('admin');
      socket.join('admin:notifications');
      socket.join('admin:dashboard');
      socket.join('admin:support');
    }

    socket.on('join:property', (propertyId) => {
      if (propertyId) socket.join(`property:${propertyId}`);
    });

    socket.on('leave:property', (propertyId) => {
      if (propertyId) socket.leave(`property:${propertyId}`);
    });

    socket.on('support:join', async (payload = {}, callback) => {
      try {
        const conversation = await getConversationForAccess(
          payload.conversationId,
          getSupportContext(socket, payload)
        );

        socket.join(supportRoom(conversation._id));
        addSocketConversation(socket, conversation._id);
        await updatePresence({ socket, conversation, online: true });

        ack(callback, {
          success: true,
          conversation: serializeConversation(conversation),
        });
      } catch (error) {
        ack(callback, { success: false, message: error.message });
      }
    });

    socket.on('support:message', async (payload = {}, callback) => {
      try {
        if (isAdminUser(socket.user)) {
          throw new Error('Use support:admin-message for admin replies');
        }

        const conversation = await getConversationForAccess(
          payload.conversationId,
          getSupportContext(socket, payload)
        );

        const result = await addMessageToConversation({
          conversation,
          senderType: 'customer',
          sender: socket.user,
          guestSessionId: payload.guestSessionId || socket.guestSessionId,
          body: payload.message,
          attachments: payload.attachments,
          metadata: {
            currentUrl: payload.currentUrl,
          },
        });

        ack(callback, {
          success: true,
          message: serializeMessage(result.message),
          conversation: serializeConversation(result.conversation),
        });
      } catch (error) {
        ack(callback, { success: false, message: error.message });
      }
    });

    socket.on('support:admin-message', async (payload = {}, callback) => {
      try {
        if (!isAdminUser(socket.user)) {
          throw new Error('Admin access required');
        }

        const conversation = await getConversationForAccess(payload.conversationId, { user: socket.user });
        const result = await addMessageToConversation({
          conversation,
          senderType: 'admin',
          sender: socket.user,
          body: payload.message,
          attachments: payload.attachments,
          notifyTelegram: false,
        });

        ack(callback, {
          success: true,
          message: serializeMessage(result.message),
          conversation: serializeConversation(result.conversation),
        });
      } catch (error) {
        ack(callback, { success: false, message: error.message });
      }
    });

    socket.on('support:typing', async (payload = {}) => {
      try {
        const conversation = await getConversationForAccess(
          payload.conversationId,
          getSupportContext(socket, payload)
        );

        socket.to(supportRoom(conversation._id)).emit('support:typing', {
          conversationId: conversation._id,
          senderType: isAdminUser(socket.user) ? 'admin' : 'customer',
          isTyping: Boolean(payload.isTyping),
          user: socket.user ? {
            id: socket.user._id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
            role: socket.user.role,
          } : null,
        });
      } catch {
        // Typing events are best-effort.
      }
    });

    socket.on('support:read', async (payload = {}, callback) => {
      try {
        const conversation = await getConversationForAccess(
          payload.conversationId,
          getSupportContext(socket, payload)
        );
        const readerType = isAdminUser(socket.user) ? 'admin' : 'customer';
        await markConversationRead({ conversation, readerType, reader: socket.user });
        ack(callback, { success: true });
      } catch (error) {
        ack(callback, { success: false, message: error.message });
      }
    });

    socket.on('admin:mark-notification-read', async (notificationId) => {
      try {
        if (!isAdminUser(socket.user)) return;
        const notification = await Notification.findByIdAndUpdate(
          notificationId,
          { read: true, readAt: new Date() },
          { new: true }
        );
        socket.emit('admin:notification-updated', notification);
      } catch {
        socket.emit('error', { message: 'Failed to update notification' });
      }
    });

    socket.on('admin:mark-all-read', async () => {
      try {
        if (!isAdminUser(socket.user)) return;
        await Notification.updateMany(
          { read: false },
          { read: true, readAt: new Date() }
        );
        socket.emit('admin:all-marked-read');
      } catch {
        socket.emit('error', { message: 'Failed to update notifications' });
      }
    });

    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${connectedAs}`);
      const joinedConversations = Array.from(socket.data.supportConversations || []);

      await Promise.allSettled(joinedConversations.map(async (conversationId) => {
        const conversation = await ChatConversation.findById(conversationId);
        if (conversation) {
          await updatePresence({ socket, conversation, online: false });
        }
      }));
    });
  });

  return io;
};

export const getIO = () => getSocketServer();

export const emitNotification = (event, data, room = null) => {
  if (!io) return;

  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
};

export const emitAdminNotification = (event, data) => {
  emitNotification(event, data, 'admin:notifications');
};

export const emitUserNotification = (userId, event, data) => {
  emitNotification(event, data, `user:${userId}`);
};

export default { initializeSocket, getIO, emitNotification, emitAdminNotification, emitUserNotification };
