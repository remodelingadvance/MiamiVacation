import express from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaign,
  updateCampaign,
  sendCampaign,
  deleteCampaign,
  getSubscribers,
  exportSubscribers,
} from '../controllers/newsletterCampaign.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'super-admin'));

// Campaigns
router.post('/campaigns', createCampaign);
router.get('/campaigns', getCampaigns);
router.get('/campaigns/:id', getCampaign);
router.patch('/campaigns/:id', updateCampaign);
router.post('/campaigns/:id/send', sendCampaign);
router.delete('/campaigns/:id', deleteCampaign);

// Subscribers
router.get('/subscribers', getSubscribers);
router.get('/subscribers/export', exportSubscribers);

export default router;