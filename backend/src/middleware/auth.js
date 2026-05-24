import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

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

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User recently changed password. Please log in again.', 401));
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return next(new AppError('Your account is temporarily locked. Please try again later.', 423));
    }

    // Check if account is active
    if (!user.isActive) {
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
      if (user && user.isActive) {
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

    if (!user || user.refreshToken !== refreshToken) {
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
    
    if (user && user.isAccountLocked()) {
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