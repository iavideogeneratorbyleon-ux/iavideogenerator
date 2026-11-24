const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  credits: { type: Number, default: 50 },
  plan: {
    type: String,
    enum: ['free_trial', 'lite', 'pro', 'unlimited'],
    default: 'free_trial',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
