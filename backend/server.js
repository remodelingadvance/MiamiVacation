import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const requiredProductionEnv = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FIELD_ENCRYPTION_KEY',
  'FRONTEND_URL',
  'ADMIN_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'BREVO_SENDER_EMAIL',
  'BREVO_SENDER_NAME',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'GEMINI_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_ADMIN_CHAT_ID',
  'ADMIN_DEEP_LINK_SECRET',
];

const validateProductionEnv = () => {
  if (process.env.NODE_ENV !== 'production') return;

  const missing = requiredProductionEnv.filter((key) => !process.env[key]);
  const localUrlKeys = ['FRONTEND_URL', 'ADMIN_URL'];
  const localUrls = localUrlKeys.filter((key) => /localhost|127\.0\.0\.1|^http:\/\//i.test(process.env[key] || ''));

  if (missing.length || localUrls.length) {
    console.error('Production environment is not ready.');
    if (missing.length) console.error(`Missing variables: ${missing.join(', ')}`);
    if (localUrls.length) console.error(`Production URLs must be public HTTPS URLs: ${localUrls.join(', ')}`);
    process.exit(1);
  }
};

validateProductionEnv();

const [
  { default: app },
  { default: connectDB },
  { initializeSocket },
  { assertFieldEncryptionReady },
] = await Promise.all([
  import('./src/app.js'),
  import('./src/config/database.js'),
  import('./src/config/socket.js'),
  import('./src/utils/fieldEncryption.js'),
]);

assertFieldEncryptionReady();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION. Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

connectDB();

const httpServer = createServer(app);
initializeSocket(httpServer);

const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`API prefix: ${API_PREFIX}`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION. Shutting down...');
  console.error(err.name, err.message);
  httpServer.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully.');
  httpServer.close(() => {
    console.log('Process terminated.');
  });
});
