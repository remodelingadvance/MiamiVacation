// middleware/auth.js - Fixed version without Redis dependency
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { tokenMatchesStoredHash } from '../utils/tokenSecurity.js';

// Simple in-memory token blacklist (clears on server restart)
// For production with multiple servers, use a database table instead
const tokenBlacklist = new Map();

// Clean up expired tokens every hour
setInterval(() => {
  const now = Date.now();
  for (const [token, expiry] of tokenBlacklist.entries()) {
    if (expiry < now) {
      tokenBlacklist.delete(token);
    }
  }
}, 60 * 60 * 1000);

// Helper function to blacklist token
export const blacklistToken = async (token, expiryInSeconds = 86400) => {
  tokenBlacklist.set(token, Date.now() + (expiryInSeconds * 1000));
};

// Helper function to check if token is blacklisted
export const isTokenBlacklisted = async (token) => {
  return tokenBlacklist.has(token);
};

// Protect routes - Verify JWT token
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // Check for token in Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
  }

  // Check if token is blacklisted
  const isBlacklisted = await isTokenBlacklisted(token);
  if (isBlacklisted) {
    return next(new AppError('Token has been invalidated. Please log in again.', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    if (Number(decoded.version || 0) !== Number(user.tokenVersion || 0)) {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password. Please log in again.', 401));
    }

    // Check if account is locked
    if (user.isAccountLocked && user.isAccountLocked()) {
      const minutesLeft = user.lockUntil ? Math.ceil((user.lockUntil - Date.now()) / 60000) : 15;
      return next(new AppError(`Your account is temporarily locked. Please try again in ${minutesLeft} minutes.`, 423));
    }

    // Check if account is active
    if (user.isActive === false) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 403));
    }

    // Grant access
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    return next(error);
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

// Optional auth - Attach user if token exists, but don't require it
export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive && Number(decoded.version || 0) === Number(user.tokenVersion || 0)) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid or expired - continue without user
    }
  }

  next();
});

// Verify refresh token
export const verifyRefreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !tokenMatchesStoredHash(refreshToken, user.refreshToken)) {
      return next(new AppError('Invalid refresh token', 401));
    }

    if (Number(decoded.version || 0) !== Number(user.tokenVersion || 0)) {
      return next(new AppError('Invalid refresh token', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
});

// Rate limit authentication attempts
export const authRateLimiter = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  if (email) {
    const user = await User.findOne({ email });
    
    if (user && user.isAccountLocked && user.isAccountLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return next(
        new AppError(
          `Account temporarily locked. Please try again in ${minutesLeft} minutes.`,
          429
        )
      );
    }
  }
  
  next();
});

// Verify email ownership
export const verifyEmailOwnership = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id || req.body.userId);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Only allow users to modify their own data unless admin
  if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
    if (user._id.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only modify your own data', 403));
    }
  }

  next();
});





// // middleware/auth.js - Enhanced production-ready version
// import jwt from 'jsonwebtoken';
// import { User } from '../models/index.js';
// import AppError from '../utils/AppError.js';
// import catchAsync from '../utils/catchAsync.js';
// import { redisClient } from '../config/redis.js';

// // Token blacklist storage (using Redis for production)
// const tokenBlacklist = new Set(); // Fallback for memory (use Redis in production)

// // Protect routes - Verify JWT token (ENHANCED)
// export const protect = catchAsync(async (req, res, next) => {
//   let token;

