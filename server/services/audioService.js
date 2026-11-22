// server/services/audioService.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const {
  GLOBALS,
  resolveVoiceModelId,
  modelSupportsAudioTags
} = require('../config/globals');
const {
  clampNumber,
  normalizeKey,
  sanitizePlainText,
  resolvePlanPolicy
} = require('../utils/sharedHelpers');

let ffmpegStaticPath = null;
try {
  ffmpegStaticPath = require('ffmpeg-static');
} catch (_) {
  ffmpegStaticPath = null;
}

const ffmpegPath = process.env.FFMPEG_PATH || ffmpegStaticPath || 'ffmpeg';
const execFileAsync = promisify(execFile);

const AUDIO_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');

if (!fs.existsSync(AUDIO_OUTPUT_DIR)) {
  fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
}

const VOICE_CATALOG = GLOBALS.VOICE_CATALOG;
const VOICE_MAP = GLOBALS.VOICE_MAP;
const TONE_ALIASES = GLOBALS.TONE_ALIASES;
const PRESET_ALIASES = GLOBALS.PRESET_ALIASES;
const PRESET_VOICE_MODIFIERS = GLOBALS.BASE_PRESET_MODIFIERS;
const VOICE_PRESET_OVERRIDES = GLOBALS.VOICE_PRESET_OVERRIDES;

function normalizePresetForAudio(rawPreset) {
  return normalizeKey(rawPreset, PRESET_ALIASES, PRESET_VOICE_MODIFIERS, 'default');
}

function getPresetVoiceModifiers(preset = 'default', voiceKey = 'default') {
  const normalizedPreset = normalizePresetForAudio(preset);
  const base = PRESET_VOICE_MODIFIERS[normalizedPreset] || PRESET_VOICE_MODIFIERS.default;
  const voiceOverride = VOICE_PRESET_OVERRIDES[voiceKey]?.[normalizedPreset];

  return {
    speedDelta: voiceOverride?.speedDelta ?? base.speedDelta,
    stabilityDelta: voiceOverride?.stabilityDelta ?? base.stabilityDelta,
    styleDelta: voiceOverride?.styleDelta ?? base.styleDelta
  };
}

function stripBracketTags(text = '') {
  return String(text || '')
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeTextForSpeech(text = '', { preserveTags = true } = {}) {
  const raw = String(text || '');
  if (!preserveTags) {
    return sanitizePlainText(stripBracketTags(raw));
  }

  // Protegemos temporalmente etiquetas válidas [tag] para que sanitizePlainText no las borre
  const tokens = [];
  const protectedText = raw.replace(/\[[^\]]+\]/g, (match) => {
    const token = `__ELEVEN_TAG_${tokens.length}__`;
    tokens.push(match);
    return ` ${token} `;
  });

  const cleaned = sanitizePlainText(protectedText);
  let restored = cleaned;
  tokens.forEach((tag, idx) => {
    restored = restored.replace(new RegExp(`__ELEVEN_TAG_${idx}__`, 'g'), tag);
  });

  return restored.replace(/\s{2,}/g, ' ').trim();
}

