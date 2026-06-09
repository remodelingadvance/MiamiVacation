import express from 'express';
import {
  askAi,
  createSupportConversation,
  getSupportAnalytics,
  getSupportConversation,
  listAdminConversations,
  listKnowledge,
  markSupportRead,
  sendAdminSupportMessage,
  sendCustomerSupportMessage,
  updateAdminConversation,
  upsertKnowledge,
} from '../controllers/support.controller.js';
import { optionalAuth, protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adminLimiter, supportAiLimiter, supportChatLimiter } from '../middleware/rateLimiter.js';
import {
  askAiValidator,
  createConversationValidator,
  conversationIdValidator,
  listConversationsValidator,
  sendMessageValidator,
  updateConversationValidator,
  upsertKnowledgeValidator,
} from '../validators/support.validator.js';

const router = express.Router();

// Public / customer support
router.post('/ai/ask', supportAiLimiter, optionalAuth, validate(askAiValidator), askAi);
router.post('/conversations', supportChatLimiter, optionalAuth, validate(createConversationValidator), createSupportConversation);
router.get('/conversations/:conversationId', optionalAuth, validate(conversationIdValidator), getSupportConversation);
router.post('/conversations/:conversationId/messages', supportChatLimiter, optionalAuth, validate(sendMessageValidator), sendCustomerSupportMessage);
router.patch('/conversations/:conversationId/read', optionalAuth, validate(conversationIdValidator), markSupportRead);

// Admin support workspace
router.use('/admin', protect, authorize('admin', 'super-admin'), adminLimiter);
router.get('/admin/analytics', getSupportAnalytics);
router.get('/admin/conversations', validate(listConversationsValidator), listAdminConversations);
router.get('/admin/conversations/:conversationId', validate(conversationIdValidator), getSupportConversation);
router.post('/admin/conversations/:conversationId/messages', validate(sendMessageValidator), sendAdminSupportMessage);
router.patch('/admin/conversations/:conversationId', validate(updateConversationValidator), updateAdminConversation);
router.patch('/admin/conversations/:conversationId/read', validate(conversationIdValidator), markSupportRead);
router.get('/admin/knowledge', listKnowledge);
router.post('/admin/knowledge', validate(upsertKnowledgeValidator), upsertKnowledge);

export default router;
