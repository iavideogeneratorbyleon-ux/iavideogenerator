// server/routes/usage.routes.js
const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { getJobUsage, listAllUsage } = require('../services/usageCostService');

// Resumen general de consumos y costos (incluye desglose byProduct y byPlan)
router.get('/', (_req, res) => {
  return res.json({
    success: true,
    ...listAllUsage()
  });
});

// Detalle de consumo y costo de un job específico (memoria + respaldo en MongoDB)
router.get('/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const record = getJobUsage(jobId);

  if (record) {
    return res.json({
      success: true,
      source: 'memory',
      usage: record
    });
  }

  try {
    const videoDoc = await Video.findOne({ jobId })
      .select('jobId product userId email parameters usage createdAt')
      .lean();

    const persistedUsage =
      videoDoc?.usage ||
      videoDoc?.parameters?.usage ||
      videoDoc?.parameters?.usageSummary ||
      null;

    if (persistedUsage) {
      return res.json({
        success: true,
        source: 'database',
        usage: persistedUsage
      });
    }
  } catch (_) {
    // Continuar al 404 si no se pudo consultar DB
  }

  return res.status(404).json({
    success: false,
    error: `No se encontró registro de consumo para el jobId: ${jobId}`
  });
});

module.exports = router;