//   // Check for token in multiple locations
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.cookies?.token) {
//     token = req.cookies.token;
//   } else if (req.query?.token) {
//     token = req.query.token;
//   }

//   if (!token) {
//     return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
//   }

//   // Check if token is blacklisted (logged out)
//   const isBlacklisted = await isTokenBlacklisted(token);
//   if (isBlacklisted) {
//     return next(new AppError('Token has been invalidated. Please log in again.', 401));
//   }

//   try {
//     // Verify token with additional options
//     const decoded = jwt.verify(token, process.env.JWT_SECRET, {
//       algorithms: ['HS256'],
//       maxAge: process.env.JWT_EXPIRE || '30d'
//     });

//     // Validate token structure
//     if (!decoded.id || !decoded.iat) {
//       return next(new AppError('Invalid token structure. Please log in again.', 401));
//     }

//     // Check if user still exists and is active
//     const user = await User.findById(decoded.id).select('-password');
//     if (!user) {
//       return next(new AppError('The user belonging to this token no longer exists.', 401));
//     }

//     // Check if user changed password after token was issued
//     if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
//       return next(new AppError('User recently changed password. Please log in again.', 401));
//     }

//     // Check if account is locked
//     if (user.isAccountLocked && user.isAccountLocked()) {
//       const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
//       return next(new AppError(`Account is locked. Try again in ${minutesLeft} minutes.`, 423));
//     }

//     // Check if account is active
//     if (user.isActive === false) {
//       return next(new AppError('Your account has been deactivated. Please contact support.', 403));
//     }

//     // Check if email is verified (optional - enable as needed)
//     if (user.emailVerified === false && req.originalUrl !== '/api/v1/auth/verify-email') {
//       // return next(new AppError('Please verify your email before accessing this resource.', 403));
//       // Uncomment above to enforce email verification
//     }

//     // Check token version (if you have token versioning)
//     if (user.tokenVersion && decoded.version !== user.tokenVersion) {
//       return next(new AppError('Token has been revoked. Please log in again.', 401));
//     }

//     // Check token issued at (prevent token reuse after password change)
//     if (user.lastPasswordChange && decoded.iat < user.lastPasswordChange.getTime() / 1000) {
//       return next(new AppError('Password changed recently. Please log in again.', 401));
//     }

//     // Add token expiry info to request for logging
//     req.tokenExpiry = decoded.exp;
//     req.tokenIssuedAt = decoded.iat;
    
//     // Grant access
//     req.user = user;
//     req.token = token;
//     next();
//   } catch (error) {
//     if (error.name === 'JsonWebTokenError') {
//       return next(new AppError('Invalid token. Please log in again.', 401));
//     }
//     if (error.name === 'TokenExpiredError') {
//       return next(new AppError('Your session has expired. Please log in again.', 401));
//     }
//     if (error.name === 'NotBeforeError') {
//       return next(new AppError('Token not active yet. Please try again.', 401));
//     }
//     return next(error);
//   }
// });

// // Grant access to specific roles (ENHANCED)
// export const authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return next(new AppError('Authentication required', 401));
//     }
    
//     if (!roles.includes(req.user.role)) {
//       // Log unauthorized access attempt for security monitoring
//       console.warn(`Unauthorized access attempt: User ${req.user._id} (${req.user.role}) tried to access ${req.originalUrl}`);
//       return next(new AppError('You do not have permission to perform this action.', 403));
//     }
//     next();
//   };
// };

// // Optional auth - Attach user if token exists, but don't require it (ENHANCED)
// export const optionalAuth = catchAsync(async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   } else if (req.cookies?.token) {
//     token = req.cookies.token;
//   }

//   if (token) {
//     try {
//       // Check if token is blacklisted first
//       const isBlacklisted = await isTokenBlacklisted(token);
//       if (isBlacklisted) {
//         return next();
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id).select('-password');
      
//       if (user && user.isActive && !user.isAccountLocked?.()) {
//         req.user = user;
//       }
//     } catch (error) {
//       // Token invalid or expired - continue without user
//       console.debug('Optional auth token invalid:', error.message);
//     }
//   }

//   next();
// });

// // Verify refresh token (ENHANCED)
// export const verifyRefreshToken = catchAsync(async (req, res, next) => {
//   const { refreshToken } = req.body;

//   if (!refreshToken) {
//     return next(new AppError('Refresh token is required', 400));
//   }

//   try {
//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, {
//       algorithms: ['HS256']
//     });
    
//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return next(new AppError('User not found', 401));
//     }

//     // Check if refresh token matches stored token
//     if (user.refreshToken !== refreshToken) {
//       return next(new AppError('Invalid refresh token', 401));
//     }

//     // Check if refresh token is expired
//     if (user.refreshTokenExpiry && user.refreshTokenExpiry < Date.now()) {
//       return next(new AppError('Refresh token expired. Please log in again.', 401));
//     }

//     req.user = user;
//     req.refreshToken = refreshToken;
//     next();
//   } catch (error) {
//     if (error.name === 'JsonWebTokenError') {
//       return next(new AppError('Invalid refresh token', 401));
//     }
//     if (error.name === 'TokenExpiredError') {
//       return next(new AppError('Refresh token expired. Please log in again.', 401));
//     }
//     return next(error);
//   }
// });

