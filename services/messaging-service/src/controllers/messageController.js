import Message from '../models/Message.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notificationHelper.js';

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    
    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient and content are required' });
    }

    const senderId = req.user._id;

    let message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content,
    });
    
    message = await message.populate('sender', 'name avatar email');
    message = await message.populate('recipient', 'name avatar email');

    // Trigger notification for the recipient
    await createNotification(
        recipientId,
        'Message',
        `New Message from ${req.user.name}`,
        content.length > 50 ? `${content.substring(0, 50)}...` : content,
        '/inbox'
    );

    // Emit socket event to the recipient using their user ID
    req.io.to(recipientId).emit('receive-message', message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages between current user and another user
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: otherUserId },
        { sender: otherUserId, recipient: myId },
      ],
    })
      .sort({ createdAt: 1 }) // Oldest first
      .populate('sender', 'name avatar email')
      .populate('recipient', 'name avatar email');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations (users interacted with)
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const myId = req.user._id;
    
    // Find all distinct users that the current user has exchanged messages with
    const messages = await Message.find({
        $or: [{ sender: myId }, { recipient: myId }]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name avatar email')
    .populate('recipient', 'name avatar email');

    const conversationsMap = new Map();

    messages.forEach(msg => {
        const otherUser = msg.sender._id.toString() === myId.toString() 
            ? msg.recipient 
            : msg.sender;
        
        const isUnread = !msg.read && msg.recipient._id.toString() === myId.toString();
        
        // Use user ID as key to ensure uniqueness
        if (!conversationsMap.has(otherUser._id.toString())) {
            conversationsMap.set(otherUser._id.toString(), {
                user: otherUser,
                lastMessage: msg.content,
                lastMessageTime: msg.createdAt,
                unreadCount: isUnread ? 1 : 0
            });
        } else if (isUnread) {
            const conv = conversationsMap.get(otherUser._id.toString());
            conv.unreadCount += 1;
        }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get total unread messages count
// @route   GET /api/messages/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      read: false
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark messages as read between current user and another user
// @route   PUT /api/messages/:userId/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      { sender: otherUserId, recipient: myId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
