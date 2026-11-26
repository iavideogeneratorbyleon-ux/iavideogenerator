require('dotenv').config();
const {
  GLOBALS,
  resolveAiModelId,
  resolveVoiceModelId,
  modelSupportsAudioTags
} = require('../globals');
const {
  resolvePipelineParameters,
  resolveSceneMediaType
} = require('../../config/params/pipelineRegistry');

const { clampNumber, normalizeKey } = require('../../utils/sharedHelpers');

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

function resolveRequestedLanguage(masterPayload = {}, resolvedParams = {}) {
  const { meta = {}, userInputs = {}, videoConfig = {} } = masterPayload;
  const candidate =
    resolvedParams?.voiceAndScript?.language ||
    userInputs.language ||
    meta.language ||
    videoConfig.language ||
    masterPayload.language ||
    'en';

  const normalized = String(candidate || 'en').trim().toLowerCase();
  return normalized.startsWith('es') || normalized.startsWith('spanish') || normalized.startsWith('español')
    ? 'es'
    : 'en';
}

function resolveVoiceFromCatalog(meta = {}, userInputs = {}, resolvedVoice = null) {
  if (resolvedVoice && resolvedVoice.id) {
    return {
      voiceSlot: resolvedVoice.key || null,
      voiceName: resolvedVoice.voiceName || resolvedVoice.key || null,
      voiceId: resolvedVoice.id,
      language: resolvedVoice.language || 'en',
      profile: resolvedVoice.profile || 'flexible_dynamic',
      tier: resolvedVoice.tier || 'free'
    };
  }

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

function getPlanConfig(userPlan, requestedDuration, resolvedScript = null) {
  const policies = GLOBALS.PLAN_POLICIES || {};
  const fallbackPolicy = policies.free_trial || {
    key: 'free_trial',
    allowedDurationsSec: [30],
    maxDurationSeconds: 30,
    defaultDurationSeconds: 30,
    sceneRange: '4 to 5',
    allowCustomScript: false
  };

  const normalizedPlanKey = normalizeKey(userPlan, {}, policies, 'free_trial');
  const rule = policies[normalizedPlanKey] || fallbackPolicy;
  const allowedDurations =
    Array.isArray(rule.allowedDurationsSec) && rule.allowedDurationsSec.length > 0
      ? rule.allowedDurationsSec
      : [rule.maxDurationSeconds || 30];
  const maxAllowedDur = rule.maxDurationSeconds || Math.max(...allowedDurations);
  const defaultDur = rule.defaultDurationSeconds || allowedDurations[0] || 30;

  let targetDurationSeconds = resolvedScript?.durationSeconds || defaultDur;
  if (!resolvedScript?.durationSeconds && typeof requestedDuration === 'number' && requestedDuration > 0) {
    if (allowedDurations.includes(requestedDuration)) {
      targetDurationSeconds = requestedDuration;
    } else {
      targetDurationSeconds = Math.min(requestedDuration, maxAllowedDur);
    }
  }

  const sceneRange = resolvedScript?.recommendedScenes
    ? `${resolvedScript.recommendedScenes.min} to ${resolvedScript.recommendedScenes.max}`
    : rule.sceneRange;

  return {
    ...rule,
    sceneRange,
    allowedDurationsSec: allowedDurations,
    maxDurationSeconds: maxAllowedDur,
    defaultDurationSeconds: defaultDur,
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

function resolveVisualStyle(meta = {}, userInputs = {}, resolvedVisualFormat = null) {
  if (resolvedVisualFormat?.style) {
    return resolvedVisualFormat.style;
  }

  const rawStyle = String(meta.visualStyle || userInputs.visualStyle || '')
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

function normalizeSfxCue(rawCue, sfxDirective = {}, allowActive = false) {
  if (!allowActive || !sfxDirective?.enabled || !rawCue || typeof rawCue !== 'object') {
    return {
      enabled: false,
      category: 'none',
      prompt: '',
      timing: 'on_enter',
      gain: 0
    };
  }

  const allowedCats = Array.isArray(sfxDirective.preferredCategories) && sfxDirective.preferredCategories.length
    ? sfxDirective.preferredCategories
    : ['whoosh', 'ambient'];
  const rawCat = String(rawCue.category || rawCue.type || '').trim().toLowerCase();
  const category = allowedCats.includes(rawCat) ? rawCat : allowedCats[0] || 'whoosh';

  const allowedTimings = Array.isArray(sfxDirective.allowedTimings) && sfxDirective.allowedTimings.length
    ? sfxDirective.allowedTimings
    : ['on_enter', 'mid_scene', 'on_beat'];
  const rawTiming = String(rawCue.timing || 'on_enter').trim().toLowerCase();
  const timing = allowedTimings.includes(rawTiming) ? rawTiming : 'on_enter';

  const gain = clampNumber(
    rawCue.gain ?? rawCue.volume ?? sfxDirective.defaultGain,
    sfxDirective.minGain ?? 0.08,
    sfxDirective.maxGain ?? 0.28,
    sfxDirective.defaultGain ?? 0.18
  );

  const prompt = String(rawCue.prompt || rawCue.description || '').trim();
  if (!prompt) {
    return {
      enabled: false,
      category: 'none',
      prompt: '',
      timing,
      gain: 0
    };
  }

  return {
    enabled: true,
    category,
    prompt,
    timing,
    gain
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

function extractUsageMetrics(usageMetadata = {}) {
  const inputTokens = Number(usageMetadata?.promptTokenCount || 0);
  const outputTokens = Number(usageMetadata?.candidatesTokenCount || 0);
  const totalTokens = Number(usageMetadata?.totalTokenCount || inputTokens + outputTokens);
  return {
    inputTokens,
    outputTokens,
    totalTokens
  };
}

function attachVisualConsistency(
  structuredScript,
  { visualStyle = null, format = null, mediaMode = null } = {}
) {
  if (!structuredScript || typeof structuredScript !== 'object') {
    return structuredScript;
  }

  const rawBible = (structuredScript.characterAndStyleBible || '').trim();
  const styleParts = Array.from(
    new Set(
      [
        visualStyle?.promptAnchor,
        visualStyle?.lightingAndTexture,
        format?.promptFraming,
        rawBible
      ]
        .map((part) => String(part || '').replace(/\s+/g, ' ').replace(/\.{2,}/g, '.').trim())
        .filter(Boolean)
    )
  );
  const visualAnchor = styleParts.join('. ').replace(/\.\s*\./g, '.').trim();

  const styleGuide = {
    styleAnchor: visualAnchor,
    visualStyle: visualStyle?.key || null,
    aspectRatio: format?.aspectRatio || null,
    mediaMode: mediaMode?.key || null
  };

  const scenes = Array.isArray(structuredScript.scenes)
    ? structuredScript.scenes.map((scene) => {
        const sceneVisual = (scene.visualPrompt || '').trim();
        const resolvedMediaType = resolveSceneMediaType(
          mediaMode || {},
          scene.role || 'body',
          scene.mediaType || null
        );
        const promptSegments = Array.from(
          new Set([visualAnchor, sceneVisual].map((s) => s.trim()).filter(Boolean))
        );
        const imagePrompt = promptSegments.join(' | ');

        return {
          ...scene,
          imageDescription: String(scene.imageDescription || '').trim(),
          mediaType: resolvedMediaType,
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
  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload || {};
  const { meta = {}, userInputs = {}, orchestration = {} } = masterPayload;
  const resolvedParams =
    masterPayload.resolvedParams || resolvePipelineParameters(masterPayload);

  const rawPlan = resolvedParams.meta?.userPlan || meta.userPlan || 'free_trial';
  const userPlan = normalizeKey(rawPlan, {}, GLOBALS.PLAN_POLICIES, 'free_trial');
  const presetKey =
    resolvedParams.preset?.key ||
    normalizePresetKey(meta.preset || userInputs.preset || 'default');
  const presetVariant = resolvedParams.preset?.activeVariant || null;

  const scriptModelId = resolveAiModelId('llm', {
    explicitModelId: meta.scriptModelId || meta.llmModelId || userInputs.scriptModelId,
    preset: presetKey,
    userPlan
  });

  const { aiClient, Type } = await getGeminiClient();

  const planConfig = getPlanConfig(
    userPlan,
    meta.targetDurationSeconds,
    resolvedParams.voiceAndScript?.script
  );
  const effectiveMode =
    planConfig.allowCustomScript && userInputs.mode === 'custom_script'
      ? 'custom_script'
      : 'idea';

  const targetLanguage = resolveRequestedLanguage(masterPayload, resolvedParams);
  const languageLabel = targetLanguage === 'es' ? 'SPANISH (es)' : 'ENGLISH (en)';
  const languageDirectiveText =
    targetLanguage === 'es'
      ? 'Write 100% of all spoken/editorial narration in natural, idiomatic Spanish ("es"). Do NOT write narration in English.'
      : 'Write 100% of all spoken/editorial narration in natural, idiomatic English ("en").';

  const endingBufferSeconds =
    typeof resolvedParams.voiceAndScript?.script?.endingBufferSeconds === 'number'
      ? resolvedParams.voiceAndScript.script.endingBufferSeconds
      : typeof orchestration.endingBufferSeconds === 'number'
        ? clampNumber(
            orchestration.endingBufferSeconds,
            GLOBALS.SAFETY_LIMITS.endingBufferSeconds.min,
            GLOBALS.SAFETY_LIMITS.endingBufferSeconds.max,
            2
          )
        : GLOBALS.SAFETY_LIMITS.endingBufferSeconds.defaultValue;

  const pacing =
    resolvedParams.voiceAndScript?.script?.pacing ||
    orchestration.pacing ||
    'balanced';
  const scriptTone =
    resolvedParams.voiceAndScript?.script?.tone ||
    userInputs.tone ||
    'engaging';
  const maxTotalWords = resolvedParams.voiceAndScript?.script?.maxTotalWords || null;

  const formatCfg = resolvedParams.format || null;
  const visualFormatCfg = resolvedParams.visualFormat || null;
  const visualStyle = resolveVisualStyle(meta, userInputs, visualFormatCfg);
  const mediaModeCfg = visualFormatCfg?.mediaMode || null;
  const sfxDirective = resolvedParams.voiceAndScript?.sfxDirective || {
    enabled: false,
    maxCuesPerVideo: 0,
    preferredCategories: [],
    allowedTimings: ['on_enter', 'mid_scene', 'on_beat'],
    defaultGain: 0.18,
    minGain: 0.08,
    maxGain: 0.28
  };

  const resolvedVoiceModelId =
    resolvedParams.voiceAndScript?.voice?.modelId ||
    resolveVoiceModelId({
      explicitModelId: meta.voiceModelId || userInputs.voiceModelId,
      preset: presetKey,
      userPlan
    });
  const supportsTags =
    typeof resolvedParams.voiceAndScript?.voice?.supportsAudioTags === 'boolean'
      ? resolvedParams.voiceAndScript.voice.supportsAudioTags
      : modelSupportsAudioTags(resolvedVoiceModelId);

  const presetTagGuide =
    resolvedParams.voiceAndScript?.voice?.tags ||
    (GLOBALS.PRESET_VOICE_TAGS && GLOBALS.PRESET_VOICE_TAGS[presetKey]) ||
    (GLOBALS.PRESET_VOICE_TAGS && GLOBALS.PRESET_VOICE_TAGS.default) ||
    {};

  const resolvedVoice = resolveVoiceFromCatalog(
    meta,
    userInputs,
    resolvedParams.voiceAndScript?.voice
  );
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
1. Active plan: "${userPlan}". Maximum allowed duration: ${planConfig.maxDurationSeconds}s. Target script duration: ${planConfig.targetDurationSeconds}s (leaving a ${endingBufferSeconds}s soft closing buffer at the end; total scene duration MUST NOT exceed ${planConfig.targetDurationSeconds}s).${
    maxTotalWords ? ` Keep total spoken narration around or under ${maxTotalWords} words so pacing stays natural.` : ''
  }
2. Divide the video into ${planConfig.sceneRange} scenes with "${pacing}" pacing and tone: "${scriptTone}".
3. Let Gemini AI naturally author the opening "hook" and closing "cta" from the topic and tone itself, without forcing rigid external hook/CTA templates or cliché marketing filler. Tag each scene with "role": "hook", "body", or "cta" so the narrative flows organically from opening curiosity/premise through the core explanation to a natural, cohesive ending aligned with the preset's mood.
4. FORMAT, VISUAL & CHARACTER CONSISTENCY:
   - Target aspect ratio: ${formatCfg?.aspectRatio || '9:16'}.${
     formatCfg?.promptFraming ? `\n   - Format framing rule: ${formatCfg.promptFraming}` : ''
   }
   - Visual media mode: "${mediaModeCfg?.key || 'static_only'}". When a scene has "mediaType": "video_clip" or "motion_image", describe clear motion/action/camera movement in "visualPrompt"; when "static_image", focus on a strong composition ready for subtle camera motion.
   - Define in "characterAndStyleBible" the unified visual aesthetic and exact recurring character description (appearance, age range, clothing, base expression, environment, and lighting) so the entire video feels cohesive.${
     visualStyle
       ? `\n   - Apply visual style "${visualStyle.label}" (${visualStyle.promptAnchor}) consistently across the visual direction.${
           visualStyle.allowTextInImage === false
             ? ' Avoid text, watermarks, or random letters inside the visual scene.'
             : ''
         }`
       : ''
   }
   - Include in EVERY scene an "imageDescription" written naturally in ${languageLabel} describing clearly and intuitively how the generated image for that scene looks according to the script and visual action.
   - In EVERY "visualPrompt", explicitly restate the key character traits and visual style from "characterAndStyleBible", describing only the scene's specific action, camera framing, and logical progression from the previous scene.
5. SOUND EFFECTS (SFX CUES):
   - ${
     sfxDirective.enabled
       ? `SFX is ENABLED (up to ${sfxDirective.maxCuesPerVideo} cues across the video). For key moments, include an "sfxCue" object with "enabled": true, "category" (one of: ${(sfxDirective.preferredCategories || []).join(', ')}), "prompt" (concise sound effect description in English), "timing" (one of: ${(sfxDirective.allowedTimings || []).join(', ')}), and "gain" (around ${sfxDirective.defaultGain}). Set "enabled": false on non-accent scenes.`
       : `SFX is DISABLED for this configuration. Set "sfxCue" with "enabled": false, "category": "none", "prompt": "", "timing": "on_enter", and "gain": 0 on every scene.`
   }
6. CLEAN SUBTITLE TEXT VS. TAGGED SPOKEN TEXT (ELEVEN V4):
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
7. VOICE DIRECTION METADATA:
   - For each scene, include a "voiceDirection" object:
     * "intent": short delivery intent (e.g. "hook_attention", "explain_point", "emphasize_contrast", "call_to_action").
     * "emphasisPhrases": array of 1 to 3 key short phrases from "voiceoverText" to stress naturally.
     * "pauseBeforeMs": recommended lead-in pause in milliseconds (0 to 1500).
     * "pauseAfterMs": recommended trailing pause in milliseconds (0 to 1500).
     * "energyShift": one of "steady", "slight_up", or "slight_down".
8. ${
    effectiveMode === 'custom_script'
      ? 'CUSTOM_SCRIPT MODE: Preserve the user’s provided script text faithfully without rewriting its core wording; segment it into timed scenes and integrate any user-supplied opening or closing lines only if explicitly provided.'
      : 'IDEA MODE: Craft a cohesive, engaging script organically from the user’s idea, letting Gemini AI author the opening hook and closing lines naturally.'
  }
9. LANGUAGE RULES:
   - ${languageDirectiveText}
   - Spoken/editorial fields ("title", "hook.text", "cta.text", and every scene's "voiceoverText", "spokenText", and "imageDescription") MUST be written naturally in ${languageLabel}.
   - AI visual generation fields ("characterAndStyleBible" and every scene's "visualPrompt") MUST ALWAYS be written in clear, detailed ENGLISH regardless of the spoken language.`;

  const userPrompt = `
Generate the structured video script using these inputs:
- Spoken Output Language: ${languageLabel} (${languageDirectiveText})
- Plan Tier: ${userPlan}
- Mode: ${effectiveMode}
- Tone: ${scriptTone}
- Preset Style: ${presetKey}${presetVariant ? ` (Variant: ${presetVariant})` : ''}
- Aspect Ratio: ${formatCfg?.aspectRatio || '9:16'}
- Visual Media Mode: ${mediaModeCfg?.key || 'static_only'}
- Visual Style Override: ${visualStyle ? visualStyle.key : 'preset_default'}
- SFX Enabled: ${sfxDirective.enabled} (Max Cues: ${sfxDirective.maxCuesPerVideo})
- Voice Model ID: ${resolvedVoiceModelId}
- Voice Slot: ${voiceConfig.voiceSlot || 'default'}
- Voice Name: ${voiceConfig.voiceName || 'default'}
- Voice Profile: ${voiceConfig.profile || 'flexible_dynamic'}
- Base Idea / Script: ${userInputs.rawContent}
${providedHook ? `- User-provided opening line: ${providedHook}` : '- Opening hook: Let Gemini AI write an organic, natural opening line directly from the topic and tone in ' + languageLabel}
${providedCta ? `- User-provided closing line: ${providedCta}` : '- Closing line (CTA): Let Gemini AI write a natural, cohesive closing line that fits the topic and preset mood in ' + languageLabel}
- Target Duration Seconds: ${planConfig.targetDurationSeconds}
- Ending Buffer Seconds: ${endingBufferSeconds}
- Pacing: ${pacing}
`;

  try {
    console.log(
      `🚀 [Pipeline LLM] Plan: [${userPlan}] | Mode: [${effectiveMode}] | Lang: [${targetLanguage.toUpperCase()}] | Preset: [${presetKey}${presetVariant ? `:${presetVariant}` : ''}] | Ratio: [${formatCfg?.aspectRatio || '9:16'}] | MediaMode: [${mediaModeCfg?.key || 'static_only'}] | SFX: [${sfxDirective.enabled ? `on(max=${sfxDirective.maxCuesPerVideo})` : 'off'}] | Target: ${planConfig.targetDurationSeconds}s`
    );

    const response = await aiClient.models.generateContent({
      model: scriptModelId || 'gemini-3.8-flash',
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
                  mediaType: { type: Type.STRING },
                  startSeconds: { type: Type.NUMBER },
                  endSeconds: { type: Type.NUMBER },
                  durationSeconds: { type: Type.NUMBER },
                  voiceoverText: { type: Type.STRING },
                  spokenText: { type: Type.STRING },
                  imageDescription: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  sfxCue: {
                    type: Type.OBJECT,
                    properties: {
                      enabled: { type: Type.BOOLEAN },
                      category: { type: Type.STRING },
                      prompt: { type: Type.STRING },
                      timing: { type: Type.STRING },
                      gain: { type: Type.NUMBER }
                    },
                    required: ['enabled', 'category', 'prompt', 'timing', 'gain']
                  },
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
                  'imageDescription',
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

    const usageMetrics = extractUsageMetrics(response.usageMetadata);
    const structuredScript = JSON.parse(response.text);

    let cursorSec = 0;
    let activeSfxCount = 0;
    const maxSfx = Number(sfxDirective.maxCuesPerVideo || 0);
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
      const resolvedMediaType = resolveSceneMediaType(
        mediaModeCfg || {},
        resolvedRole,
        scene.mediaType || null
      );

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

      const canEnableSfx = sfxDirective.enabled && activeSfxCount < maxSfx;
      const normalizedSfxCue = normalizeSfxCue(scene.sfxCue, sfxDirective, canEnableSfx);
      if (normalizedSfxCue.enabled) {
        activeSfxCount += 1;
      }

      validatedScenes.push({
        sceneNumber: i + 1,
        role: resolvedRole,
        mediaType: resolvedMediaType,
        startSeconds,
        endSeconds,
        durationSeconds: finalDur,
        voiceoverText: cleanVoiceoverText,
        spokenText: finalSpokenText,
        imageDescription: String(scene.imageDescription || '').trim(),
        visualPrompt: scene.visualPrompt,
        sfxCue: normalizedSfxCue,
        voiceSlot: voiceConfig.voiceSlot,
        voiceName: voiceConfig.voiceName,
        voiceId: voiceConfig.voiceId,
        voiceDirection: normalizedDirection
      });

      cursorSec = endSeconds;
    }

    structuredScript.title = String(structuredScript.title || '').trim() || 'Studio Lite Video';
    structuredScript.scenes = validatedScenes;
    structuredScript.totalDurationSeconds = Number(cursorSec.toFixed(2));
    structuredScript.endingBufferSeconds = endingBufferSeconds;

    const enrichedScript = attachVisualConsistency(structuredScript, {
      visualStyle,
      format: formatCfg,
      mediaMode: mediaModeCfg
    });

    return {
      ...masterPayload,
      title: enrichedScript.title,
      llmDirective: {
        ...(masterPayload.llmDirective || {}),
        provider: 'google-gemini',
        model: scriptModelId || 'gemini-3.8-flash',
        language: targetLanguage,
        planApplied: userPlan,
        effectiveMode,
        preset: presetKey,
        presetVariant,
        aspectRatio: formatCfg?.aspectRatio || '9:16',
        mediaMode: mediaModeCfg?.key || 'static_only',
        visualStyle: visualStyle?.key || null,
        sfxEnabled: sfxDirective.enabled,
        voiceModelId: resolvedVoiceModelId,
        voiceConfig,
        usageMetadata: usageMetrics,
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

  const targetLanguage = resolveRequestedLanguage(masterPayload, {});
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

  const usageMetrics = extractUsageMetrics(response.usageMetadata);
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
    title: dialogue.title,
    dialogue,
    llmDirective: {
      ...(masterPayload.llmDirective || {}),
      provider: 'google-gemini',
      model: 'gemini-3.8-flash',
      language: targetLanguage,
      usageMetadata: usageMetrics,
      dialogue
    }
  };
}

module.exports = {
  generateStructuredScript,
  generateDialogueScript
};
