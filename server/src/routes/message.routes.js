import { Router } from 'express';
import { body, query } from 'express-validator';
import {
  sendMessage,
  getInbox,
  getSent,
  getMessage,
  markAsRead,
  toggleStar,
  deleteMessage,
  getUnreadCount,
  analyzeMessage,
} from '../controllers/message.controller.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';

const router = Router();

// All message routes require authentication
router.use(auth);

// POST /api/messages - Send a message
router.post(
  '/',
  [
    body('recipientEmail')
      .trim()
      .isEmail()
      .withMessage('Please enter a valid recipient email')
      .normalizeEmail(),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ max: 200 })
      .withMessage('Subject must be at most 200 characters'),
    body('body')
      .notEmpty()
      .withMessage('Message body is required'),
  ],
  validate,
  sendMessage
);

// GET /api/messages/inbox
router.get('/inbox', getInbox);

// GET /api/messages/sent
router.get('/sent', getSent);

// GET /api/messages/unread-count
router.get('/unread-count', getUnreadCount);

// GET /api/messages/:id
router.get('/:id', getMessage);

// PATCH /api/messages/:id/read
router.patch('/:id/read', markAsRead);

// PATCH /api/messages/:id/star
router.patch('/:id/star', toggleStar);

// DELETE /api/messages/:id
router.delete('/:id', deleteMessage);

// POST /api/messages/:id/analyze - Re-analyze for scam content
router.post('/:id/analyze', analyzeMessage);

export default router;
