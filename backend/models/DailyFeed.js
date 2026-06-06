const mongoose = require('mongoose');

const DailyFeedSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true },
    cards: [{
      card:        { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
      position:    { type: Number },
      isCompleted: { type: Boolean, default: false },
      completedAt: { type: Date },
    }],
    isCompleted:         { type: Boolean, default: false },
    completedAt:         { type: Date },
    currentIndex:        { type: Number, default: 0 },
    generationAlgorithm: { type: String, enum: ['random','personalized','category_balanced'], default: 'category_balanced' },
  },
  { timestamps: true }
);

DailyFeedSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyFeed', DailyFeedSchema);
