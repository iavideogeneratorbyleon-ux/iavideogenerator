const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Video = require('../models/Video');
const User = require('../models/User');
const { CREDIT_CONFIG, PLAN_POLICIES } = require('../config/globals');

function resolveUserCreditPolicy(planKey = 'free_trial') {
  const byPlan = CREDIT_CONFIG?.byPlan || {};
  const normalized = Object.prototype.hasOwnProperty.call(PLAN_POLICIES, planKey)
    ? planKey
    : 'free_trial';
  return (
    byPlan[normalized] || {
      initialCredits: CREDIT_CONFIG?.freeTrialInitialCredits ?? 50,
      videoCreditCost: CREDIT_CONFIG?.videoCreditCost ?? 30,
      minCreditsToGenerate: CREDIT_CONFIG?.minCreditsToGenerate ?? 30,
      unlimitedCredits: false
    }
  );
}

// 1. Guardar video al terminar el Wizard y descontar créditos de Studio Lite
router.post('/save', async (req, res) => {
  try {
    const { email, title, mode, aspectRatio, userId, parameters } = req.body;

    let validUserId = null;
    let user = null;

    const candidateId = userId ? String(userId).trim() : '';
    if (candidateId && mongoose.Types.ObjectId.isValid(candidateId)) {
      user = await User.findById(candidateId);
      if (user) validUserId = user._id;
    }

    const candidateEmail =
      (email && String(email).trim().toLowerCase()) ||
      (candidateId.includes('@') ? candidateId.toLowerCase() : '');

    if (!user && candidateEmail) {
      user = await User.findOne({ email: candidateEmail });
      if (user) validUserId = user._id;
    }

    if (!user || !validUserId) {
      return res.status(400).json({ error: 'No se pudo asociar un usuario válido' });
    }

    const planCreditRule = resolveUserCreditPolicy(user.plan);
    const costoVideoLite = planCreditRule.videoCreditCost ?? 30;
    const minRequired = planCreditRule.minCreditsToGenerate ?? costoVideoLite;

    if (!planCreditRule.unlimitedCredits && user.credits < minRequired) {
      return res.status(403).json({
        error: 'Créditos insuficientes',
        remainingCredits: user.credits,
        requiredCredits: minRequired,
        needsUpgrade: true
      });
    }

    // Descontar los créditos de la generación
    if (!planCreditRule.unlimitedCredits && costoVideoLite > 0) {
      user.credits -= costoVideoLite;
      await user.save();
    }

    // Guardar el video asociado con los parámetros dinámicos
    const newVideo = new Video({
      userId: validUserId,
      email: user.email,
      title: title || 'Studio Lite Video',
      mode: mode || 'idea',
      aspectRatio: aspectRatio || parameters?.aspectRatio || '9:16',
      parameters: parameters || {}
    });

    await newVideo.save();
    return res.status(201).json({
      success: true,
      video: newVideo,
      remainingCredits: user.credits
    });
  } catch (error) {
    console.error('❌ ERROR DETALLADO AL GUARDAR VIDEO:', error.message);
    console.error(error);
    return res.status(500).json({ error: 'Error al guardar el video', details: error.message });
  }
});

// 2. Obtener los videos del usuario para el Dashboard
router.get('/:email', async (req, res) => {
  try {
    const email = String(req.params.email || '').trim().toLowerCase();
    const [videos, dbUser] = await Promise.all([
      Video.find({ email }).sort({ createdAt: -1 }),
      User.findOne({ email }).select('credits plan').lean(),
    ]);

    return res.status(200).json({
      success: true,
      videos,
      ...(typeof dbUser?.credits === 'number'
        ? { credits: dbUser.credits, remainingCredits: dbUser.credits }
        : {}),
    });
  } catch (error) {
    console.error('Error al obtener videos:', error);
    return res.status(500).json({ error: 'Error al obtener los videos' });
  }
});


module.exports = router;
