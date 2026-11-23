require('dotenv').config();
const {
  GLOBALS,
  resolveVoiceModelId,
  modelSupportsAudioTags
} = require('../config/globals');
const { clampNumber, normalizeKey } = require('../utils/sharedHelpers');

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

function resolveVoiceFromCatalog(meta = {}, userInputs = {}) {
  const catalog = GLOBALS.VOICE_CATALOG || {};
  const requestedVoice = String(
    meta.voice || meta.voiceSlot || userInputs.voice || ''
  ).trim();
  const requestedVoiceName = String(
    meta.voiceName || userInputs.voiceName || ''
  ).trim().toLowerCase();
  const requestedVoiceId = String(
    meta.voiceId || userInputs.voiceId || ''
  ).trim();

  for (const [slotKey, entry] of Object.entries(catalog)) {
    if (!entry || typeof entry !== 'object') continue;
    const matchBySlot =
      requestedVoice &&
      (slotKey.toLowerCase() === requestedVoice.toLowerCase() ||
        String(entry.name || '').toLowerCase() === requestedVoice.toLowerCase() ||
        String(entry.id || '').toLowerCase() === requestedVoice.toLowerCase());
    const matchByName =
      requestedVoiceName &&
      String(entry.voiceName || '').toLowerCase() === requestedVoiceName;
    const matchById =
      requestedVoiceId &&
      String(entry.id || '').toLowerCase() === requestedVoiceId.toLowerCase();

    if (matchBySlot || matchByName || matchById) {
      return {
        voiceSlot: entry.name || slotKey,
        voiceName: entry.voiceName || entry.name || slotKey,
        voiceId: entry.id || '',
        language: entry.language || 'en',
        profile: entry.profile || 'flexible_dynamic',
        tier: entry.tier || 'free'
      };
    }
  }

  return null;
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

  const normalizedPlanKey = normalizeKey(userPlan, {}, planRules, 'free_trial');
  const rule = planRules[normalizedPlanKey] || planRules.free_trial;
  const targetDurationSeconds =
    typeof requestedDuration === 'number' && requestedDuration > 0
      ? Math.min(requestedDuration, rule.maxDurationSeconds)
      : rule.defaultDurationSeconds;

  return {
    ...rule,
    targetDurationSeconds
  };
}

function normalizePresetKey(rawPreset) {
  return normalizeKey(
    rawPreset,
    GLOBALS.PRESET_ALIASES || {},
    GLOBALS.BASE_PRESET_MODIFIERS || {},
    'default'
  );
}

function resolveVisualStyle(meta = {}, userInputs = {}) {
  const rawStyle = String(
    meta.visualStyle || userInputs.visualStyle || ''
  )
    .trim()
    .toLowerCase();
  const styles = GLOBALS.VISUAL_STYLES || {};
  if (rawStyle && Object.prototype.hasOwnProperty.call(styles, rawStyle)) {
    return styles[rawStyle];
  }
  return null;
}

function normalizeVoiceDirection(rawDirection, fallbackIntent = 'steady_delivery') {
  const src = rawDirection && typeof rawDirection === 'object' ? rawDirection : {};
  const emphasisList = Array.isArray(src.emphasisPhrases)
    ? src.emphasisPhrases.map((p) => String(p).trim()).filter(Boolean)
    : [];

  const rawShift = String(src.energyShift || 'steady').toLowerCase().trim();
  const energyShift = ['slight_up', 'slight_down', 'steady'].includes(rawShift)
    ? rawShift
    : 'steady';

  return {
    intent: String(src.intent || fallbackIntent).trim(),
    emphasisPhrases: emphasisList,
    pauseBeforeMs: clampNumber(src.pauseBeforeMs, 0, 1500, 0),
    pauseAfterMs: clampNumber(src.pauseAfterMs, 0, 1500, 0),
    energyShift
  };
}

