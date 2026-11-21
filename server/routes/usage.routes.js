// server/routes/usage.routes.js
const express = require('express');
const router = express.Router();
const { getJobUsage, listAllUsage } = require('../services/usageCostService');

// Resumen general de consumos y costos
router.get('/', (_req, res) => {
  return res.json({
    success: true,
    ...listAllUsage()
  });
});

// Detalle de consumo y costo de un job específico
router.get('/:jobId', (req, res) => {
  const record = getJobUsage(req.params.jobId);
  if (!record) {
    return res.status(404).json({
      success: false,
      error: `No se encontró registro de consumo para el jobId: ${req.params.jobId}`
    });
  }
  return res.json({
    success: true,
    usage: record
  });
});

module.exports = router;
