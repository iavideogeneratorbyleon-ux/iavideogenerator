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

function getPlanConfig(userPlan, requestedDuration) {
  const planRules = {
    free_trial: {
      maxDurationSeconds: 30,
      defaultDurationSeconds: 28,
      sceneRange: '4 to 5',
      allowCustomScript: false
    },
    pay_per_video: {
      maxDurationSeconds: 60,
      defaultDurationSeconds: 45,
      sceneRange: '6 to 8',
      allowCustomScript: true
    },
    pro: {
      maxDurationSeconds: 70,
      defaultDurationSeconds: 50,
      sceneRange: '8 to 10',
      allowCustomScript: true
    },
    unlimited: {
      maxDurationSeconds: 90,
      defaultDurationSeconds: 60,
      sceneRange: '8 to 12',
      allowCustomScript: true
    }
  };

  const rule = planRules[userPlan] || planRules.free_trial;
  const targetDurationSeconds =
    typeof requestedDuration === 'number' && requestedDuration > 0
      ? Math.min(requestedDuration, rule.maxDurationSeconds)
      : rule.defaultDurationSeconds;

  return {
    ...rule,
    targetDurationSeconds
  };
}

function attachVisualConsistency(structuredScript) {
  if (!structuredScript || typeof structuredScript !== 'object') {
    return structuredScript;
  }

  const bible = (structuredScript.characterAndStyleBible || '').trim();

  const styleGuide = {
    styleAnchor: bible,
    avoidStyles:
      'anime, cartoon, comic book, neon cyberpunk, inconsistent character appearance or outfit changes'
  };

  const scenes = Array.isArray(structuredScript.scenes)
    ? structuredScript.scenes.map((scene) => {
        const sceneVisual = (scene.visualPrompt || '').trim();
        const imagePrompt = [bible, sceneVisual].filter(Boolean).join(' | ');

        return {
          ...scene,
          imagePrompt
        };
      })
    : [];

  return {
    ...structuredScript,
    styleGuide,
    scenes
  };
}