function applyVoiceDirectionToScene({
  text,
  voiceDirection,
  voiceSettings,
  modelId,
  preset = 'default',
  sceneRole = 'body'
}) {
  const preserveTags = modelSupportsAudioTags(modelId);
  let spokenText = normalizeTextForSpeech(text, { preserveTags });
  const nextSettings = { ...voiceSettings };

  if (!voiceDirection || typeof voiceDirection !== 'object') {
    return { spokenText, voiceSettings: nextSettings };
  }

  const pauseBeforeMs = Number(voiceDirection.pauseBeforeMs || 0);
  const pauseAfterMs = Number(voiceDirection.pauseAfterMs || 0);
  const normalizedPreset = normalizePresetForAudio(preset);
  const isAtmosphericCta =
    sceneRole === 'cta' &&
    ['dark_mystery', 'cinematic', 'documentary'].includes(normalizedPreset);

  if (pauseBeforeMs >= 300 && !spokenText.startsWith('...')) {
    spokenText = `... ${spokenText}`;
  }
  if (pauseAfterMs >= 300 && !/[.!?…\]\s]$/.test(spokenText)) {
    spokenText = `${spokenText}...`;
  }

  if (voiceDirection.energyShift === 'slight_up') {
    // En CTA de presets atmosféricos evitamos acelerar la voz para no romper el clima
    if (!isAtmosphericCta && typeof nextSettings.speed === 'number') {
      nextSettings.speed = clampNumber(
        nextSettings.speed + 0.02,
        GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
        GLOBALS.SAFETY_LIMITS.voiceSpeed.max,
        2
      );
    }
    if (typeof nextSettings.style === 'number') {
      nextSettings.style = clampNumber(
        nextSettings.style + (isAtmosphericCta ? 0.02 : 0.04),
        GLOBALS.SAFETY_LIMITS.voiceStyle.min,
        GLOBALS.SAFETY_LIMITS.voiceStyle.max,
        2
      );
    }
    if (typeof nextSettings.stability === 'number') {
      nextSettings.stability = clampNumber(
        nextSettings.stability - (isAtmosphericCta ? 0.03 : 0.02),
        GLOBALS.SAFETY_LIMITS.voiceStability.min,
        GLOBALS.SAFETY_LIMITS.voiceStability.max,
        2
      );
    }
  } else if (voiceDirection.energyShift === 'slight_down') {
    if (typeof nextSettings.speed === 'number') {
      nextSettings.speed = clampNumber(
        nextSettings.speed - 0.02,
        GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
        GLOBALS.SAFETY_LIMITS.voiceSpeed.max,
        2
      );
    }
    if (typeof nextSettings.style === 'number') {
      nextSettings.style = clampNumber(
        nextSettings.style + 0.03,
        GLOBALS.SAFETY_LIMITS.voiceStyle.min,
        GLOBALS.SAFETY_LIMITS.voiceStyle.max,
        2
      );
    }
    if (typeof nextSettings.stability === 'number') {
      nextSettings.stability = clampNumber(
        nextSettings.stability + 0.02,
        GLOBALS.SAFETY_LIMITS.voiceStability.min,
        GLOBALS.SAFETY_LIMITS.voiceStability.max,
        2
      );
    }
  }

  return { spokenText, voiceSettings: nextSettings };
}

function resolveVoiceId({ requestedVoiceId, userPlan = 'free_trial' }) {
  const defaultFreeId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'xfcOcwRJ5AZQ8qZsQMw2';
  const policy = resolvePlanPolicy(userPlan);
  const isPaidPlan = Boolean(policy.allowProVoices);

  if (!requestedVoiceId) {
    return {
      voiceId: defaultFreeId,
      voiceKey: 'default',
      voiceName: null,
      downgradedFromPro: false
    };
  }

  const normalized = String(requestedVoiceId).toLowerCase().trim();
  const matchedEntry = Object.entries(VOICE_CATALOG).find(
    ([key, item]) =>
      key.toLowerCase() === normalized ||
      String(item.name || '').toLowerCase() === normalized ||
      String(item.voiceName || '').toLowerCase() === normalized ||
      String(item.id || '').toLowerCase() === normalized
  );

  if (matchedEntry) {
    const [key, item] = matchedEntry;
    const resolvedName = item.voiceName || item.name || key;
    if (!item.id) {
      return {
        voiceId: defaultFreeId,
        voiceKey: key,
        voiceName: resolvedName,
        downgradedFromPro: false
      };
    }
    if (item.tier === 'pro' && !isPaidPlan) {
      return {
        voiceId: defaultFreeId,
        voiceKey: 'default_free_fallback',
        voiceName: resolvedName,
        downgradedFromPro: true
      };
    }
    return {
      voiceId: item.id,
      voiceKey: key,
      voiceName: resolvedName,
      downgradedFromPro: false
    };
  }

  // Si ya es un ID custom de ElevenLabs no listado en VOICE_CATALOG, lo respetamos
  return {
    voiceId: requestedVoiceId,
    voiceKey: 'custom_id',
    voiceName: null,
    downgradedFromPro: false
  };
}

