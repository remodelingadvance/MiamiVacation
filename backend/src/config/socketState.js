let socketServer = null;

export const setSocketServer = (io) => {
  socketServer = io;
};

export const getSocketServer = () => {
  if (!socketServer) {
    throw new Error('Socket.io not initialized');
  }
  return socketServer;
};

export const hasSocketServer = () => Boolean(socketServer);
