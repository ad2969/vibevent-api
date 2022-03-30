const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'event',
    required: true,
  },
  value: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  }
}, { timestamps: true });

// both userId and eventId must be unique (no user can rate an event twice)
ratingSchema.index({ userId: 1, eventId: 1 }, { unique: true });

exports.RatingModel = mongoose.model('rating', ratingSchema);
