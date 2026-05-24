import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.js';
import AppError from '../utils/AppError.js';

// Create storage engines for different purposes
const createStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `miami-rentals/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
        { width: 2000, height: 2000, crop: 'limit' }
      ],
    },
  });
};

// Property images upload
const propertyStorage = createStorage('properties');
export const uploadPropertyImages = multer({
  storage: propertyStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20, // Maximum 20 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
  },
});

// User avatar upload
const avatarStorage = createStorage('avatars');
export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
  },
});

// Review images upload
const reviewStorage = createStorage('reviews');
export const uploadReviewImages = multer({
  storage: reviewStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
  },
});

// Video upload
const videoStorage = createStorage('videos');
export const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new AppError('Not a video! Please upload only videos.', 400), false);
    }
  },
});

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new AppError('Failed to delete file from cloud storage', 500);
  }
};

// Get optimized URL
export const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    fetch_format: 'auto',
    quality: 'auto',
    ...options,
  };
  
  return cloudinary.url(publicId, defaultOptions);
};