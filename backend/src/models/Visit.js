const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Url',
      required: true,
    },
    ip: {
      type: String,
      default: 'unknown',
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
    country: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    visitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Visit', visitSchema);
