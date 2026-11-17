
const express = require('express');
const router = express.Router();
const { generateStructuredScript } = require('../services/llmService');

router.post('/generate-script', async (req, res) => {
  try {
    const result = await generateStructuredScript(req.body);
    return res.status(200).json({ success: true, payload: result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

