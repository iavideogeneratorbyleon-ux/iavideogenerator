const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Studio Lite Video',
    },
    mode: {
      type: String,
      default: 'idea',
    },
    aspectRatio: {
      type: String,
      default: '9:16',
    },
    parameters: {
      type: Object,
      default: {},
    },

    // Campos unificados provenientes de VideoProject para el pipeline
    jobId: {
      type: String,
      sparse: true,
      unique: true,
    },
    meta: {
      userId: { type: String },
      userPlan: { type: String, default: 'free_trial' },
      language: { type: String, default: 'en' },
    },
    userInputs: {
      mode: { type: String },
      rawContent: { type: String },
      tone: { type: String },
    },
    config: {
      aspectRatio: { type: String, default: '9:16' },
      visualStyle: { type: String, default: 'cinematic' },
    },
    llmDirective: {
      provider: { type: String },
      model: { type: String },
      structuredScript: {
        title: { type: String },
        totalDurationSeconds: { type: Number },
        scenes: { type: mongoose.Schema.Types.Mixed, default: [] },
      },
    },
    status: {
      type: String,
      default: 'saved',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

module.exports = mongoose.model('Video', VideoSchema);
