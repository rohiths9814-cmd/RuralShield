import Message from '../models/Message.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import scamDetectorService from './scamDetector.service.js';

const messageService = {
  /**
   * Send a new message
   */
  async sendMessage({ senderId, recipientEmail, subject, body }) {
    // Find recipient by email
    const recipient = await User.findOne({ email: recipientEmail });

    if (!recipient) {
      throw ApiError.notFound(`No user found with email: ${recipientEmail}`);
    }

    if (recipient._id.toString() === senderId.toString()) {
      throw ApiError.badRequest('Cannot send a message to yourself');
    }

    // Run AI scam analysis
    const scamAnalysis = scamDetectorService.analyze(subject, body);

    const message = await Message.create({
      sender: senderId,
      recipient: recipient._id,
      subject,
      body,
      scamAnalysis,
    });

    // Populate sender and recipient for response
    await message.populate([
      { path: 'sender', select: 'username email avatar' },
      { path: 'recipient', select: 'username email avatar' },
    ]);

    return message;
  },

  /**
   * Get inbox messages (paginated)
   */
  async getInbox(userId, { page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({
        recipient: userId,
        deletedByRecipient: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'username email avatar'),
      Message.countDocuments({
        recipient: userId,
        deletedByRecipient: false,
      }),
    ]);

    return {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get sent messages (paginated)
   */
  async getSent(userId, { page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({
        sender: userId,
        deletedBySender: false,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('recipient', 'username email avatar'),
      Message.countDocuments({
        sender: userId,
        deletedBySender: false,
      }),
    ]);

    return {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get a single message by ID
   */
  async getMessage(messageId, userId) {
    const message = await Message.findById(messageId)
      .populate('sender', 'username email avatar publicKey')
      .populate('recipient', 'username email avatar publicKey');

    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    // Authorization: only sender or recipient can view
    const isSender = message.sender._id.toString() === userId.toString();
    const isRecipient = message.recipient._id.toString() === userId.toString();

    if (!isSender && !isRecipient) {
      throw ApiError.forbidden('You do not have access to this message');
    }

    // Check soft deletes
    if (isSender && message.deletedBySender) {
      throw ApiError.notFound('Message not found');
    }
    if (isRecipient && message.deletedByRecipient) {
      throw ApiError.notFound('Message not found');
    }

    return message;
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    // Only recipient can mark as read
    if (message.recipient.toString() !== userId.toString()) {
      throw ApiError.forbidden('Only the recipient can mark messages as read');
    }

    message.read = true;
    await message.save();

    return message;
  },

  /**
   * Toggle star on message
   */
  async toggleStar(messageId, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    // Both sender and recipient can star
    const isSender = message.sender.toString() === userId.toString();
    const isRecipient = message.recipient.toString() === userId.toString();

    if (!isSender && !isRecipient) {
      throw ApiError.forbidden('You do not have access to this message');
    }

    message.starred = !message.starred;
    await message.save();

    return message;
  },

  /**
   * Soft delete a message
   */
  async deleteMessage(messageId, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    const isSender = message.sender.toString() === userId.toString();
    const isRecipient = message.recipient.toString() === userId.toString();

    if (!isSender && !isRecipient) {
      throw ApiError.forbidden('You do not have access to this message');
    }

    if (isSender) {
      message.deletedBySender = true;
    }
    if (isRecipient) {
      message.deletedByRecipient = true;
    }

    await message.save();

    return { message: 'Message deleted successfully' };
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    const count = await Message.countDocuments({
      recipient: userId,
      read: false,
      deletedByRecipient: false,
    });

    return count;
  },

  /**
   * Re-analyze a message for scam content
   */
  async reanalyzeMessage(messageId, userId) {
    const message = await Message.findById(messageId);

    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    const isSender = message.sender.toString() === userId.toString();
    const isRecipient = message.recipient.toString() === userId.toString();

    if (!isSender && !isRecipient) {
      throw ApiError.forbidden('You do not have access to this message');
    }

    // Re-run AI scam analysis
    const scamAnalysis = scamDetectorService.analyze(message.subject, message.body);
    message.scamAnalysis = scamAnalysis;
    await message.save();

    return message;
  },
};

export default messageService;
