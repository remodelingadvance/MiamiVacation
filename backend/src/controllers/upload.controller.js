import { cloudinary } from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import logger from '../utils/logger.js';

// @desc    Upload single image
// @route   POST /api/v1/upload/image
// @access  Private
export const uploadImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  res.status(200).json({
    success: true,
    image: {
      url: req.file.path,
      publicId: req.file.filename,
      size: req.file.size,
      format: req.file.mimetype,
    },
  });
});

// @desc    Upload multiple images
// @route   POST /api/v1/upload/images
// @access  Private
export const uploadImages = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new AppError('Please upload at least one image', 400));
  }

  const images = req.files.map(file => ({
    url: file.path,
    publicId: file.filename,
    size: file.size,
    format: file.mimetype,
  }));

  res.status(200).json({
    success: true,
    count: images.length,
    images,
  });
});

// @desc    Upload video
// @route   POST /api/v1/upload/video
// @access  Private/Admin
export const uploadVideo = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a video', 400));
  }

  res.status(200).json({
    success: true,
    video: {
      url: req.file.path,
      publicId: req.file.filename,
      size: req.file.size,
      format: req.file.mimetype,
    },
  });
});

// @desc    Delete file from Cloudinary
// @route   DELETE /api/v1/upload/:publicId
// @access  Private/Admin
export const deleteFile = catchAsync(async (req, res, next) => {
  const { publicId } = req.params;
  const { resourceType = 'image' } = req.body;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== 'ok') {
      return next(new AppError('Failed to delete file', 400));
    }

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    logger.error('File deletion failed:', error);
    return next(new AppError('Failed to delete file', 500));
  }
});

// @desc    Get Cloudinary signature for direct upload
// @route   POST /api/v1/upload/signature
// @access  Private
export const getUploadSignature = catchAsync(async (req, res, next) => {
  const { folder = 'miami-rentals/uploads' } = req.body;

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET
  );

  res.status(200).json({
    success: true,
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
});