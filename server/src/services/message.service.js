import MessageStore from '../data/messages.js';
import UserStore from '../data/users.js';
import ApiError from '../utils/ApiError.js';
import scamDetectorService from './scamDetector.service.js';

/**
 * Populate sender/recipient info onto a message object
 */
function populateMessage(message, fields = ['username', 'email', 'avatar', 'publicKey']) {
  const sender = UserStore.findById(message.sender);
  const recipient = UserStore.findById(message.recipient);

  const pick = (user) => {
    if (!user) return null;
    const result = { _id: user._id };
    if (fields.includes('username')) result.username = user.username;
    if (fields.includes('email')) result.email = user.email;
    if (fields.includes('avatar')) result.avatar = UserStore._getAvatar(user);
    if (fields.includes('publicKey')) result.publicKey = user.publicKey;
    return result;
  };

  return {
    ...message,
    sender: pick(sender) || message.sender,
    recipient: pick(recipient) || message.recipient,
  };
}

const messageService = {
  /**
   * Send a new message
   */
  async sendMessage({ senderId, recipientEmail, subject, body }) {
    // Find recipient by email
    const recipient = UserStore.findByEmail(recipientEmail);

    if (!recipient) {
      throw ApiError.notFound(`No user found with email: ${recipientEmail}`);
    }

    if (recipient._id === senderId) {
      throw ApiError.badRequest('Cannot send a message to yourself');
    }

    // Run AI scam analysis
    const scamAnalysis = scamDetectorService.analyze(subject, body);

    const message = MessageStore.create({
      sender: senderId,
      recipient: recipient._id,
      subject,
      body,
      scamAnalysis,
    });

    // Populate sender and recipient for response
    return populateMessage(message);
  },

  /**
   * Get inbox messages (paginated)
   */
  async getInbox(userId, { page = 1, limit = 20 }) {
    const result = MessageStore.getInbox(userId, { page, limit });

    return {
      messages: result.messages.map(m => populateMessage(m, ['username', 'email', 'avatar'])),
      pagination: result.pagination,
    };
  },

  /**
   * Get sent messages (paginated)
   */
  async getSent(userId, { page = 1, limit = 20 }) {
    const result = MessageStore.getSent(userId, { page, limit });

    return {
      messages: result.messages.map(m => populateMessage(m, ['username', 'email', 'avatar'])),
      pagination: result.pagination,
    };
  },

  /**
   * Get a single message by ID
   */
  async getMessage(messageId, userId) {
    const message = MessageStore.findById(messageId);

    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    // Authorization: only sender or recipient can view
    const isSender = message.sender === userId;
    const isRecipient = message.recipient === userId;

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

    return populateMessage(message);
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId, userId) {
    const message = MessageStore.findById(messageId);

    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    // Only recipient can mark as read
    if (message.recipient !== userId) {
      throw ApiError.forbidden('Only the recipient can mark messages as read');
    }

    message.read = true;
    MessageStore.save(message);

    return populateMessage(message);
  },

  /**
   * Toggle star on message
   */
  async toggleStar(messageId, userId) {
    const message = MessageStore.findById(messageId);

    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    // Both sender and recipient can star
    const isSender = message.sender === userId;
    const isRecipient = message.recipient === userId;

    if (!isSender && !isRecipient) {
      throw ApiError.forbidden('You do not have access to this message');
    }

    message.starred = !message.starred;
    MessageStore.save(message);

    return populateMessage(message);
  },

  /**
   * Soft delete a message
   */
  async deleteMessage(messageId, userId) {
    const message = MessageStore.findById(messageId);

    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    const isSender = message.sender === userId;
    const isRecipient = message.recipient === userId;

    if (!isSender && !isRecipient) {
      throw ApiError.forbidden('You do not have access to this message');
    }

    if (isSender) {
      message.deletedBySender = true;
    }
    if (isRecipient) {
      message.deletedByRecipient = true;
    }

    MessageStore.save(message);

    return { message: 'Message deleted successfully' };
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    return MessageStore.countUnread(userId);
  },

  /**
   * Re-analyze a message for scam content
   */
  async reanalyzeMessage(messageId, userId) {
    const message = MessageStore.findById(messageId);

    if (!message) {
      throw ApiError.notFound('Message not found');
    }

    const isSender = message.sender === userId;
    const isRecipient = message.recipient === userId;

    if (!isSender && !isRecipient) {
      throw ApiError.forbidden('You do not have access to this message');
    }

    // Re-run AI scam analysis
    const scamAnalysis = scamDetectorService.analyze(message.subject, message.body);
    message.scamAnalysis = scamAnalysis;
    MessageStore.save(message);

    return populateMessage(message);
  },
};

export default messageService;
