const mongoose = require('mongoose');

const SourceSchema = new mongoose.Schema(
  {
    type:      { type: String, enum: ['paper','book','documentary','website','nasa','pubmed','arxiv'], required: true },
    title:     { type: String, required: true },
    author:    { type: String },
    year:      { type: Number },
    url:       { type: String },
    publisher: { type: String },
    doi:       { type: String },
  },
  { _id: false }
);

const StatsSchema = new mongoose.Schema(
  {
    views:          { type: Number, default: 0 },
    saves:          { type: Number, default: 0 },
    shares:         { type: Number, default: 0 },
    deepDiveClicks: { type: Number, default: 0 },
  },
  { _id: false }
);

const CardSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true, maxlength: 120 },
    body:         { type: String, required: true, maxlength: 800 },
    whyItMatters: { type: String, maxlength: 300 },
    tldr:         { type: String, maxlength: 160 },

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    tags:     [{ type: String, lowercase: true, trim: true }],
    mood:     [{ type: String, enum: ['inspiring','surprising','calming','motivating','mind-blowing','practical'] }],

    source:      { type: SourceSchema, required: true },
    verified:    { type: Boolean, default: false },
    aiGenerated: { type: Boolean, default: false },
    aiSimplified:{ type: Boolean, default: false },

    imageUrl:           { type: String },
    imageAlt:           { type: String },
    audioUrl:           { type: String },
    videoUrl:           { type: String },
    videoType:          { type: String, enum: ['youtube', 'mp4'] },
    videoThumbnailUrl:  { type: String },
    deepDiveUrl: { type: String },
    relatedCards:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],

    language:    { type: String, enum: ['el','en'], default: 'el', index: true },
    difficulty:  { type: String, enum: ['easy','medium','advanced'], default: 'easy', index: true },
    readTimeSec: { type: Number, default: 45 },
    status:      { type: String, enum: ['draft','published','archived'], default: 'draft', index: true },
    isFeatured:  { type: Boolean, default: false },
    isPremium:   { type: Boolean, default: false },

    stats: { type: StatsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

CardSchema.index({ tags: 1 });
CardSchema.index({ status: 1, language: 1, category: 1 });
CardSchema.index({ createdAt: -1 });
CardSchema.index({ isFeatured: 1, status: 1 });
CardSchema.index(
  { title: 'text', body: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, body: 1 }, name: 'card_text_search' }
);

module.exports = mongoose.model('Card', CardSchema);
