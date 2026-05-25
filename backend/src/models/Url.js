const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    alias: {
      type: String,
      default: null,
      trim: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastVisitedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Url', urlSchema);
