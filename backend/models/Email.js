import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      trim: true
    },
    to: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    body: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      required: true,
      enum: ['inbox', 'sent']
    },
    messageId: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

emailSchema.index({ to: 1, type: 1, createdAt: -1 });
emailSchema.index({ from: 1, type: 1, createdAt: -1 });
emailSchema.index({ subject: 'text', body: 'text', from: 'text', to: 'text' });
emailSchema.index({ messageId: 1, type: 1, to: 1 });

const Email = mongoose.model('Email', emailSchema);

export default Email;
