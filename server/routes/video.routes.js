// server/routes/video.routes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Video = require('../models/Video');
const User = require('../models/User');
const { CREDIT_CONFIG, PLAN_POLICIES } = require('../config/globals');
const { getJobUsage } = require('../services/usageCostService');

function resolveUserCreditPolicy(planKey = 'free_trial', productKey = 'studio_lite') {
  const byPlan = CREDIT_CONFIG?.byPlan || {};
  const byProduct = CREDIT_CONFIG?.byProduct || {};
  const normalizedPlan = Object.prototype.hasOwnProperty.call(PLAN_POLICIES, planKey)
    ? planKey
    : 'free_trial';

  const planRule = byPlan[normalizedPlan] || {
    initialCredits: CREDIT_CONFIG?.freeTrialInitialCredits ?? 50,
    videoCreditCost: CREDIT_CONFIG?.videoCreditCost ?? 30,
    minCreditsToGenerate: CREDIT_CONFIG?.minCreditsToGenerate ?? 30,
    unlimitedCredits: false
  };

  const productOverride = byProduct[productKey] || null;
  if (productOverride && !planRule.unlimitedCredits) {
    return {
      ...planRule,
      videoCreditCost: productOverride.videoCreditCost ?? planRule.videoCreditCost,
      minCreditsToGenerate:
        productOverride.minCreditsToGenerate ?? planRule.minCreditsToGenerate
    };
  }

  return planRule;
}

// 1. Guardar video al terminar el Wizard y descontar créditos
router.post('/save', async (req, res) => {
  try {
    const {
      jobId,
      videoUrl,
      email,
      title,
      mode,
      aspectRatio,
      userId,
      parameters,
      resolvedParams,
      product
    } = req.body;

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

    const effectiveProduct =
      product ||
      resolvedParams?.meta?.product ||
      parameters?.product ||
      parameters?.resolvedParams?.meta?.product ||
      'studio_lite';

    const planCreditRule = resolveUserCreditPolicy(user.plan, effectiveProduct);
    const costoVideo = planCreditRule.videoCreditCost ?? 30;
    const minRequired = planCreditRule.minCreditsToGenerate ?? costoVideo;

    if (!planCreditRule.unlimitedCredits && user.credits < minRequired) {
      return res.status(403).json({
        error: 'Créditos insuficientes',
        remainingCredits: user.credits,
        requiredCredits: minRequired,
        needsUpgrade: true
      });
    }

    // Descontar los créditos de la generación
    if (!planCreditRule.unlimitedCredits && costoVideo > 0) {
      user.credits -= costoVideo;
      await user.save();
    }

    const cleanJobId =
      typeof jobId === 'string' && jobId.trim() ? jobId.trim() : null;
    const jobUsage = cleanJobId ? getJobUsage(cleanJobId) : null;

    const effectiveResolvedParams =
      resolvedParams || parameters?.resolvedParams || null;

    const resolvedAspectRatio =
      aspectRatio ||
      effectiveResolvedParams?.format?.aspectRatio ||
      parameters?.aspectRatio ||
      '9:16';

    const resolvedTitle = title || 'Studio Lite Video';
    const resolvedMode = mode || 'idea';

    const mergedParameters = {
      ...(parameters || {}),
      product: effectiveProduct,
      ...(effectiveResolvedParams ? { resolvedParams: effectiveResolvedParams } : {}),
      ...(jobUsage ? { usage: jobUsage } : {})
    };

    let savedVideo;

    if (cleanJobId) {
      const updateFields = {
        userId: validUserId,
        email: user.email,
        title: resolvedTitle,
        mode: resolvedMode,
        aspectRatio: resolvedAspectRatio,
        parameters: mergedParameters,
        ...(videoUrl ? { videoUrl } : {})
      };

      savedVideo = await Video.findOneAndUpdate(
        { jobId: cleanJobId },
        {
          $set: updateFields,
          $setOnInsert: {
            jobId: cleanJobId,
            createdAt: new Date()
          }
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true
        }
      );
    } else {
      savedVideo = new Video({
        userId: validUserId,
        email: user.email,
        title: resolvedTitle,
        mode: resolvedMode,
        aspectRatio: resolvedAspectRatio,
        parameters: mergedParameters,
        ...(videoUrl ? { videoUrl } : {})
      });
      await savedVideo.save();
    }

    return res.status(201).json({
      success: true,
      video: savedVideo,
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
      User.findOne({ email }).select('credits plan').lean()
    ]);

    return res.status(200).json({
      success: true,
      videos,
      ...(typeof dbUser?.credits === 'number'
        ? { credits: dbUser.credits, remainingCredits: dbUser.credits }
        : {})
    });
  } catch (error) {
    console.error('Error al obtener videos:', error);
    return res.status(500).json({ error: 'Error al obtener los videos' });
  }
});

module.exports = router;
