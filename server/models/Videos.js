const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  title: { type: String, required: true, default: 'Studio Lite Video' },
  mode: { type: String, default: 'idea' },
  aspectRatio: { type: String, default: '9:16' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', VideoSchema);
