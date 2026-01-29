import express from 'express';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
import { sendMessage, getMessages, getConversations, getUnreadCount, markAsRead } from '../controllers/messageController.js';

router.use(protect);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.put('/:userId/read', markAsRead);
router.get('/:userId', getMessages);

export default router;
