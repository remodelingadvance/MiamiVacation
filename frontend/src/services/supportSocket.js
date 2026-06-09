import { io } from 'socket.io-client';
import { getToken } from '../utils/auth';
import { getGuestSessionId } from '../utils/supportSession';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const inferSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  return API_BASE_URL.replace(/\/api\/v1\/?$/, '');
};

let socket;
let socketAuthKey;

export const getSupportSocket = () => {
  const token = getToken();
  const guestSessionId = getGuestSessionId();
  const nextAuthKey = `${token || 'guest'}:${guestSessionId}`;

  if (socket?.connected && socketAuthKey === nextAuthKey) return socket;

  if (socket) {
    socket.disconnect();
  }

  socket = io(inferSocketUrl(), {
    autoConnect: true,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: {
      token,
      guestSessionId,
    },
  });
  socketAuthKey = nextAuthKey;

  return socket;
};

export const disconnectSupportSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketAuthKey = null;
  }
};
