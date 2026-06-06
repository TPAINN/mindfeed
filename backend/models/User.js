const mongoose = require('mongoose');

const StreakSchema = new mongoose.Schema(
  {
    current:        { type: Number, default: 0 },
    longest:        { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    totalDaysActive:{ type: Number, default: 0 },
  },
  { _id: false }
);

const SeenCardSchema = new mongoose.Schema(
  {
    card:        { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    seenAt:      { type: Date, default: Date.now },
    engagement:  { type: String, enum: ['skipped','read','saved','deep_dived'], default: 'read' },
    readTimeSec: { type: Number },
  },
  { _id: false }
);

const PreferencesSchema = new mongoose.Schema(
  {
    categories:          [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    language:            { type: String, enum: ['el','en'], default: 'el' },
    difficulty:          { type: String, enum: ['easy','medium','advanced','mixed'], default: 'mixed' },
    dailyCardLimit:      { type: Number, default: 10, min: 3, max: 20 },
    notificationsEnabled:{ type: Boolean, default: true },
    notificationTime:    { type: String, default: '08:00' },
    theme:               { type: String, enum: ['light','dark','system'], default: 'system' },
  },
  { _id: false }
);

const KnowledgeProfileSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    score:      { type: Number, default: 0 },
    cardsRead:  { type: Number, default: 0 },
    cardsSaved: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username:    { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:{ type: String, required: true },
    avatarUrl:   { type: String },

    preferences:      { type: PreferencesSchema, default: () => ({}) },
    streak:           { type: StreakSchema, default: () => ({}) },
    totalCardsRead:   { type: Number, default: 0 },
    totalDeepDives:   { type: Number, default: 0 },
    knowledgeProfile: [KnowledgeProfileSchema],

    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
    seenCards: {
      type: [SeenCardSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 500,
        message: 'seenCards max 500',
      },
    },

    isEmailVerified: { type: Boolean, default: false },
    refreshToken:    { type: String, select: false },
    role:            { type: String, enum: ['user','editor','admin'], default: 'user' },
    isActive:        { type: Boolean, default: true },
    lastLogin:       { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

UserSchema.methods.addSeenCard = function (entry) {
  this.seenCards.push(entry);
  if (this.seenCards.length > 500) this.seenCards = this.seenCards.slice(-500);
  this.totalCardsRead += 1;
};

UserSchema.methods.updateStreak = function () {
  const today = new Date().toISOString().split('T')[0];
  const last  = this.streak.lastActiveDate
    ? this.streak.lastActiveDate.toISOString().split('T')[0]
    : null;
  if (last === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  this.streak.current = last === yesterday ? this.streak.current + 1 : 1;
  if (this.streak.current > this.streak.longest) this.streak.longest = this.streak.current;
  this.streak.lastActiveDate = new Date();
  this.streak.totalDaysActive += 1;
};

module.exports = mongoose.model('User', UserSchema);
