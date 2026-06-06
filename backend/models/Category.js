const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true },
    emoji:       { type: String, required: true },
    description: { type: String },
    color:       { type: String, default: '#6366f1' },
    order:       { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', CategorySchema);
