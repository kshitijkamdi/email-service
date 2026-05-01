import mongoose from 'mongoose';

const emailAddressSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

emailAddressSchema.index({ owner: 1, createdAt: 1 });

const EmailAddress = mongoose.model('EmailAddress', emailAddressSchema);

export default EmailAddress;
