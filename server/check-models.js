// check-models.js
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listImageModels() {
  const pager = await ai.models.list();

  for await (const model of pager) {
    const name = model.name || '';
    const methods = model.supportedActions || model.supportedGenerationMethods || [];
    const looksLikeImage =
      /image|imagen|flash-image|veo/i.test(name) ||
      methods.some((m) => /image/i.test(String(m)));

    if (looksLikeImage) {
      console.log({
        name,
        displayName: model.displayName,
        supportedMethods: methods
      });
    }
  }
}

listImageModels().catch((err) => {
  console.error('Error listando modelos:', err);
  process.exit(1);
});
