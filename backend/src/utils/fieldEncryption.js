import crypto from 'crypto';

const ENCRYPTION_PREFIX = 'enc:v1:';
const KEY_BYTES = 32;

let cachedKey;

const decodeEncryptionKey = () => {
  const configuredKey = process.env.FIELD_ENCRYPTION_KEY?.trim();

  if (!configuredKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FIELD_ENCRYPTION_KEY is required in production for customer data encryption.');
    }
    return null;
  }

  const key = /^[a-f0-9]{64}$/i.test(configuredKey)
    ? Buffer.from(configuredKey, 'hex')
    : Buffer.from(configuredKey, 'base64');

  if (key.length !== KEY_BYTES) {
    throw new Error('FIELD_ENCRYPTION_KEY must decode to exactly 32 bytes.');
  }

  return key;
};

const getEncryptionKey = () => {
  if (cachedKey !== undefined) return cachedKey;
  cachedKey = decodeEncryptionKey();
  return cachedKey;
};

export const assertFieldEncryptionReady = () => {
  if (process.env.NODE_ENV === 'production') {
    getEncryptionKey();
  }
};

export const isEncryptedField = (value) =>
  typeof value === 'string' && value.startsWith(ENCRYPTION_PREFIX);

export const encryptField = (value) => {
  if (value === undefined || value === null || value === '') return value;

  const plaintext = String(value);
  if (isEncryptedField(plaintext)) return plaintext;

  const key = getEncryptionKey();
  if (!key) return plaintext;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext.toString('base64')}`;
};

export const decryptField = (value) => {
  if (!isEncryptedField(value)) return value;

  const key = getEncryptionKey();
  if (!key) return value;

  try {
    const [, , iv, authTag, ciphertext] = value.split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    throw new Error('Encrypted field could not be decrypted. Check FIELD_ENCRYPTION_KEY.');
  }
};

export const encryptedString = (options = {}) => ({
  type: String,
  ...options,
  set: encryptField,
  get: decryptField,
});

export const encryptDocumentPaths = (doc, paths = []) => {
  paths.forEach((path) => {
    const rawValue = doc.get(path, null, { getters: false });
    if (typeof rawValue === 'string' && rawValue && !isEncryptedField(rawValue)) {
      doc.set(path, rawValue);
    }
  });
};
