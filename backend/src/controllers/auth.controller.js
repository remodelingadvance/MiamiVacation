import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import { hashToken, tokenMatchesStoredHash } from '../utils/tokenSecurity.js';
import emailService from '../utils/emailService.js';
import logger from '../utils/logger.js';
import { getFirebaseAuth } from '../config/firebaseAdmin.js';

const allowedFirebaseProviders = ['password', 'google.com', 'apple.com', 'phone', 'firebase'];

const normalizeFirebaseProvider = (provider) =>
  allowedFirebaseProviders.includes(provider) ? provider : 'firebase';

const splitDisplayName = (displayName = '', email = '') => {
  const fallbackName = email ? email.split('@')[0].replace(/[._-]+/g, ' ') : '';
  const parts = (displayName || fallbackName).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'Guest',
    lastName: parts.slice(1).join(' ') || 'Customer',
  };
};

const authUserPayload = (user) => ({
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
  address: user.address,
  authProviders: user.authProviders,
});

const issueAuthTokens = async (user) => {
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = hashToken(refreshToken);
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  return { token, refreshToken };
};

const getVerificationEmailFailureMessage = (error) => {
  const providerMessage = `${error?.response || ''} ${error?.message || ''}`;

  if (error?.responseCode === 525 || /unauthorized ip address/i.test(providerMessage)) {
    return 'Brevo rejected this server IP address. Add the backend/VPS outbound IP address to Brevo Authorized IPs, or disable unknown IP blocking, then request a new verification code.';
  }

  if (error?.code === 'EAUTH') {
    return 'Brevo SMTP authentication failed. Use the SMTP login and SMTP key from Brevo SMTP settings, not the API key or account password.';
  }

  if (error?.code === 'ECONNECTION' || error?.code === 'ETIMEDOUT') {
    return 'Could not connect to Brevo SMTP. Check SMTP host, port, TLS settings, and outbound SMTP firewall rules.';
  }

  return 'Verification email could not be sent. Please check the email provider configuration and try again.';
};

const sendVerificationCodeEmail = async (user, code) => {
  await emailService.send({
    to: user.email,
    subject: 'Your Stay Wise verification code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; font-family: Arial, sans-serif; color: #083344; background: #f6fbfc; }
          .container { max-width: 600px; margin: 0 auto; padding: 28px 16px; }
          .card { background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 18px 48px rgba(8, 51, 68, 0.10); }
          .header { background: #062B3A; color: #ffffff; padding: 28px; }
          .content { padding: 28px; }
          .code { margin: 24px 0; padding: 18px; border-radius: 14px; background: #FFF1F5; color: #FF4F7B; font-size: 34px; font-weight: 900; letter-spacing: 8px; text-align: center; }
          .muted { color: #6B8794; font-size: 14px; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <h1 style="margin:0;">Verify your email</h1>
              <p style="margin:8px 0 0;">Stay Wise account security</p>
            </div>
            <div class="content">
              <h2 style="margin-top:0;">Hello ${user.firstName},</h2>
              <p>Use this verification code to activate your account:</p>
              <div class="code">${code}</div>
              <p class="muted">This code expires in 15 minutes. If you did not create this account, you can safely ignore this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

// @desc    Register user with email verification code
// @route   POST /api/v1/auth/signup
// @access  Public
export const signup = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;
  const normalizedEmail = email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 400));
  }

  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    password,
    phone,
    authProviders: [{ provider: 'password' }],
  });

  const verificationCode = user.generateVerificationCode();
  await user.save({ validateBeforeSave: false });

  try {
    await sendVerificationCodeEmail(user, verificationCode);
  } catch (error) {
    logger.error('Verification code email failed during signup:', error);
    return next(new AppError(
      `Account created, but the verification email could not be sent. ${getVerificationEmailFailureMessage(error)}`,
      502
    ));
  }

  res.status(201).json({
    success: true,
    requiresVerification: true,
    email: user.email,
    message: 'Registration successful. Please enter the verification code sent to your email.',
  });
});

// Legacy link-based signup kept unused for rollback/reference.
const legacySignup = catchAsync(async (req, res, next) => {
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
      subject: 'Verify Your Email - Stay Wise',
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
              <h1>Welcome to Stay Wise! 🌴</h1>
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
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = hashToken(refreshToken);
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
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = hashToken(refreshToken);
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

// @desc    Verify email with 6-digit code
// @route   POST /api/v1/auth/verify-email-code
// @access  Public
export const verifyEmailCode = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return next(new AppError('Email and verification code are required', 400));
  }

  const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return next(new AppError('Invalid verification code', 400));
  }

  if (user.isVerified) {
    const { token, refreshToken } = await issueAuthTokens(user);
    return res.status(200).json({
      success: true,
      message: 'Email already verified',
      token,
      refreshToken,
      user: authUserPayload(user),
    });
  }

  if (
    !user.verificationCode ||
    user.verificationCode !== hashedCode ||
    !user.verificationCodeExpires ||
    user.verificationCodeExpires < Date.now()
  ) {
    user.verificationCodeAttempts = (user.verificationCodeAttempts || 0) + 1;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Invalid or expired verification code', 400));
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  user.verificationCodeAttempts = 0;

  const { token, refreshToken } = await issueAuthTokens(user);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    token,
    refreshToken,
    user: authUserPayload(user),
  });
});

