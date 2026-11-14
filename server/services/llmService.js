// server/services/llmService.js
require('dotenv').config();

let aiClient = null;
let SchemaType = null;

async function getGeminiClient() {
  if (!aiClient) {
    const { GoogleGenAI, Type } = await import('@google/genai');
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    SchemaType = Type;
  }
  return { ai: aiClient, Type: SchemaType };
}

async function generateStructuredScript(masterPayload) {
  const { ai, Type } = await getGeminiClient();

  const { meta = {}, userInputs = {}, config = {} } = masterPayload;
  const userPlan = meta.userPlan || 'free_trial';

  const isFreeTrial = userPlan === 'free_trial';
  const maxDurationSeconds = isFreeTrial ? 30 : 70;
  const sceneRange = isFreeTrial ? '4 to 5' : '8 to 10';

  const systemInstruction = `
You are an expert viral short-form video director for Cempai.ai, targeting the US market.
Your task is to transform the user's raw idea or script into a tightly paced, high-retention scene-by-scene production JSON.

STRICT BUSINESS & PRODUCTION RULES:
1. Total cumulative duration across all scenes MUST NOT exceed ${maxDurationSeconds} seconds.
2. Divide the video into ${sceneRange} distinct, engaging scenes.
3. LANGUAGE RULE: ALL fields ("title", "voiceoverText", and "visualPrompt") MUST BE WRITTEN ENTIRELY IN ENGLISH, optimized for US audiences and AI media generation models.
4. Keep voiceover sentences natural, punchy, and timed realistically for the scene's duration (approx. 2.5 words per second).
`;

  const userPrompt = `
Create a structured video script based on these inputs:
- Mode: ${userInputs.mode || 'idea'}
- Raw Content / Script: ${userInputs.rawContent}
- Tone: ${userInputs.tone || 'dynamic'}
- Aspect Ratio: ${config.aspectRatio || userInputs.aspectRatio || '9:16'}
- Visual Style: ${config.visualStyle || userInputs.visualStyle || 'cinematic'}
`;

  try {
    console.log(`🚀 [English Pipeline] Generando guion con gemini-3.8-flash...`);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Catchy video title in English' },
            totalDurationSeconds: { type: Type.NUMBER, description: `Sum of all scene durations, <= ${maxDurationSeconds}` },
            scenes: {
              type: Type.ARRAY,
              description: 'Ordered list of video scenes in English',
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  durationSeconds: { type: Type.NUMBER },
                  voiceoverText: { type: Type.STRING, description: 'Spoken narration in English' },
                  visualPrompt: { type: Type.STRING, description: 'Detailed visual scene description in English' }
                },
                required: ['sceneNumber', 'durationSeconds', 'voiceoverText', 'visualPrompt']
              }
            }
          },
          required: ['title', 'totalDurationSeconds', 'scenes']
        }
      }
    });

    if (!response || !response.text) {
      throw new Error('Respuesta vacía por parte de Gemini.');
    }

    const structuredScript = JSON.parse(response.text);

    // Guardrail de duración según plan
    let accumulatedDuration = 0;
    const validatedScenes = [];

    for (const scene of structuredScript.scenes) {
      if (accumulatedDuration + scene.durationSeconds <= maxDurationSeconds) {
        validatedScenes.push(scene);
        accumulatedDuration += scene.durationSeconds;
      } else {
        const remaining = maxDurationSeconds - accumulatedDuration;
        if (remaining >= 3) {
          validatedScenes.push({ ...scene, durationSeconds: remaining });
          accumulatedDuration += remaining;
        }
        break;
      }
    }

    structuredScript.scenes = validatedScenes;
    structuredScript.totalDurationSeconds = accumulatedDuration;

    console.log(`✅ ¡Guion en inglés listo! Título: "${structuredScript.title}"`);

    return {
      ...masterPayload,
      llmDirective: {
        ...(masterPayload.llmDirective || {}),
        provider: 'google-gemini',
        model: 'gemini-3.8-flash',
        structuredScript
      }
    };
  } catch (error) {
    console.error('❌ Error en generateStructuredScript (Gemini):', error);
    throw error;
  }
}

module.exports = {
  generateStructuredScript
};
