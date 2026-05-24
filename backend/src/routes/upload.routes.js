import express from 'express';
import {
  uploadImage,
  uploadImages,
  uploadVideo,
  deleteFile,
  getUploadSignature,
} from '../controllers/upload.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  uploadPropertyImages,
  uploadAvatar,
  uploadReviewImages,
  uploadVideo as uploadVideoMiddleware,
} from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Upload routes
router.post('/image', uploadPropertyImages.single('image'), uploadImage);
router.post('/images', uploadPropertyImages.array('images', 10), uploadImages);
router.post('/avatar', uploadAvatar.single('avatar'), uploadImage);
router.post('/review-images', uploadReviewImages.array('images', 5), uploadImages);
router.post('/video', authorize('admin', 'super-admin'), uploadVideoMiddleware.single('video'), uploadVideo);

// Get Cloudinary signature for direct upload
router.post('/signature', getUploadSignature);

// Delete file
router.delete('/:publicId', authorize('admin', 'super-admin'), deleteFile);

export default router;