// // Rate limit authentication attempts (ENHANCED)
// export const authRateLimiter = catchAsync(async (req, res, next) => {
//   const { email } = req.body;
  
//   if (email) {
//     const user = await User.findOne({ email });
    
//     if (user && user.isAccountLocked && user.isAccountLocked()) {
//       const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
//       return next(
//         new AppError(
//           `Account temporarily locked. Please try again in ${minutesLeft} minutes.`,
//           429
//         )
//       );
//     }
//   }
  
//   next();
// });

// // Verify email ownership (ENHANCED)
// export const verifyEmailOwnership = catchAsync(async (req, res, next) => {
//   const userId = req.params.id || req.body.userId || req.query.userId;
//   const user = await User.findById(userId);
  
//   if (!user) {
//     return next(new AppError('User not found', 404));
//   }

//   // Only allow users to modify their own data unless admin
//   const isAdmin = req.user.role === 'admin' || req.user.role === 'super-admin';
//   const isOwner = user._id.toString() === req.user._id.toString();
  
//   if (!isAdmin && !isOwner) {
//     return next(new AppError('You can only modify your own data', 403));
//   }

//   next();
// });

// // ============ HELPER FUNCTIONS ============

// // Token blacklist management (for logout)
// export const blacklistToken = async (token, expiryInSeconds = 86400) => {
//   // Store in Redis for production
//   if (redisClient && redisClient.connected) {
//     await redisClient.setex(`blacklist:${token}`, expiryInSeconds, 'blacklisted');
//   } else {
//     // Fallback for development
//     tokenBlacklist.add(token);
//     setTimeout(() => tokenBlacklist.delete(token), expiryInSeconds * 1000);
//   }
// };

// export const isTokenBlacklisted = async (token) => {
//   // Check Redis first
//   if (redisClient && redisClient.connected) {
//     const result = await redisClient.get(`blacklist:${token}`);
//     return result === 'blacklisted';
//   }
//   // Fallback for development
//   return tokenBlacklist.has(token);
// };

// // Validate token without throwing errors (for optional auth)
// export const validateToken = async (token) => {
//   try {
//     if (!token) return null;
    
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select('-password');
    
//     if (!user || !user.isActive) return null;
    
//     return { user, decoded };
//   } catch (error) {
//     return null;
//   }
// };

// // Get token expiry time
// export const getTokenExpiry = (token) => {
//   try {
//     const decoded = jwt.decode(token);
//     return decoded?.exp ? new Date(decoded.exp * 1000) : null;
//   } catch {
//     return null;
//   }
// };

// // Check if token is about to expire (within 5 minutes)
// export const isTokenExpiringSoon = (token) => {
//   const expiry = getTokenExpiry(token);
//   if (!expiry) return false;
//   const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
//   return expiry.getTime() < fiveMinutesFromNow;
// };

// // Middleware to refresh token if needed
// export const refreshTokenIfNeeded = catchAsync(async (req, res, next) => {
//   const token = req.token;
  
//   if (token && isTokenExpiringSoon(token)) {
//     // Generate new token
//     const newToken = generateToken(req.user._id);
//     res.setHeader('X-New-Token', newToken);
    
//     // Also set in cookie if using cookie auth
//     if (req.cookies?.token) {
//       res.cookie('token', newToken, {
//         expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict'
//       });
//     }
//   }
  
//   next();
// });

// // IP-based rate limiting for sensitive operations
// export const ipRateLimiter = (maxRequests = 10, windowMs = 60000) => {
//   const requests = new Map();
  
//   return (req, res, next) => {
//     const ip = req.ip || req.connection.remoteAddress;
//     const now = Date.now();
//     const windowStart = now - windowMs;
    
//     const userRequests = requests.get(ip) || [];
//     const recentRequests = userRequests.filter(time => time > windowStart);
    
//     if (recentRequests.length >= maxRequests) {
//       return next(new AppError('Too many requests from this IP. Please try again later.', 429));
//     }
    
//     recentRequests.push(now);
//     requests.set(ip, recentRequests);
    
//     // Clean up old entries periodically
//     if (Math.random() < 0.01) {
//       for (const [key, times] of requests.entries()) {
//         const validTimes = times.filter(time => time > Date.now() - windowMs);
//         if (validTimes.length === 0) {
//           requests.delete(key);
//         } else {
//           requests.set(key, validTimes);
//         }
//       }
//     }
    
//     next();
//   };
// };
