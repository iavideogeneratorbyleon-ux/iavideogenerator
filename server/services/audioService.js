// server/services/audioService.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const AUDIO_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');

if (!fs.existsSync(AUDIO_OUTPUT_DIR)) {
  fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
}

async function generateSceneAudio({ text, voiceId, jobId, sceneNumber }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('Falta ELEVENLABS_API_KEY en el archivo .env');
  }

  const selectedVoiceId = voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';
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
  // Desempaqueta automáticamente si viene envuelto en { success, payload } o { data }
  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload;

  // Búsqueda inteligente flexible de las escenas en cualquier nivel conocido
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
  const requestedVoiceId = masterPayload?.config?.voiceId || rawPayload?.config?.voiceId || process.env.ELEVENLABS_DEFAULT_VOICE_ID;

  console.log(`🎙️ [ElevenLabs] Generando audio para ${structuredScript.scenes.length} escenas (Job: ${jobId})...`);

  const updatedScenes = [];

  for (const scene of structuredScript.scenes) {
    console.log(`   🔊 Sintetizando escena ${scene.sceneNumber}: "${scene.voiceoverText}"`);
    const audioResult = await generateSceneAudio({
      text: scene.voiceoverText,
      voiceId: requestedVoiceId,
      jobId,
      sceneNumber: scene.sceneNumber
    });

    updatedScenes.push({
      ...scene,
      audio: audioResult
    });
  }

  console.log(`✅ [ElevenLabs] Todos los audios generados con éxito.`);

  return {
    success: true,
    payload: {
      ...masterPayload,
      llmDirective: {
        ...(masterPayload.llmDirective || {}),
        provider: masterPayload?.llmDirective?.provider || 'google-gemini',
        structuredScript: {
          ...structuredScript,
          scenes: updatedScenes
        }
      }
    }
  };
}

module.exports = {
  generateSceneAudio,
  generateAllScenesAudio
};