function getVoiceTuningByTone(tone = 'engaging', preset = 'default', voiceKey = 'default') {
  const normalizedTone = normalizeKey(tone, TONE_ALIASES, {}, 'engaging');

  const presets = {
    dramatic: {
      stability: 0.42,
      similarity_boost: 0.80,
      style: 0.28,
      use_speaker_boost: true,
      speed: 0.95
    },
    storytelling: {
      stability: 0.48,
      similarity_boost: 0.78,
      style: 0.22,
      use_speaker_boost: true,
      speed: 0.97
    },
    engaging: {
      stability: 0.44,
      similarity_boost: 0.78,
      style: 0.26,
      use_speaker_boost: true,
      speed: 0.99
    },
    dynamic: {
      stability: 0.50,
      similarity_boost: 0.78,
      style: 0.18,
      use_speaker_boost: true,
      speed: 0.98
    },
    calm: {
      stability: 0.68,
      similarity_boost: 0.75,
      style: 0.1,
      use_speaker_boost: true,
      speed: 0.94
    },
    direct: {
      stability: 0.58,
      similarity_boost: 0.78,
      style: 0.15,
      use_speaker_boost: true,
      speed: 1.0
    }
  };

  const base = presets[normalizedTone] || presets.engaging;
  const presetMod = getPresetVoiceModifiers(preset, voiceKey);

  return {
    ...base,
    stability: clampNumber(
      base.stability + presetMod.stabilityDelta,
      GLOBALS.SAFETY_LIMITS.voiceStability.min,
      GLOBALS.SAFETY_LIMITS.voiceStability.max,
      2
    ),
    style: clampNumber(
      base.style + presetMod.styleDelta,
      GLOBALS.SAFETY_LIMITS.voiceStyle.min,
      GLOBALS.SAFETY_LIMITS.voiceStyle.max,
      2
    ),
    speed: clampNumber(
      base.speed + presetMod.speedDelta,
      GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
      GLOBALS.SAFETY_LIMITS.voiceSpeed.max,
      2
    )
  };
}

function computeSceneSpeed({ text, durationSeconds, baseSpeed, overrideSpeed }) {
  const safeBase =
    typeof baseSpeed === 'number' && !Number.isNaN(baseSpeed) ? baseSpeed : 0.98;

  if (typeof overrideSpeed === 'number' && !Number.isNaN(overrideSpeed)) {
    return clampNumber(
      overrideSpeed,
      GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
      GLOBALS.SAFETY_LIMITS.voiceSpeed.max,
      2
    );
  }

  const cleanText = stripBracketTags(text);
  if (!cleanText || !durationSeconds || durationSeconds <= 0) {
    return clampNumber(
      safeBase,
      GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
      GLOBALS.SAFETY_LIMITS.voiceSpeed.max,
      2
    );
  }

  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedNaturalSec = words / 2.3;
  const ratio = estimatedNaturalSec / durationSeconds;

  const adjusted = safeBase * Math.max(0.88, Math.min(ratio, 1.1));
  return Number(Math.max(0.85, Math.min(adjusted, 1.08)).toFixed(2));
}

