import { body, param, query } from 'express-validator';

const guestSessionValidator = body('guestSessionId')
  .optional()
  .trim()
  .isLength({ min: 12, max: 120 })
  .withMessage('Guest session is invalid');

const messageBodyValidator = body('message')
  .optional()
  .trim()
  .isLength({ min: 1, max: 4000 })
  .withMessage('Message must be between 1 and 4000 characters');

export const askAiValidator = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 2, max: 2000 })
    .withMessage('Message must be between 2 and 2000 characters'),
  guestSessionValidator,
  body('currentUrl').optional().trim().isLength({ max: 500 }),
];

export const createConversationValidator = [
  guestSessionValidator,
  body('customer.name').optional().trim().isLength({ max: 120 }),
  body('customer.email').optional().trim().isEmail().normalizeEmail(),
  body('customer.phone').optional().trim().isLength({ max: 40 }),
  body('subject').optional().trim().isLength({ max: 180 }),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 4000 })
    .withMessage('Message cannot exceed 4000 characters'),
  body('property').optional().isMongoId(),
  body('booking').optional().isMongoId(),
  body('currentUrl').optional().trim().isLength({ max: 500 }),
];

export const conversationIdValidator = [
  param('conversationId')
    .trim()
    .notEmpty()
    .withMessage('Conversation ID is required'),
];

export const sendMessageValidator = [
  ...conversationIdValidator,
  guestSessionValidator,
  messageBodyValidator,
  body('attachments').optional().isArray({ max: 5 }),
  body('attachments.*.url').optional().isURL({ require_tld: false }),
  body('attachments.*.fileName').optional().trim().isLength({ max: 180 }),
  body('attachments.*.mimeType').optional().trim().isLength({ max: 120 }),
  body('attachments.*.size').optional().isInt({ min: 0 }),
];

export const listConversationsValidator = [
  query('status').optional().isIn(['open', 'pending', 'resolved', 'archived']),
  query('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  query('assignedTo').optional().isMongoId(),
  query('search').optional().trim().isLength({ max: 180 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

export const updateConversationValidator = [
  ...conversationIdValidator,
  body('status').optional().isIn(['open', 'pending', 'resolved', 'archived']),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('assignedTo').optional({ nullable: true }).isMongoId(),
  body('tags').optional().isArray({ max: 20 }),
  body('tags.*').optional().trim().isLength({ max: 40 }),
];

export const upsertKnowledgeValidator = [
  body('id').optional().isMongoId(),
  body('category')
    .optional()
    .isIn(['faq', 'booking', 'pricing', 'availability', 'cancellation', 'check-in', 'payment', 'local', 'policy', 'general']),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 180 }),
  body('question').optional().trim().isLength({ max: 300 }),
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer is required')
    .isLength({ max: 4000 }),
  body('tags').optional().isArray({ max: 20 }),
  body('tags.*').optional().trim().isLength({ max: 40 }),
  body('source').optional().trim().isLength({ max: 180 }),
  body('isApproved').optional().isBoolean(),
  body('priority').optional().isInt({ min: 0, max: 1000 }),
];
