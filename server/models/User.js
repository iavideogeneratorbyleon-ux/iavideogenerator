const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // 🔒 Nuevo campo para la contraseña cifrada
  credits: { type: Number, default: 50 }, // 50 créditos gratis de bienvenida por defecto
  plan: { type: String, enum: ['lite', 'pro', 'unlimited'], default: 'lite' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

