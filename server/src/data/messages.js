import crypto from 'crypto';

/**
 * In-memory Message store
 * Mimics the Mongoose model API so controllers/services don't need to change much.
 */
let messages = [];

const MessageStore = {
  _generateId() {
    return 'msg_' + crypto.randomBytes(12).toString('hex');
  },

  create({ sender, recipient, subject, body, scamAnalysis }) {
    const now = new Date();
    const message = {
      _id: this._generateId(),
      sender,
      recipient,
      subject,
      body,
      read: false,
      starred: false,
      deletedBySender: false,
      deletedByRecipient: false,
      scamAnalysis: scamAnalysis || {
        riskScore: 0,
        riskLevel: 'safe',
        threats: [],
        summary: '',
        analyzedAt: null,
      },
      createdAt: now,
      updatedAt: now,
    };
    messages.push(message);
    return message;
  },

  findById(id) {
    return messages.find(m => m._id === id) || null;
  },

  /**
   * Get inbox messages for a user (recipient), excluding soft-deleted ones
   */
  getInbox(userId, { page = 1, limit = 20 }) {
    const filtered = messages
      .filter(m => m.recipient === userId && !m.deletedByRecipient)
      .sort((a, b) => b.createdAt - a.createdAt);

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      messages: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get sent messages for a user (sender), excluding soft-deleted ones
   */
  getSent(userId, { page = 1, limit = 20 }) {
    const filtered = messages
      .filter(m => m.sender === userId && !m.deletedBySender)
      .sort((a, b) => b.createdAt - a.createdAt);

    const total = filtered.length;
    const skip = (page - 1) * limit;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      messages: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Count unread messages in inbox
   */
  countUnread(userId) {
    return messages.filter(
      m => m.recipient === userId && !m.read && !m.deletedByRecipient
    ).length;
  },

  /**
   * Save (update) a message in-place
   */
  save(message) {
    message.updatedAt = new Date();
    const idx = messages.findIndex(m => m._id === message._id);
    if (idx !== -1) {
      messages[idx] = message;
    }
    return message;
  },
};

export default MessageStore;