async function generateStructuredScript(rawPayload) {
  const { aiClient, Type } = await getGeminiClient();

  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload;
  const { meta = {}, userInputs = {}, orchestration = {} } = masterPayload;

  const rawPlan = meta.userPlan || 'free_trial';
  const userPlan = ['free_trial', 'pay_per_video', 'pro', 'unlimited'].includes(rawPlan)
    ? rawPlan
    : 'free_trial';

  const planConfig = getPlanConfig(userPlan, meta.targetDurationSeconds);
  const effectiveMode =
    planConfig.allowCustomScript && userInputs.mode === 'custom_script'
      ? 'custom_script'
      : 'idea';

  // English is the default language; Spanish ('es') is supported as secondary language
  const rawLang = (meta.language || userInputs.language || 'en').toLowerCase();
  const targetLanguage = rawLang.startsWith('es') ? 'es' : 'en';
  const languageLabel = targetLanguage === 'es' ? 'SPANISH (es)' : 'ENGLISH (en)';

  const endingBufferSeconds =
    typeof orchestration.endingBufferSeconds === 'number'
      ? Math.max(0, Math.min(orchestration.endingBufferSeconds, 4))
      : 1.5;
  const pacing = orchestration.pacing || 'balanced';

  if (!userInputs.rawContent || !String(userInputs.rawContent).trim()) {
    throw new Error('Field "userInputs.rawContent" is required to generate the script.');
  }

  const providedHook = userInputs.hook ? String(userInputs.hook).trim() : '';
  const providedCta = userInputs.cta ? String(userInputs.cta).trim() : '';

  const systemInstruction = `You are an expert viral short-form video director for Cempai.ai.
MANDATORY RULES:
1. Active plan: "${userPlan}". Maximum allowed duration: ${planConfig.maxDurationSeconds}s. Target script duration: ${planConfig.targetDurationSeconds}s (leaving a ${endingBufferSeconds}s soft closing buffer at the end; total scene duration MUST NOT exceed ${planConfig.targetDurationSeconds}s).
2. Divide the video into ${planConfig.sceneRange} scenes with "${pacing}" pacing.
3. ALWAYS include a strong opening "hook" and a clear, natural closing "cta" (never end abruptly). Tag each scene with "role": "hook", "body", or "cta".
4. VISUAL & CHARACTER CONSISTENCY:
   - Define in "characterAndStyleBible" the unified visual aesthetic and exact recurring character description (appearance, age range, clothing, base expression, environment, and lighting) so the entire video feels cohesive.
   - In EVERY "visualPrompt", explicitly restate the key character traits and visual style from "characterAndStyleBible", describing only the scene's specific action, camera framing, and logical progression from the previous scene.
5. ${
    effectiveMode === 'custom_script'
      ? 'CUSTOM_SCRIPT MODE: Preserve the user’s provided script text faithfully without rewriting its core wording; segment it into timed scenes and integrate the hook/CTA if provided.'
      : 'IDEA MODE: Craft a cohesive, persuasive, and engaging script from the user’s idea.'
  }
6. LANGUAGE RULES:
   - Spoken/editorial fields ("title", "hook.text", "cta.text", and every scene's "voiceoverText") MUST be written naturally in ${languageLabel}.
   - AI visual generation fields ("characterAndStyleBible" and every scene's "visualPrompt") MUST ALWAYS be written in clear, detailed ENGLISH regardless of the spoken language.`;

  const userPrompt = `
Generate the structured video script using these inputs:
- Spoken Output Language: ${languageLabel}
- Plan Tier: ${userPlan}
- Mode: ${effectiveMode}
- Tone: ${userInputs.tone || 'engaging'}
- Base Idea / Script: ${userInputs.rawContent}
- Requested Hook: ${providedHook || 'Generate a high-retention opening hook'}
- Requested CTA: ${providedCta || 'Generate a clear closing call-to-action'}
- Target Duration Seconds: ${planConfig.targetDurationSeconds}
- Ending Buffer Seconds: ${endingBufferSeconds}
- Pacing: ${pacing}
`;

  try {
    console.log(
      `🚀 [Pipeline LLM] Plan: [${userPlan}] | Mode: [${effectiveMode}] | Lang: [${targetLanguage.toUpperCase()}] | Target: ${planConfig.targetDurationSeconds}s`
    );

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
            characterAndStyleBible: { type: Type.STRING },
            hook: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                durationSeconds: { type: Type.NUMBER }
              },
              required: ['text', 'durationSeconds']
            },
            cta: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                durationSeconds: { type: Type.NUMBER }
              },
              required: ['text', 'durationSeconds']
            },
            totalDurationSeconds: { type: Type.NUMBER },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  role: { type: Type.STRING },
                  startSeconds: { type: Type.NUMBER },
                  endSeconds: { type: Type.NUMBER },
                  durationSeconds: { type: Type.NUMBER },
                  voiceoverText: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING }
                },
                required: [
                  'sceneNumber',
                  'role',
                  'startSeconds',
                  'endSeconds',
                  'durationSeconds',
                  'voiceoverText',
                  'visualPrompt'
                ]
              }
            }
          },
          required: [
            'title',
            'characterAndStyleBible',
            'hook',
            'cta',
            'totalDurationSeconds',
            'scenes'
          ]
        }
      }
    });

    if (!response || !response.text) {
      throw new Error('Empty response returned by Gemini.');
    }

    const structuredScript = JSON.parse(response.text);

    let cursorSec = 0;
    const validatedScenes = [];
    const maxAllowed = planConfig.targetDurationSeconds;

    for (let i = 0; i < (structuredScript.scenes || []).length; i++) {
      const scene = structuredScript.scenes[i];
      const rawDur = Number(scene.durationSeconds) || 4;
      const remaining = Number((maxAllowed - cursorSec).toFixed(2));

      if (remaining <= 0.5) break;

      const finalDur = rawDur <= remaining ? Number(rawDur.toFixed(2)) : remaining;
      const startSeconds = Number(cursorSec.toFixed(2));
      const endSeconds = Number((startSeconds + finalDur).toFixed(2));

      validatedScenes.push({
        sceneNumber: i + 1,
        role:
          scene.role ||
          (i === 0 ? 'hook' : i === structuredScript.scenes.length - 1 ? 'cta' : 'body'),
        startSeconds,
        endSeconds,
        durationSeconds: finalDur,
        voiceoverText: scene.voiceoverText,
        visualPrompt: scene.visualPrompt
      });

      cursorSec = endSeconds;
    }

    structuredScript.scenes = validatedScenes;
    structuredScript.totalDurationSeconds = Number(cursorSec.toFixed(2));
    structuredScript.endingBufferSeconds = endingBufferSeconds;

    const enrichedScript = attachVisualConsistency(structuredScript);

    return {
      ...masterPayload,
      llmDirective: {
        ...(masterPayload.llmDirective || {}),
        provider: 'google-gemini',
        model: 'gemini-3.8-flash',
        language: targetLanguage,
        planApplied: userPlan,
        effectiveMode,
        structuredScript: enrichedScript
      }
    };
  } catch (error) {
    console.error('❌ Error in generateStructuredScript (Gemini):', error);
    throw error;
  }
}

module.exports = {
  generateStructuredScript
};
