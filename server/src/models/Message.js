import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject must be at most 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Message body is required'],
    },
    read: {
      type: Boolean,
      default: false,
    },
    starred: {
      type: Boolean,
      default: false,
    },
    deletedBySender: {
      type: Boolean,
      default: false,
    },
    deletedByRecipient: {
      type: Boolean,
      default: false,
    },
    scamAnalysis: {
      riskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      riskLevel: {
        type: String,
        enum: ['safe', 'low', 'medium', 'high', 'critical'],
        default: 'safe',
      },
      threats: [
        {
          category: String,
          categoryLabel: String,
          severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
          },
          detail: String,
          matches: [String],
        },
      ],
      summary: {
        type: String,
        default: '',
      },
      analyzedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for efficient inbox/sent queries
messageSchema.index({ recipient: 1, deletedByRecipient: 1, createdAt: -1 });
messageSchema.index({ sender: 1, deletedBySender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
