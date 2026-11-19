// server/services/audioService.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const AUDIO_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');

if (!fs.existsSync(AUDIO_OUTPUT_DIR)) {
  fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
}

// Mapeo dinámico y completo para todas las voces (Free Tier y Planes Pro)
const VOICE_CATALOG = {
  carlos: { id: 'xfcOcwRJ5AZQ8qZsQMw2', tier: 'free', accent: 'neutral_es' },
  sofia: { id: 'o29gBvqcJGwrA2NOoBL9', tier: 'free', accent: 'neutral_es' },
  alex: { id: 'uf0ZrRtyyJlbbGIn43uD', tier: 'free', accent: 'en_casual' },
  valeria: { id: '22VndfJPBU7AZORAZZTT', tier: 'pro', accent: 'executive' },
  mateo: { id: 'y1ORRnLsPhYkUEggxyAY', tier: 'pro', accent: 'cinematic' },
  elena: { id: 'w4DBBAtZhQtfCihqCw5b', tier: 'pro', accent: 'warm_storyteller' }
};

const VOICE_MAP = Object.fromEntries(
  Object.entries(VOICE_CATALOG).map(([key, meta]) => [key, meta.id])
);

function resolveVoiceId({ requestedVoiceId, userPlan = 'free_trial' }) {
  const defaultFreeId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'xfcOcwRJ5AZQ8qZsQMw2';
  const isPaidPlan = ['pay_per_video', 'pro', 'unlimited'].includes(userPlan);

  if (!requestedVoiceId) {
    return {
      voiceId: defaultFreeId,
      voiceKey: 'default',
      downgradedFromPro: false
    };
  }

  const normalized = String(requestedVoiceId).toLowerCase().trim();
  const matchedEntry = Object.entries(VOICE_CATALOG).find(
    ([key, item]) => key === normalized || item.id.toLowerCase() === normalized
  );

  if (matchedEntry) {
    const [key, item] = matchedEntry;
    if (item.tier === 'pro' && !isPaidPlan) {
      return {
        voiceId: defaultFreeId,
        voiceKey: 'default_free_fallback',
        downgradedFromPro: true
      };
    }
    return {
      voiceId: item.id,
      voiceKey: key,
      downgradedFromPro: false
    };
  }

  // Si ya es un ID custom de ElevenLabs no listado en VOICE_CATALOG, lo respetamos
  return {
    voiceId: requestedVoiceId,
    voiceKey: 'custom_id',
    downgradedFromPro: false
  };
}

function getVoiceTuningByTone(tone = 'engaging') {
  const normalizedTone = String(tone).toLowerCase().trim();

  const presets = {
    dramatic: {
      stability: 0.34,
      similarity_boost: 0.82,
      style: 0.42,
      use_speaker_boost: true,
      speed: 0.96
    },
    storytelling: {
      stability: 0.44,
      similarity_boost: 0.8,
      style: 0.32,
      use_speaker_boost: true,
      speed: 0.98
    },
    engaging: {
      stability: 0.34,
      similarity_boost: 0.80,
      style: 0.40,
      use_speaker_boost: true,
      speed: 1.03
    },
    dynamic: {
      stability: 0.46,
      similarity_boost: 0.78,
      style: 0.25,
      use_speaker_boost: true,
      speed: 1.05
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
      speed: 1.04
    }
  };

  return presets[normalizedTone] || presets.engaging;
}

function computeSceneSpeed({ text, durationSeconds, baseSpeed, overrideSpeed }) {
  if (typeof overrideSpeed === 'number' && !Number.isNaN(overrideSpeed)) {
    return Number(Math.max(0.75, Math.min(overrideSpeed, 1.25)).toFixed(2));
  }

  if (!text || !durationSeconds || durationSeconds <= 0) {
    return baseSpeed;
  }

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const estimatedNaturalSec = words / 2.4;
  const ratio = estimatedNaturalSec / durationSeconds;

  const adjusted = baseSpeed * Math.max(0.85, Math.min(ratio, 1.18));
  return Number(Math.max(0.82, Math.min(adjusted, 1.22)).toFixed(2));
}

async function generateSceneAudio({
  text,
  voiceId,
  jobId,
  sceneNumber,
  modelId = 'eleven_turbo_v2_5',
  voiceSettings = { stability: 0.5, similarity_boost: 0.75 },
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

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    signal,
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: voiceSettings
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
    voiceSettingsUsed: voiceSettings
  };
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

  const jobId = masterPayload?.meta?.jobId || rawPayload?.meta?.jobId || `job_${Date.now()}`;
  const userPlan = masterPayload?.meta?.userPlan || rawPayload?.meta?.userPlan || 'free_trial';
  const tone =
    masterPayload?.userInputs?.tone ||
    masterPayload?.script?.tone ||
    rawPayload?.userInputs?.tone ||
    'engaging';

  const requestedVoiceId =
    masterPayload?.userInputs?.voiceId ||
    masterPayload?.voiceConfig?.voiceId ||
    masterPayload?.voice?.voiceId ||
    masterPayload?.config?.voiceId ||
    rawPayload?.voiceConfig?.voiceId ||
    process.env.ELEVENLABS_DEFAULT_VOICE_ID;

  const modelId =
    masterPayload?.voiceConfig?.modelId ||
    masterPayload?.voice?.modelId ||
    rawPayload?.voiceConfig?.modelId ||
    'eleven_turbo_v2_5';

  const resolvedVoice = resolveVoiceId({ requestedVoiceId, userPlan });
  const baseTuning = getVoiceTuningByTone(tone);

  if (resolvedVoice.downgradedFromPro) {
    console.warn(
      `🔒 [ElevenLabs] Voz "${requestedVoiceId}" es Pro y el plan es "${userPlan}". Usando voz gratuita por defecto.`
    );
  }

  console.log(
    `🎙️ [ElevenLabs] Generando audio para ${structuredScript.scenes.length} escenas | Voz: [${resolvedVoice.voiceKey}:${resolvedVoice.voiceId}] | Tono: [${tone}] (Job: ${jobId})...`
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
    const sceneSpeed = computeSceneSpeed({
      text: scene.voiceoverText,
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
      `   🔊 Sintetizando escena ${scene.sceneNumber} (speed=${sceneSpeed}): "${scene.voiceoverText}"`
    );

    const audioResult = await generateSceneAudioWithRetry({
      text: scene.voiceoverText,
      voiceId: resolvedVoice.voiceId,
      modelId,
      voiceSettings: sceneVoiceSettings,
      jobId,
      sceneNumber: scene.sceneNumber
    });

    updatedScenes.push({
      ...scene,
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
      voiceKey: resolvedVoice.voiceKey,
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

module.exports = {
  VOICE_MAP,
  VOICE_CATALOG,
  generateSceneAudio,
  generateAllScenesAudio
};
