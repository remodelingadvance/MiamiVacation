const SUPPORT_SESSION_KEY = 'staywise_support_session';

const createSessionId = () => {
  if (window.crypto?.randomUUID) {
    return `guest_${window.crypto.randomUUID()}`;
  }

  return `guest_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

export const getGuestSessionId = () => {
  let sessionId = localStorage.getItem(SUPPORT_SESSION_KEY);

  if (!sessionId) {
    sessionId = createSessionId();
    localStorage.setItem(SUPPORT_SESSION_KEY, sessionId);
  }

  return sessionId;
};

export const clearGuestSessionId = () => {
  localStorage.removeItem(SUPPORT_SESSION_KEY);
};
