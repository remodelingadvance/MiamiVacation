import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import emailService from '../utils/emailService.js';
import logger from '../utils/logger.js';

// @desc    Register user
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 400));
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
  });

  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    await emailService.send({
      to: user.email,
      subject: 'Verify Your Email - Miami Luxury Rentals',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Miami Luxury Rentals! 🌴</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName},</h2>
              <p>Thank you for creating an account. Please verify your email address to get started.</p>
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
              <p style="margin-top: 20px;">If you didn't create this account, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    logger.error('Email sending failed during signup:', error);
    
    // Still create user but mark as unverified
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      message: 'Registration successful! However, verification email could not be sent. Please contact support.',
      token,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if account is locked
  if (user.isAccountLocked()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return next(
      new AppError(`Account temporarily locked. Please try again in ${minutesLeft} minutes.`, 423)
    );
  }

  // Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    await user.incrementLoginAttempts();
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if account is active
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403));
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  }

  // Update last login
  user.lastLogin = Date.now();

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Remove password from output
  user.password = undefined;

  res.status(200).json({
    success: true,
    token,
    refreshToken,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified,
      favorites: user.favorites,
      preferences: user.preferences,
    },
  });
});

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
export const verifyEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired verification token', 400));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Send welcome email
  try {
    await emailService.send({
      to: user.email,
      subject: 'Email Verified - Welcome to Miami Luxury Rentals!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verified! ✅</h1>
            </div>
            <div class="content">
              <h2>Welcome aboard, ${user.firstName}!</h2>
              <p>Your email has been verified. You now have full access to Miami Luxury Rentals.</p>
              <p>Start browsing our exclusive collection of luxury properties in Miami!</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    logger.error('Welcome email failed:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Return success even if email doesn't exist (security)
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send reset email
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await emailService.send({
      to: user.email,
      subject: 'Password Reset Request - Miami Luxury Rentals',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .warning { color: #f5576c; margin-top: 20px; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request 🔐</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName},</h2>
              <p>You requested a password reset. Click the button below to reset your password:</p>
              <a href="${resetUrl}" class="button">Reset Password</a>
              <p class="warning">⚠️ This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email',
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    logger.error('Password reset email failed:', error);
    return next(new AppError('There was an error sending the email. Please try again later.', 500));
  }
});

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  // Send confirmation email
  try {
    await emailService.send({
      to: user.email,
      subject: 'Password Reset Successful - Miami Luxury Rentals',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Successful ✅</h1>
            </div>
            <div class="content">
              <h2>Hello ${user.firstName},</h2>
              <p>Your password has been successfully reset. You can now log in with your new password.</p>
              <p>If you didn't make this change, please contact our support team immediately.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    logger.error('Password reset confirmation email failed:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken: requestRefreshToken } = req.body;

  if (!requestRefreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  try {
    const decoded = jwt.verify(requestRefreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== requestRefreshToken) {
      return next(new AppError('Invalid refresh token', 401));
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = catchAsync(async (req, res, next) => {
  // Clear refresh token in database
  req.user.refreshToken = undefined;
  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('favorites')
    .populate('bookings');

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Update current user profile
// @route   PATCH /api/v1/auth/update-profile
// @access  Private
export const updateProfile = catchAsync(async (req, res, next) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'preferences'];
  const updates = {};

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    user,
  });
});

// @desc    Update password
// @route   PATCH /api/v1/auth/update-password
// @access  Private
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Send notification email
  try {
    await emailService.send({
      to: user.email,
      subject: 'Password Changed - Miami Luxury Rentals',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Password Changed</h2>
              <p>Hello ${user.firstName},</p>
              <p>Your password was successfully changed. If you did not make this change, please contact us immediately.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    logger.error('Password change notification failed:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    token,
    refreshToken,
  });
});