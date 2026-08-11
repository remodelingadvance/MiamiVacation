import crypto from 'crypto';

export const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token || '')).digest('hex');

export const tokenMatchesStoredHash = (token, storedToken) => {
  if (!token || !storedToken) return false;

  const hashedToken = hashToken(token);

  if (storedToken.length === hashedToken.length) {
    return crypto.timingSafeEqual(Buffer.from(hashedToken), Buffer.from(storedToken));
  }

  // Backward compatibility for existing plaintext refresh tokens. The next
  // successful refresh/login rotates the stored value to a hash.
  return storedToken === token;
};
