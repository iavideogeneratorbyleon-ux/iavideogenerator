// server/models/VideoProject.js
const mongoose = require('mongoose');

const videoProjectSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  meta: {
    userId: { type: String, default: 'test-user-01' },
    userPlan: { type: String, default: 'free_trial' },
    language: { type: String, default: 'en' }
  },
  userInputs: {
    mode: String,
    rawContent: String,
    tone: String
  },
  config: {
    aspectRatio: { type: String, default: '9:16' },
    visualStyle: { type: String, default: 'cinematic' }
  },
  llmDirective: {
    provider: String,
    model: String,
    structuredScript: {
      title: String,
      totalDurationSeconds: Number,
      // Usamos Mixed para permitir que Mongoose guarde todo el arreglo de escenas con sus audios sin restricciones
      scenes: { type: mongoose.Schema.Types.Mixed, default: [] }
    }
  },
  status: { type: String, default: 'audio_generated' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false }); // strict: false permite guardar campos dinámicos sin que Mongoose los limpie

module.exports = mongoose.model('VideoProject', videoProjectSchema);
