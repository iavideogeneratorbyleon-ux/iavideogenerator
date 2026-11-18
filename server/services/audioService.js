// server/services/audioService.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const AUDIO_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');

if (!fs.existsSync(AUDIO_OUTPUT_DIR)) {
  fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
}

// Mapeo dinámico y completo para todas las voces (Free Tier y Planes Pro)
const VOICE_MAP = {
  carlos: 'xfcOcwRJ5AZQ8qZsQMw2', // Free Tier - Narrative
  sofia: 'o29gBvqcJGwrA2NOoBL9',   // Free Tier - Commercial
  alex: 'uf0ZrRtyyJlbbGIn43uD',    // Free Tier - Young/Casual
  valeria: '22VndfJPBU7AZORAZZTT', // Pro - Executive
  mateo: 'y1ORRnLsPhYkUEggxyAY',   // Pro - Cinematic trailer
  elena: 'w4DBBAtZhQtfCihqCw5b'    // Pro - Warm storyteller
};

async function generateSceneAudio({ text, voiceId, jobId, sceneNumber }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('Falta ELEVENLABS_API_KEY en el archivo .env');
  }

  // Resolver el voiceId: si mandaron un nombre como 'alex' o 'valeria', lo mapeamos; si ya es un ID de ElevenLabs, lo respetamos
  const cleanVoiceKey = (voiceId || '').toLowerCase();
  const selectedVoiceId = VOICE_MAP[cleanVoiceKey] || voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'xfcOcwRJ5AZQ8qZsQMw2';
  
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
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
    voiceIdUsed: selectedVoiceId
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
    throw new Error('El payload no contiene un arreglo de "scenes" válido. Revisa la estructura del JSON.');
  }

  const jobId = masterPayload?.meta?.jobId || rawPayload?.meta?.jobId || `job_${Date.now()}`;
  
  // Búsqueda inteligente y ampliada del voiceId en el payload maestro (soportando userInputs, voiceConfig y config)
  const requestedVoiceId = 
    masterPayload?.userInputs?.voiceId || 
    masterPayload?.voiceConfig?.voiceId || 
    masterPayload?.config?.voiceId || 
    rawPayload?.voiceConfig?.voiceId ||
    process.env.ELEVENLABS_DEFAULT_VOICE_ID;

  console.log(`🎙️ [ElevenLabs] Generando audio para ${structuredScript.scenes.length} escenas usando voz solicitada: [${requestedVoiceId}] (Job: ${jobId})...`);

  const updatedScenes = [];

  // Función interna de reintento robusta con timeout por escena para evitar bloqueos y errores de red
  async function generateSceneAudioWithRetry(payload, maxRetries = 3, timeoutMs = 30000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const audioResult = await generateSceneAudio({
          ...payload,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return audioResult;

      } catch (error) {
        clearTimeout(timeoutId);
        console.warn(`⚠️ [ElevenLabs] Intento ${attempt}/${maxRetries} fallido para escena ${payload.sceneNumber} (${error.message}). Reintentando...`);
        
        if (attempt === maxRetries) {
          throw new Error(`Fallo definitivo en ElevenLabs para la escena ${payload.sceneNumber} tras ${maxRetries} intentos: ${error.message}`);
        }
        
        // Espera de 1.5 segundos antes de reintentar la escena
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  for (const scene of structuredScript.scenes) {
    console.log(`   🔊 Sintetizando escena ${scene.sceneNumber}: "${scene.voiceoverText}"`);
    
    // Llamada blindada con reintentos automáticos
    const audioResult = await generateSceneAudioWithRetry({
      text: scene.voiceoverText,
      voiceId: requestedVoiceId, // La función interna se encarga de cruzarlo contra el VOICE_MAP
      jobId,
      sceneNumber: scene.sceneNumber
    });

    updatedScenes.push({
      ...scene,
      audio: audioResult
    });

    // Pequeña pausa de cortesía entre peticiones para cuidar el rate limit de ElevenLabs
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  // Devolvemos el payload completo asegurando todas las rutas que el Paso 3 pueda requerir
  return {
    ...masterPayload,
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
  generateSceneAudio,
  generateAllScenesAudio
};