async function generateSceneAudio({
  text,
  voiceId,
  jobId,
  sceneNumber,
  modelId,
  preset = 'default',
  sceneRole = 'body',
  voiceSettings = { stability: 0.5, similarity_boost: 0.75 },
  voiceDirection = null,
  signal
}) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('Falta ELEVENLABS_API_KEY en el archivo .env');
  }

  const cleanVoiceKey = (voiceId || '').toLowerCase();
  const selectedVoiceId =
    VOICE_MAP[cleanVoiceKey] ||
    voiceId ||
    process.env.ELEVENLABS_DEFAULT_VOICE_ID ||
    'xfcOcwRJ5AZQ8qZsQMw2';

  const resolvedModelId = resolveVoiceModelId({
    explicitModelId: modelId,
    preset
  });

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;
  const baseSafeVoiceSettings =
    voiceSettings && typeof voiceSettings.speed === 'number'
      ? {
          ...voiceSettings,
          speed: clampNumber(
            voiceSettings.speed,
            GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
            GLOBALS.SAFETY_LIMITS.voiceSpeed.max,
            2
          )
        }
      : voiceSettings;

  const { spokenText, voiceSettings: safeVoiceSettings } = applyVoiceDirectionToScene({
    text,
    voiceDirection,
    voiceSettings: baseSafeVoiceSettings,
    modelId: resolvedModelId,
    preset,
    sceneRole
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    signal,
    body: JSON.stringify({
      text: spokenText,
      model_id: resolvedModelId,
      voice_settings: safeVoiceSettings
    })
  });

  if (!response.ok) {
    const errorDetail = await response.text();
    throw new Error(`ElevenLabs API Error (${response.status}): ${errorDetail}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileName = `${jobId}_scene_${sceneNumber}.mp3`;
  const filePath = path.join(AUDIO_OUTPUT_DIR, fileName);

  fs.writeFileSync(filePath, buffer);

  return {
    fileName,
    audioUrl: `/audio/${fileName}`,
    voiceIdUsed: selectedVoiceId,
    modelIdUsed: resolvedModelId,
    voiceSettingsUsed: safeVoiceSettings
  };
}

async function mergeAudioFiles({ fileNames, mergedFileName }) {
  if (!Array.isArray(fileNames) || fileNames.length <= 1) {
    return null;
  }

  const listFileName = `${mergedFileName}_concat.txt`;
  const listFilePath = path.join(AUDIO_OUTPUT_DIR, listFileName);
  const mergedFilePath = path.join(AUDIO_OUTPUT_DIR, mergedFileName);

  const lines = fileNames.map((name) => {
    const fullPath = path.join(AUDIO_OUTPUT_DIR, name).replace(/\\/g, '/');
    return `file '${fullPath}'`;
  });

  fs.writeFileSync(listFilePath, lines.join('\n'), 'utf8');

  try {
    await execFileAsync(ffmpegPath, [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listFilePath,
      '-c:a',
      'libmp3lame',
      '-q:a',
      '2',
      mergedFilePath
    ]);

    const stat = fs.statSync(mergedFilePath);
    return {
      fileName: mergedFileName,
      audioUrl: `/audio/${mergedFileName}`,
      sizeBytes: stat.size
    };
  } catch (error) {
    console.warn(`⚠️ [AudioService] No se pudieron fusionar los audios (${error.message}).`);
    return null;
  } finally {
    if (fs.existsSync(listFilePath)) {
      fs.unlinkSync(listFilePath);
    }
  }
}

async function generateAllScenesAudio(rawPayload) {
  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload;

  const structuredScript =
    masterPayload?.llmDirective?.structuredScript ||
    masterPayload?.structuredScript ||
    rawPayload?.llmDirective?.structuredScript ||
    rawPayload?.structuredScript ||
    (Array.isArray(masterPayload?.scenes) ? masterPayload : null);

  if (!structuredScript || !Array.isArray(structuredScript.scenes)) {
    throw new Error(
      'El payload no contiene un arreglo de "scenes" válido. Revisa la estructura del JSON.'
    );
  }

  const llmVoiceConfig =
    masterPayload?.llmDirective?.voiceConfig ||
    rawPayload?.llmDirective?.voiceConfig ||
    {};

  const jobId = masterPayload?.meta?.jobId || rawPayload?.meta?.jobId || `job_${Date.now()}`;
  const userPlan = masterPayload?.meta?.userPlan || rawPayload?.meta?.userPlan || 'free_trial';
  const tone =
    masterPayload?.userInputs?.tone ||
    masterPayload?.script?.tone ||
    rawPayload?.userInputs?.tone ||
    'engaging';
  const preset = normalizePresetForAudio(
    llmVoiceConfig.preset ||
      masterPayload?.llmDirective?.preset ||
      masterPayload?.meta?.preset ||
      masterPayload?.videoConfig?.preset ||
      masterPayload?.userInputs?.preset ||
      masterPayload?.video?.preset ||
      rawPayload?.videoConfig?.preset ||
      rawPayload?.userInputs?.preset ||
      'default'
  );
  const endingBufferSeconds =
    typeof masterPayload?.orchestration?.endingBufferSeconds === 'number'
      ? masterPayload.orchestration.endingBufferSeconds
      : structuredScript.endingBufferSeconds ?? 1.5;

  const requestedVoiceId =
    masterPayload?.userInputs?.voiceId ||
    masterPayload?.voiceConfig?.voiceId ||
    masterPayload?.voice?.voiceId ||
    masterPayload?.config?.voiceId ||
    rawPayload?.voiceConfig?.voiceId ||
    llmVoiceConfig.voiceId ||
    llmVoiceConfig.voiceSlot ||
    llmVoiceConfig.voiceName ||
    masterPayload?.meta?.voice ||
    masterPayload?.meta?.voiceName ||
    masterPayload?.userInputs?.voice ||
    masterPayload?.userInputs?.voiceName ||
    process.env.ELEVENLABS_DEFAULT_VOICE_ID;

  const explicitModelId =
    masterPayload?.voiceConfig?.modelId ||
    masterPayload?.voice?.modelId ||
    llmVoiceConfig.modelId ||
    masterPayload?.llmDirective?.voiceModelId ||
    rawPayload?.voiceConfig?.modelId;

  const modelId = resolveVoiceModelId({
    explicitModelId,
    preset,
    userPlan
  });

  const resolvedVoice = resolveVoiceId({ requestedVoiceId, userPlan });
  const resolvedVoiceName =
    resolvedVoice.voiceName ||
    llmVoiceConfig.voiceName ||
    masterPayload?.meta?.voiceName ||
    null;
  const baseTuning = getVoiceTuningByTone(tone, preset, resolvedVoice.voiceKey);

  if (resolvedVoice.downgradedFromPro) {
    console.warn(
      `🔒 [ElevenLabs] Voz "${requestedVoiceId}" es Pro y el plan es "${userPlan}". Usando voz gratuita por defecto.`
    );
  }

  console.log(
    `🎙️ [ElevenLabs] Generando audio para ${structuredScript.scenes.length} escenas | Voz: [${resolvedVoice.voiceKey}${resolvedVoiceName ? `:${resolvedVoiceName}` : ''}:${resolvedVoice.voiceId}] | Modelo: [${modelId}] | Tono: [${tone}] | Preset: [${preset}] (Job: ${jobId})...`
  );

  const updatedScenes = [];

  async function generateSceneAudioWithRetry(scenePayload, maxRetries = 3, timeoutMs = 30000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const audioResult = await generateSceneAudio({
          ...scenePayload,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return audioResult;
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn(
          `⚠️ [ElevenLabs] Intento ${attempt}/${maxRetries} fallido para escena ${scenePayload.sceneNumber} (${error.message}). Reintentando...`
        );

        if (attempt === maxRetries) {
          throw new Error(
            `Fallo definitivo en ElevenLabs para la escena ${scenePayload.sceneNumber} tras ${maxRetries} intentos: ${error.message}`
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  for (const scene of structuredScript.scenes) {
    const sourceText = scene.spokenText || scene.voiceoverText || '';
    const sceneSpeed = computeSceneSpeed({
      text: sourceText,
      durationSeconds: scene.durationSeconds,
      baseSpeed: baseTuning.speed,
      overrideSpeed:
        masterPayload?.voiceConfig?.speakingRate || masterPayload?.voice?.speakingRate
    });

    const sceneVoiceSettings = {
      stability:
        typeof masterPayload?.voiceConfig?.stability === 'number'
          ? masterPayload.voiceConfig.stability
          : baseTuning.stability,
      similarity_boost:
        typeof masterPayload?.voiceConfig?.similarityBoost === 'number'
          ? masterPayload.voiceConfig.similarityBoost
          : baseTuning.similarity_boost,
      style:
        typeof masterPayload?.voiceConfig?.style === 'number'
          ? masterPayload.voiceConfig.style
          : baseTuning.style,
      use_speaker_boost:
        typeof masterPayload?.voiceConfig?.useSpeakerBoost === 'boolean'
          ? masterPayload.voiceConfig.useSpeakerBoost
          : baseTuning.use_speaker_boost,
      speed: sceneSpeed
    };

    console.log(
      `   🔊 Sintetizando escena ${scene.sceneNumber} (speed=${sceneSpeed}): "${sourceText}"`
    );

    const audioResult = await generateSceneAudioWithRetry({
      text: sourceText,
      voiceId: resolvedVoice.voiceId,
      modelId,
      preset,
      sceneRole: scene.role || 'body',
      voiceSettings: sceneVoiceSettings,
      voiceDirection: scene.voiceDirection || null,
      jobId,
      sceneNumber: scene.sceneNumber
    });

    updatedScenes.push({
      ...scene,
      voiceSlot: scene.voiceSlot || resolvedVoice.voiceKey,
      voiceName: scene.voiceName || resolvedVoiceName,
      voiceId: scene.voiceId || resolvedVoice.voiceId,
      audio: audioResult
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  return {
    ...masterPayload,
    voice: {
      ...(masterPayload.voice || {}),
      provider: 'elevenlabs',
      modelId,
      tone,
      preset,
      endingBufferSeconds,
      voiceKey: resolvedVoice.voiceKey,
      voiceName: resolvedVoiceName,
      voiceId: resolvedVoice.voiceId,
      downgradedFromPro: resolvedVoice.downgradedFromPro
    },
    llmDirective: {
      ...(masterPayload.llmDirective || {}),
      structuredScript: {
        ...structuredScript,
        scenes: updatedScenes
      }
    },
    structuredScript: {
      ...structuredScript,
      scenes: updatedScenes
    },
    scenes: updatedScenes
  };
}

async function generateDialogueAudio(rawPayload) {
  const payload = rawPayload?.payload || rawPayload?.data || rawPayload || {};
  const dialogueObj = payload.dialogue || payload;
  const turns = Array.isArray(dialogueObj.turns) ? dialogueObj.turns : [];

  if (turns.length === 0) {
    throw new Error('El payload de diálogo no contiene un arreglo "turns" válido.');
  }

  const jobId = payload?.meta?.jobId || payload.jobId || `dialogue_${Date.now()}`;
  const userPlan = payload?.meta?.userPlan || payload.userPlan || 'free_trial';
  const tone = payload?.userInputs?.tone || payload.tone || 'storytelling';
  const preset = normalizePresetForAudio(payload.preset || 'default');
  const modelId = resolveVoiceModelId({
    explicitModelId: payload.modelId,
    preset,
    userPlan
  });

  const segments = [];

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const turnNumber = Number(turn.turnNumber) || i + 1;
    const requestedVoice = turn.voiceId || turn.speaker;
    const resolvedVoice = resolveVoiceId({ requestedVoiceId: requestedVoice, userPlan });
    const tuning = getVoiceTuningByTone(tone, preset, resolvedVoice.voiceKey);

    const audioResult = await generateSceneAudio({
      text: turn.line || turn.text || '',
      voiceId: resolvedVoice.voiceId,
      jobId,
      sceneNumber: turnNumber,
      modelId,
      preset,
      sceneRole: 'body',
      voiceSettings: tuning,
      voiceDirection: turn.voiceDirection || null
    });

    segments.push({
      ...turn,
      turnNumber,
      voiceKey: resolvedVoice.voiceKey,
      voiceName: resolvedVoice.voiceName,
      downgradedFromPro: resolvedVoice.downgradedFromPro,
      audio: audioResult
    });
  }

  const mergedAudio = await mergeAudioFiles({
    fileNames: segments.map((s) => s.audio.fileName),
    mergedFileName: `${jobId}_merged.mp3`
  });

  return {
    jobId,
    preset,
    userPlan,
    mergedAudio,
    turns: segments
  };
}

module.exports = {
  VOICE_MAP,
  VOICE_CATALOG,
  getVoiceTuningByTone,
  getPresetVoiceModifiers,
  generateSceneAudio,
  generateAllScenesAudio,
  generateDialogueAudio
};
