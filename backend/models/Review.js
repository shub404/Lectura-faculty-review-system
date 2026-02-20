const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  faculty: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Faculty', 
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  moderationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'flagged'], 
    default: 'pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);