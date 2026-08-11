import AppError from '../utils/AppError.js';

const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const allowedOrigins = () => new Set([
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'https://www.staywise.miami',
  'https://staywise.miami',
  'https://admin.staywise.miami',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean));

export const csrfOriginGuard = (req, res, next) => {
  if (!mutatingMethods.has(req.method)) return next();

  // The app primarily uses Authorization bearer tokens. CSRF matters when a
  // browser cookie is used as the credential.
  if (!req.cookies?.token) return next();

  const origin = req.headers.origin;
  if (!origin) return next();

  if (!allowedOrigins().has(origin)) {
    return next(new AppError('Invalid request origin.', 403));
  }

  next();
};
