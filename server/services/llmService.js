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
  return { aiClient, Type: SchemaType };
}

async function generateStructuredScript(rawPayload) {
  const { aiClient, Type } = await getGeminiClient();

  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload;

  const { meta = {}, userInputs = {}, config = {} } = masterPayload;
  const userPlan = meta.userPlan || 'free_trial';
  const targetLanguage = meta.language || userInputs.language || 'en';

  const isFreeTrial = userPlan === 'free_trial';
  const maxDurationSeconds = isFreeTrial ? 30 : 70;
  const sceneRange = isFreeTrial ? '4 to 5' : '8 to 10';

  const isSpanish = targetLanguage.toLowerCase() === 'es';

  const systemInstruction = isSpanish
    ? `Eres un director experto en videos cortos virales para Cempai.ai enfocados en el mercado hispano de Estados Unidos.
REGLAS OBLIGATORIAS:
1. La duración total acumulada no debe superar ${maxDurationSeconds} segundos.
2. Divide el video en ${sceneRange} escenas.
3. IDIOMA: El campo "title" y el campo "voiceoverText" de cada escena DEBEN estar escritos 100% en ESPAÑOL natural y persuasivo.
4. El campo "visualPrompt" de cada escena DEBE estar escrito ESTRICTAMENTE EN INGLÉS (para modelos de IA visuales).`
    : `You are an expert viral short-form video director for Cempai.ai.
MANDATORY RULES:
1. Total duration must not exceed ${maxDurationSeconds} seconds.
2. Divide into ${sceneRange} scenes.
3. LANGUAGE: All fields ("title", "voiceoverText", and "visualPrompt") MUST be in ENGLISH.`;

  const userPrompt = `
Genera el guion estructurado en idioma: [${targetLanguage.toUpperCase()}]
- Modo: ${userInputs.mode || 'idea'}
- Idea / Contenido base: ${userInputs.rawContent}
- Tono: ${userInputs.tone || 'dynamic'}
- Estilo visual: ${config.visualStyle || userInputs.visualStyle || 'cinematic'}
`;

  try {
    console.log(`🚀 [Pipeline LLM] Generando en idioma: [${targetLanguage.toUpperCase()}]...`);

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            totalDurationSeconds: { type: Type.NUMBER },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  durationSeconds: { type: Type.NUMBER },
                  voiceoverText: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING }
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

    return {
      ...masterPayload,
      llmDirective: {
        ...(masterPayload.llmDirective || {}),
        provider: 'google-gemini',
        model: 'gemini-3.8-flash',
        language: targetLanguage,
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