// @desc    Resend verification code
// @route   POST /api/v1/auth/resend-verification-code
// @access  Public
export const resendVerificationCode = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an unverified account exists, a new code has been sent.',
    });
  }

  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: 'This email is already verified. Please sign in.',
    });
  }

  const verificationCode = user.generateVerificationCode();
  await user.save({ validateBeforeSave: false });
  try {
    await sendVerificationCodeEmail(user, verificationCode);
  } catch (error) {
    logger.error('Verification code email failed during resend:', error);
    return next(new AppError(getVerificationEmailFailureMessage(error), 502));
  }

  res.status(200).json({
    success: true,
    message: 'Verification code sent.',
  });
});

// @desc    Login/signup with Firebase provider token
// @route   POST /api/v1/auth/firebase
// @access  Public
export const firebaseAuth = catchAsync(async (req, res, next) => {
  const { idToken, profile = {} } = req.body;

  if (!idToken) {
    return next(new AppError('Firebase ID token is required', 400));
  }

  let decodedToken;
  try {
    decodedToken = await getFirebaseAuth().verifyIdToken(idToken, true);
  } catch (error) {
    logger.error('Firebase ID token verification failed:', error);
    return next(new AppError('Invalid Firebase authentication token', 401));
  }

  const email = (decodedToken.email || profile.email || '').toLowerCase();
  if (!email) {
    return next(new AppError('Firebase account did not provide an email address', 400));
  }

  const provider = normalizeFirebaseProvider(
    decodedToken.firebase?.sign_in_provider || profile.provider || 'firebase'
  );
  const displayName = decodedToken.name || profile.displayName || '';
  const { firstName, lastName } = splitDisplayName(displayName, email);
  const phone = decodedToken.phone_number || profile.phone || profile.phoneNumber;
  const avatar = decodedToken.picture || profile.photoURL;
  const profileAddress = profile.address && typeof profile.address === 'object'
    ? profile.address
    : undefined;

  let user = await User.findOne({
    $or: [{ firebaseUid: decodedToken.uid }, { email }],
  });
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      avatar: avatar || 'default-avatar.jpg',
      firebaseUid: decodedToken.uid,
      isVerified: Boolean(decodedToken.email_verified || provider === 'google.com' || provider === 'apple.com'),
      authProviders: [{
        provider,
        providerUid: decodedToken.uid,
      }],
      address: profileAddress,
    });
  } else {
    if (!user.firebaseUid) user.firebaseUid = decodedToken.uid;
    if (avatar && (!user.avatar || user.avatar === 'default-avatar.jpg')) user.avatar = avatar;
    if (phone && !user.phone) user.phone = phone;
    if (profileAddress && !user.address?.street) user.address = profileAddress;
    if (decodedToken.email_verified) user.isVerified = true;

    const hasProvider = (user.authProviders || []).some(
      (item) => item.provider === provider && item.providerUid === decodedToken.uid
    );

    if (!hasProvider) {
      user.authProviders.push({
        provider,
        providerUid: decodedToken.uid,
      });
    }
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403));
  }

  const { token, refreshToken } = await issueAuthTokens(user);

  res.status(200).json({
    success: true,
    token,
    refreshToken,
    isNewUser,
    user: authUserPayload(user),
  });
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

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      requiresVerification: true,
      email: user.email,
      message: 'Please verify your email before signing in.',
    });
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  }

  const { token, refreshToken } = await issueAuthTokens(user);

  // Remove password from output
  user.password = undefined;

  res.status(200).json({
    success: true,
    token,
    refreshToken,
    user: authUserPayload(user),
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
      subject: 'Email Verified - Welcome to Stay Wise!',
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
              <p>Your email has been verified. You now have full access to Stay Wise.</p>
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
      subject: 'Password Reset Request - Stay Wise',
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
      subject: 'Password Reset Successful - Stay Wise',
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

    if (!user || !tokenMatchesStoredHash(requestRefreshToken, user.refreshToken)) {
      return next(new AppError('Invalid refresh token', 401));
    }

    if (Number(decoded.version || 0) !== Number(user.tokenVersion || 0)) {
      return next(new AppError('Invalid refresh token', 401));
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshToken = hashToken(newRefreshToken);
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
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  // Send notification email
  try {
    await emailService.send({
      to: user.email,
      subject: 'Password Changed - Stay Wise',
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
