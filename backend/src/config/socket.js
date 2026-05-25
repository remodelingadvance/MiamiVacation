import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

let io;

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

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user._id} (${socket.user.role})`);

    // Join user-specific room
    socket.join(`user:${socket.user._id}`);

    // Join admin room for admin users
    if (socket.user.role === 'admin' || socket.user.role === 'super-admin') {
      socket.join('admin:notifications');
      socket.join('admin:dashboard');
    }

    // Join property room for real-time updates
    socket.on('join:property', (propertyId) => {
      if (propertyId) {
        socket.join(`property:${propertyId}`);
      }
    });

    // Leave property room
    socket.on('leave:property', (propertyId) => {
      if (propertyId) {
        socket.leave(`property:${propertyId}`);
      }
    });

    // Admin specific events
    socket.on('admin:mark-notification-read', async (notificationId) => {
      try {
        const notification = await Notification.findByIdAndUpdate(
          notificationId,
          { read: true, readAt: new Date() },
          { new: true }
        );
        socket.emit('admin:notification-updated', notification);
      } catch (error) {
        socket.emit('error', { message: 'Failed to update notification' });
      }
    });

    socket.on('admin:mark-all-read', async () => {
      try {
        await Notification.updateMany(
          { read: false },
          { read: true, readAt: new Date() }
        );
        socket.emit('admin:all-marked-read');
      } catch (error) {
        socket.emit('error', { message: 'Failed to update notifications' });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper function to emit notifications
export const emitNotification = (event, data, room = null) => {
  if (!io) return;
  
  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
};

// Emit to admin room
export const emitAdminNotification = (event, data) => {
  emitNotification(event, data, 'admin:notifications');
};

// Emit to specific user
export const emitUserNotification = (userId, event, data) => {
  emitNotification(event, data, `user:${userId}`);
};

export default { initializeSocket, getIO, emitNotification, emitAdminNotification, emitUserNotification };