function stripAudioTags(text = '') {
  return String(text || '')
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeWordTokens(text = '') {
  return stripAudioTags(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function alignSpokenToVoiceover(voiceoverText = '', spokenText = '') {
  const baseText = stripAudioTags(voiceoverText);
  const cleanSpoken = stripAudioTags(spokenText);

  if (!baseText) return cleanSpoken;
  if (!cleanSpoken) return baseText;

  const baseTokens = normalizeWordTokens(baseText);
  const spokenTokens = normalizeWordTokens(cleanSpoken);

  const exactMatch =
    baseTokens.length === spokenTokens.length &&
    baseTokens.every((word, idx) => word === spokenTokens[idx]);

  if (exactMatch) {
    return String(spokenText).replace(/\s+/g, ' ').trim();
  }

  const leadingMatch = String(spokenText || '').match(/^(?:\s*\[[^\]]*\]\s*)+/);
  const leadingTags = leadingMatch ? leadingMatch[0].match(/\[[^\]]*\]/g) || [] : [];

  return leadingTags.length ? `${leadingTags.join(' ')} ${baseText}` : baseText;
}

function buildFallbackSpokenText({
  cleanText,
  role = 'body',
  presetKey = 'default',
  voiceDirection = {},
  supportsTags = true
}) {
  const baseText = stripAudioTags(cleanText);
  if (!baseText) return '';

  if (!supportsTags) {
    return baseText;
  }

  const presetTags =
    (GLOBALS.PRESET_VOICE_TAGS && GLOBALS.PRESET_VOICE_TAGS[presetKey]) ||
    (GLOBALS.PRESET_VOICE_TAGS && GLOBALS.PRESET_VOICE_TAGS.default) ||
    {};

  const roleKey = role === 'hook' || role === 'cta' ? role : 'body';
  let result = baseText;

  // Resaltar frases de énfasis si existen y están en el texto
  if (Array.isArray(voiceDirection.emphasisPhrases)) {
    for (const phrase of voiceDirection.emphasisPhrases) {
      if (!phrase || phrase.length < 2) continue;
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<!\\[emphasis\\]\\s*)(${escaped})`, 'i');
      if (regex.test(result)) {
        result = result.replace(regex, '[emphasis] $1');
        break;
      }
    }
  }

  const prefixTag = presetTags[roleKey] ? `${presetTags[roleKey]} ` : '';
  result = `${prefixTag}${result}`.trim();

  if (Number(voiceDirection.pauseAfterMs) >= 600 && !result.endsWith('...')) {
    result = `${result} [pause]`;
  }

  return result.replace(/\s{2,}/g, ' ').trim();
}

function attachVisualConsistency(structuredScript, visualStyle = null) {
  if (!structuredScript || typeof structuredScript !== 'object') {
    return structuredScript;
  }

  const rawBible = (structuredScript.characterAndStyleBible || '').trim();
  const visualAnchor = visualStyle?.promptAnchor
    ? `${visualStyle.promptAnchor}. ${rawBible}`.trim()
    : rawBible;

  const styleGuide = {
    styleAnchor: visualAnchor,
    visualStyle: visualStyle?.key || null
  };

  const scenes = Array.isArray(structuredScript.scenes)
    ? structuredScript.scenes.map((scene) => {
        const sceneVisual = (scene.visualPrompt || '').trim();
        const imagePrompt = [visualAnchor, sceneVisual].filter(Boolean).join(' | ');

        return {
          ...scene,
          imagePrompt
        };
      })
    : [];

  return {
    ...structuredScript,
    characterAndStyleBible: visualAnchor,
    styleGuide,
    scenes
  };
}

async function generateStructuredScript(rawPayload) {
  const { aiClient, Type } = await getGeminiClient();

  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload;
  const { meta = {}, userInputs = {}, orchestration = {} } = masterPayload;

  const rawPlan = meta.userPlan || 'free_trial';
  const userPlan = normalizeKey(rawPlan, {}, GLOBALS.PLAN_POLICIES, 'free_trial');

  const planConfig = getPlanConfig(userPlan, meta.targetDurationSeconds);
  const effectiveMode =
    planConfig.allowCustomScript && userInputs.mode === 'custom_script'
      ? 'custom_script'
      : 'idea';

  const rawLang = (meta.language || userInputs.language || 'en').toLowerCase();
  const targetLanguage = rawLang.startsWith('es') ? 'es' : 'en';
  const languageLabel = targetLanguage === 'es' ? 'SPANISH (es)' : 'ENGLISH (en)';

  const endingBufferSeconds =
    typeof orchestration.endingBufferSeconds === 'number'
      ? clampNumber(
          orchestration.endingBufferSeconds,
          GLOBALS.SAFETY_LIMITS.endingBufferSeconds.min,
          GLOBALS.SAFETY_LIMITS.endingBufferSeconds.max,
          2
        )
      : GLOBALS.SAFETY_LIMITS.endingBufferSeconds.defaultValue;
  const pacing = orchestration.pacing || 'balanced';
  const rawPreset = meta.preset || userInputs.preset || 'default';
  const presetKey = normalizePresetKey(rawPreset);
  const visualStyle = resolveVisualStyle(meta, userInputs);
  const resolvedVoiceModelId = resolveVoiceModelId({
    explicitModelId: meta.voiceModelId || userInputs.voiceModelId,
    preset: presetKey,
    userPlan
  });
  const supportsTags = modelSupportsAudioTags(resolvedVoiceModelId);
  const presetTagGuide =
    (GLOBALS.PRESET_VOICE_TAGS && GLOBALS.PRESET_VOICE_TAGS[presetKey]) ||
    (GLOBALS.PRESET_VOICE_TAGS && GLOBALS.PRESET_VOICE_TAGS.default) ||
    {};

  const resolvedVoice = resolveVoiceFromCatalog(meta, userInputs);
  const voiceConfig = resolvedVoice
    ? {
        ...resolvedVoice,
        preset: presetKey,
        modelId: resolvedVoiceModelId,
        supportsAudioTags: supportsTags
      }
    : {
        voiceSlot: meta.voice || null,
        voiceName: meta.voiceName || null,
        voiceId: null,
        language: targetLanguage,
        profile: 'flexible_dynamic',
        tier: 'free',
        preset: presetKey,
        modelId: resolvedVoiceModelId,
        supportsAudioTags: supportsTags
      };

  if (!userInputs.rawContent || !String(userInputs.rawContent).trim()) {
    throw new Error('Field "userInputs.rawContent" is required to generate the script.');
  }

  const providedHook = userInputs.hook ? String(userInputs.hook).trim() : '';
  const providedCta = userInputs.cta ? String(userInputs.cta).trim() : '';

  const systemInstruction = `You are an expert short-form video director for Cempai.ai.
MANDATORY RULES:
1. Active plan: "${userPlan}". Maximum allowed duration: ${planConfig.maxDurationSeconds}s. Target script duration: ${planConfig.targetDurationSeconds}s (leaving a ${endingBufferSeconds}s soft closing buffer at the end; total scene duration MUST NOT exceed ${planConfig.targetDurationSeconds}s).
2. Divide the video into ${planConfig.sceneRange} scenes with "${pacing}" pacing.
3. ALWAYS include a strong opening "hook" and a cohesive closing "cta" (never end abruptly). Tag each scene with "role": "hook", "body", or "cta".
   - IMPORTANT FOR CTA & PRESET COHERENCE: Maintain the preset's overall mood and restraint throughout the entire arc, INCLUDING the "cta". For atmospheric, mysterious, documentary, or dramatic presets (such as "dark_mystery", "cinematic", "documentary"), do NOT switch to a bright, upbeat, or hype commercial outro; keep the CTA aligned with the preset's tone and tension.
4. VISUAL & CHARACTER CONSISTENCY:
   - Define in "characterAndStyleBible" the unified visual aesthetic and exact recurring character description (appearance, age range, clothing, base expression, environment, and lighting) so the entire video feels cohesive.${
     visualStyle
       ? `\n   - Apply visual style "${visualStyle.label}" (${visualStyle.promptAnchor}) consistently across the visual direction.`
       : ''
   }
   - In EVERY "visualPrompt", explicitly restate the key character traits and visual style from "characterAndStyleBible", describing only the scene's specific action, camera framing, and logical progression from the previous scene.
5. CLEAN SUBTITLE TEXT VS. TAGGED SPOKEN TEXT (ELEVEN V4):
   - "voiceoverText" MUST be CLEAN plain text WITHOUT any bracketed audio tags like [whisper], [pause], or [emphasis] so subtitles stay clean and readable.
   - "spokenText" is for voice synthesis (${resolvedVoiceModelId}). ${
     supportsTags
       ? `Include concise bracketed Eleven v4 delivery tags (e.g. [whisper], [slowly], [pause], [measured, steady], [low, eerie], [emphasis]) inline right before the phrases/shifts that need tone, pace, volume, or emphasis changes, guided by preset "${presetKey}" (suggested tags -> hook: ${presetTagGuide.hook || '[steady]'}, body: ${presetTagGuide.body || '[steady]'}, cta: ${presetTagGuide.cta || '[steady]'}). Keep tags natural and concise so they never sound robotic or get read as raw words.`
       : 'Keep "spokenText" clean without bracketed tags.'
   }
   - CRITICAL NARRATION & SUBTITLE SYNCHRONIZATION RULES (STRICT):
     * "spokenText" MUST contain the EXACT SAME WORDS in the EXACT SAME ORDER as "voiceoverText".
     * NEVER paraphrase, summarize, shorten, expand, replace synonyms, change numbers/units, or alter wording between "voiceoverText" and "spokenText".
     * Only insert bracketed vocal delivery tags ([...]) around or between the exact words of "voiceoverText".
     * If all [...] tags are stripped from "spokenText", the remaining words must match "voiceoverText" word-for-word.
6. VOICE DIRECTION METADATA:
   - For each scene, include a "voiceDirection" object:
     * "intent": short delivery intent (e.g. "hook_attention", "explain_point", "emphasize_contrast", "call_to_action").
     * "emphasisPhrases": array of 1 to 3 key short phrases from "voiceoverText" to stress naturally.
     * "pauseBeforeMs": recommended lead-in pause in milliseconds (0 to 1500).
     * "pauseAfterMs": recommended trailing pause in milliseconds (0 to 1500).
     * "energyShift": one of "steady", "slight_up", or "slight_down".
7. ${
    effectiveMode === 'custom_script'
      ? 'CUSTOM_SCRIPT MODE: Preserve the user’s provided script text faithfully without rewriting its core wording; segment it into timed scenes and integrate the hook/CTA if provided.'
      : 'IDEA MODE: Craft a cohesive, engaging script from the user’s idea.'
  }
8. LANGUAGE RULES:
   - Spoken/editorial fields ("title", "hook.text", "cta.text", and every scene's "voiceoverText" and "spokenText") MUST be written naturally in ${languageLabel}.
   - AI visual generation fields ("characterAndStyleBible" and every scene's "visualPrompt") MUST ALWAYS be written in clear, detailed ENGLISH regardless of the spoken language.`;

  const userPrompt = `
Generate the structured video script using these inputs:
- Spoken Output Language: ${languageLabel}
- Plan Tier: ${userPlan}
- Mode: ${effectiveMode}
- Tone: ${userInputs.tone || 'engaging'}
- Preset Style: ${presetKey}
- Visual Style Override: ${visualStyle ? visualStyle.key : 'preset_default'}
- Voice Model ID: ${resolvedVoiceModelId}
- Voice Slot: ${voiceConfig.voiceSlot || 'default'}
- Voice Name: ${voiceConfig.voiceName || 'default'}
- Voice Profile: ${voiceConfig.profile || 'flexible_dynamic'}
- Base Idea / Script: ${userInputs.rawContent}
- Requested Hook: ${providedHook || 'Generate a high-retention opening hook'}
- Requested CTA: ${providedCta || 'Generate a cohesive closing call-to-action that preserves the preset mood'}
- Target Duration Seconds: ${planConfig.targetDurationSeconds}
- Ending Buffer Seconds: ${endingBufferSeconds}
- Pacing: ${pacing}
`;

  try {
    console.log(
      `🚀 [Pipeline LLM] Plan: [${userPlan}] | Mode: [${effectiveMode}] | Lang: [${targetLanguage.toUpperCase()}] | Voice: [${voiceConfig.voiceSlot || 'none'}:${voiceConfig.voiceName || 'none'}] | Model: [${resolvedVoiceModelId}] | Preset: [${presetKey}] | Target: ${planConfig.targetDurationSeconds}s`
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
                  spokenText: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  voiceDirection: {
                    type: Type.OBJECT,
                    properties: {
                      intent: { type: Type.STRING },
                      emphasisPhrases: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      pauseBeforeMs: { type: Type.NUMBER },
                      pauseAfterMs: { type: Type.NUMBER },
                      energyShift: { type: Type.STRING }
                    },
                    required: [
                      'intent',
                      'emphasisPhrases',
                      'pauseBeforeMs',
                      'pauseAfterMs',
                      'energyShift'
                    ]
                  }
                },
                required: [
                  'sceneNumber',
                  'role',
                  'startSeconds',
                  'endSeconds',
                  'durationSeconds',
                  'voiceoverText',
                  'spokenText',
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
      const resolvedRole =
        scene.role ||
        (i === 0 ? 'hook' : i === structuredScript.scenes.length - 1 ? 'cta' : 'body');

      const cleanVoiceoverText = stripAudioTags(scene.voiceoverText || scene.spokenText || '');
      const normalizedDirection = normalizeVoiceDirection(scene.voiceDirection, resolvedRole);
      const rawSpokenCandidate = String(scene.spokenText || '').trim();
      const finalSpokenText = supportsTags
        ? rawSpokenCandidate
          ? alignSpokenToVoiceover(cleanVoiceoverText, rawSpokenCandidate)
          : buildFallbackSpokenText({
              cleanText: cleanVoiceoverText,
              role: resolvedRole,
              presetKey,
              voiceDirection: normalizedDirection,
              supportsTags: true
            })
        : stripAudioTags(rawSpokenCandidate || cleanVoiceoverText);

      validatedScenes.push({
        sceneNumber: i + 1,
        role: resolvedRole,
        startSeconds,
        endSeconds,
        durationSeconds: finalDur,
        voiceoverText: cleanVoiceoverText,
        spokenText: finalSpokenText,
        visualPrompt: scene.visualPrompt,
        voiceSlot: voiceConfig.voiceSlot,
        voiceName: voiceConfig.voiceName,
        voiceId: voiceConfig.voiceId,
        voiceDirection: normalizedDirection
      });

      cursorSec = endSeconds;
    }

    structuredScript.scenes = validatedScenes;
    structuredScript.totalDurationSeconds = Number(cursorSec.toFixed(2));
    structuredScript.endingBufferSeconds = endingBufferSeconds;

    const enrichedScript = attachVisualConsistency(structuredScript, visualStyle);

    return {
      ...masterPayload,
      llmDirective: {
        ...(masterPayload.llmDirective || {}),
        provider: 'google-gemini',
        model: 'gemini-3.8-flash',
        language: targetLanguage,
        planApplied: userPlan,
        effectiveMode,
        preset: presetKey,
        visualStyle: visualStyle?.key || null,
        voiceModelId: resolvedVoiceModelId,
        voiceConfig,
        structuredScript: enrichedScript
      }
    };
  } catch (error) {
    console.error('❌ Error in generateStructuredScript (Gemini):', error);
    throw error;
  }
}

async function generateDialogueScript(rawPayload) {
  const { aiClient, Type } = await getGeminiClient();

  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload;
  const { meta = {}, userInputs = {} } = masterPayload;

  const rawLang = (meta.language || userInputs.language || 'en').toLowerCase();
  const targetLanguage = rawLang.startsWith('es') ? 'es' : 'en';
  const languageLabel = targetLanguage === 'es' ? 'SPANISH (es)' : 'ENGLISH (en)';

  const speakers =
    Array.isArray(userInputs.speakers) && userInputs.speakers.length >= 2
      ? userInputs.speakers
      : [
          { name: 'Elena', speakerKey: 'speaker_a', voiceId: 'elena' },
          { name: 'Mateo', speakerKey: 'speaker_b', voiceId: 'mateo' }
        ];

  const turnCount =
    typeof userInputs.turnCount === 'number' && userInputs.turnCount > 0
      ? clampNumber(Math.round(userInputs.turnCount), 2, 12, 0)
      : 4;

  const topic =
    userInputs.topic ||
    userInputs.rawContent ||
    'A concise, natural two-person conversation about making a smart product decision.';

  const systemInstruction = `You are a dialogue writer for Cempai.ai.
Write a natural, engaging multi-turn conversation in ${languageLabel} between these speakers:
${speakers.map((s, idx) => `- ${s.name} (speakerKey: ${s.speakerKey || `speaker_${idx + 1}`}, voiceId: ${s.voiceId || s.name.toLowerCase()})`).join('\n')}

Rules:
- Produce ${turnCount} turns alternating naturally.
- Keep each "line" crisp and natural to speak aloud.
- Include "voiceDirection" for every turn with "intent", "emphasisPhrases", "pauseBeforeMs", "pauseAfterMs", and "energyShift" ("steady", "slight_up", or "slight_down").`;

  const userPrompt = `Topic / Prompt: ${topic}
Tone: ${userInputs.tone || 'natural, conversational'}
Language: ${languageLabel}`;

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
          setting: { type: Type.STRING },
          turns: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                turnNumber: { type: Type.INTEGER },
                speaker: { type: Type.STRING },
                speakerKey: { type: Type.STRING },
                voiceId: { type: Type.STRING },
                line: { type: Type.STRING },
                suggestedDurationSeconds: { type: Type.NUMBER },
                voiceDirection: {
                  type: Type.OBJECT,
                  properties: {
                    intent: { type: Type.STRING },
                    emphasisPhrases: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    pauseBeforeMs: { type: Type.NUMBER },
                    pauseAfterMs: { type: Type.NUMBER },
                    energyShift: { type: Type.STRING }
                  },
                  required: [
                    'intent',
                    'emphasisPhrases',
                    'pauseBeforeMs',
                    'pauseAfterMs',
                    'energyShift'
                  ]
                }
              },
              required: ['turnNumber', 'speaker', 'line', 'voiceDirection']
            }
          }
        },
        required: ['title', 'setting', 'turns']
      }
    }
  });

  if (!response || !response.text) {
    throw new Error('Empty dialogue response returned by Gemini.');
  }

  const parsed = JSON.parse(response.text);
  const turns = Array.isArray(parsed.turns)
    ? parsed.turns.map((turn, index) => {
        const matchedSpeaker = speakers[index % speakers.length] || {};
        return {
          turnNumber: Number(turn.turnNumber) || index + 1,
          speaker: turn.speaker || matchedSpeaker.name || `Speaker ${index + 1}`,
          speakerKey: turn.speakerKey || matchedSpeaker.speakerKey || `speaker_${index + 1}`,
          voiceId: turn.voiceId || matchedSpeaker.voiceId || String(turn.speaker || '').toLowerCase(),
          line: String(turn.line || '').trim(),
          suggestedDurationSeconds: Number(turn.suggestedDurationSeconds) || 4,
          voiceDirection: normalizeVoiceDirection(turn.voiceDirection, 'conversation_turn')
        };
      })
    : [];

  const dialogue = {
    title: parsed.title || 'Dialogue',
    setting: parsed.setting || '',
    turns
  };

  return {
    ...masterPayload,
    dialogue,
    llmDirective: {
      ...(masterPayload.llmDirective || {}),
      provider: 'google-gemini',
      model: 'gemini-3.8-flash',
      language: targetLanguage,
      dialogue
    }
  };
}

module.exports = {
  generateStructuredScript,
  generateDialogueScript
};
