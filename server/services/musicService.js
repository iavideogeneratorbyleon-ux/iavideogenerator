// server/services/musicService.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MUSIC_LIBRARY_DIR = path.join(PUBLIC_DIR, 'music');
const VIDEO_OUTPUT_DIR = path.join(PUBLIC_DIR, 'videos');

[MUSIC_LIBRARY_DIR, VIDEO_OUTPUT_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Catálogo sugerido de pistas locales en server/public/music/
const MUSIC_CATALOG = {
  cinematic_tension: {
    key: 'cinematic_tension',
    label: 'Cinematic Tension / Documentary',
    fileName: 'cinematic_tension.mp3',
    defaultVolume: 0.22
  },
  upbeat_hype: {
    key: 'upbeat_hype',
    label: 'Upbeat High Energy',
    fileName: 'upbeat_hype.mp3',
    defaultVolume: 0.24
  },
  viral_beat: {
    key: 'viral_beat',
    label: 'Modern Lo-Fi / Viral Beat',
    fileName: 'viral_beat.mp3',
    defaultVolume: 0.22
  },
  luxury_ambient: {
    key: 'luxury_ambient',
    label: 'Luxury Deep Ambient',
    fileName: 'luxury_ambient.mp3',
    defaultVolume: 0.20
  },
  tech_pulse: {
    key: 'tech_pulse',
    label: 'Clean Tech Electronic',
    fileName: 'tech_pulse.mp3',
    defaultVolume: 0.21
  },
  warm_storytelling: {
    key: 'warm_storytelling',
    label: 'Warm Acoustic / Storytelling',
    fileName: 'warm_storytelling.mp3',
    defaultVolume: 0.22
  }
};

const PRESET_TO_MUSIC_KEY = {
  netflix: 'cinematic_tension',
  mr_beast: 'upbeat_hype',
  tiktok_viral: 'viral_beat',
  luxury: 'luxury_ambient',
  tech: 'tech_pulse',
  default: 'warm_storytelling'
};

function getMediaDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(Number(metadata?.format?.duration) || 10);
    });
  });
}

function resolveMusicConfig(masterPayload = {}) {
  const userPlan =
    masterPayload?.meta?.userPlan ||
    masterPayload?.orchestration?.planApplied ||
    'free_trial';
  const isFreePlan = userPlan === 'free_trial';

  const musicConfig = masterPayload?.musicConfig || masterPayload?.music || {};

  const enabled =
    typeof musicConfig.enabled === 'boolean' ? musicConfig.enabled : true;

  const preset =
    masterPayload?.video?.preset ||
    masterPayload?.videoConfig?.preset ||
    'default';

  const tone = masterPayload?.userInputs?.tone || '';

  // Selección de pista por track explícito, preset o tono
  let selectedKey =
    musicConfig.track && MUSIC_CATALOG[musicConfig.track]
      ? musicConfig.track
      : PRESET_TO_MUSIC_KEY[preset] ||
        (tone === 'storytelling' ? 'warm_storytelling' : 'warm_storytelling');

  const catalogItem = MUSIC_CATALOG[selectedKey] || MUSIC_CATALOG.warm_storytelling;

  // Custom musicUrl solo permitido en planes de pago
  const customMusicUrl =
    !isFreePlan && typeof musicConfig.customMusicUrl === 'string'
      ? musicConfig.customMusicUrl.trim()
      : null;

  const baseVolume =
    typeof musicConfig.volume === 'number'
      ? Math.min(0.6, Math.max(0.05, musicConfig.volume))
      : catalogItem.defaultVolume;

  const duckingEnabled =
    typeof musicConfig.ducking === 'boolean' ? musicConfig.ducking : true;

  const fadeOutSeconds =
    typeof musicConfig.fadeOutSeconds === 'number'
      ? Math.max(0.5, Math.min(5, musicConfig.fadeOutSeconds))
      : 2.0;

  return {
    userPlan,
    isFreePlan,
    enabled,
    trackKey: catalogItem.key,
    trackLabel: catalogItem.label,
    catalogFileName: catalogItem.fileName,
    customMusicUrl,
    baseVolume,
    duckingEnabled,
    fadeOutSeconds
  };
}

function resolveMusicFilePath(resolvedConfig) {
  if (resolvedConfig.customMusicUrl) {
    const customPath = path.join(
      PUBLIC_DIR,
      resolvedConfig.customMusicUrl.replace(/^\/+/, '')
    );
    if (fs.existsSync(customPath)) {
      return { path: customPath, source: 'custom_upload' };
    }
  }

  const catalogPath = path.join(MUSIC_LIBRARY_DIR, resolvedConfig.catalogFileName);
  if (fs.existsSync(catalogPath)) {
    return { path: catalogPath, source: 'catalog' };
  }

  // Buscar cualquier .mp3 disponible en /public/music como fallback
  if (fs.existsSync(MUSIC_LIBRARY_DIR)) {
    const availableMp3 = fs
      .readdirSync(MUSIC_LIBRARY_DIR)
      .find((f) => f.toLowerCase().endsWith('.mp3'));
    if (availableMp3) {
      return {
        path: path.join(MUSIC_LIBRARY_DIR, availableMp3),
        source: 'catalog_fallback'
      };
    }
  }

  return null;
}

function mixBackgroundMusicWithVideo({
  inputVideoPath,
  musicFilePath,
  outputVideoPath,
  duration,
  baseVolume,
  duckingEnabled,
  fadeOutSeconds
}) {
  return new Promise((resolve, reject) => {
    const fadeStart = Math.max(0, Number((duration - fadeOutSeconds).toFixed(2)));

    // [0:a] es la narración/voz del video renderizado en Paso 4
    // [1:a] es la música en loop infinito recortada a la duración exacta del video
    const musicPrep = `[1:a]atrim=0:${duration},asetpts=PTS-STARTPTS,volume=${baseVolume},afade=t=in:st=0:d=0.8,afade=t=out:st=${fadeStart}:d=${fadeOutSeconds}[bg]`;

    let filterComplex;
    if (duckingEnabled) {
      filterComplex = [
        musicPrep,
        `[0:a]asplit=2[voice_main][voice_sc]`,
        `[bg][voice_sc]sidechaincompress=threshold=0.025:ratio=6:attack=40:release=350[bg_ducked]`,
        `[voice_main][bg_ducked]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[aout]`
      ].join(';');
    } else {
      filterComplex = [
        musicPrep,
        `[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2:normalize=0[aout]`
      ].join(';');
    }

    ffmpeg()
      .input(inputVideoPath)
      .input(musicFilePath)
      .inputOptions(['-stream_loop -1'])
      .complexFilter(filterComplex)
      .outputOptions([
        '-map 0:v:0',
        '-map [aout]',
        '-c:v copy',
        '-c:a aac',
        '-b:a 192k',
        '-shortest'
      ])
      .save(outputVideoPath)
      .on('end', () => resolve(outputVideoPath))
      .on('error', (err) => reject(err));
  });
}

async function applyBackgroundMusic(rawPayload) {
  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload || {};
  const inputRelVideo = masterPayload?.video?.videoUrl;

  if (!inputRelVideo) {
    throw new Error(
      'Falta video.videoUrl en el payload. Ejecuta primero el Paso 4 (video-generator).'
    );
  }

  const inputVideoPath = path.join(PUBLIC_DIR, inputRelVideo.replace(/^\/+/, ''));
  if (!fs.existsSync(inputVideoPath)) {
    throw new Error(`No se encontró el video base en disco: ${inputVideoPath}`);
  }

  const jobId =
    masterPayload.jobId ||
    masterPayload?.meta?.jobId ||
    masterPayload?.video?.jobId ||
    `job_${Date.now()}`;

  const resolvedConfig = resolveMusicConfig(masterPayload);

  if (!resolvedConfig.enabled) {
    return {
      videoFileName: masterPayload.video.fileName,
      videoUrl: inputRelVideo,
      musicApplied: false,
      payload: {
        ...masterPayload,
        music: {
          enabled: false,
          applied: false
        }
      }
    };
  }

  const resolvedFile = resolveMusicFilePath(resolvedConfig);
  if (!resolvedFile) {
    throw new Error(
      `No hay pistas de música disponibles en ${MUSIC_LIBRARY_DIR}. Coloca al menos un archivo .mp3 (por ejemplo ${resolvedConfig.catalogFileName}).`
    );
  }

  const videoDuration = await getMediaDuration(inputVideoPath);
  const finalFileName = `${jobId}_final_with_music.mp4`;
  const finalOutputPath = path.join(VIDEO_OUTPUT_DIR, finalFileName);

  console.log(
    `🎵 [Música Paso 5] Job: ${jobId} | Track: ${resolvedConfig.trackKey} (${resolvedFile.source}) | Volumen: ${resolvedConfig.baseVolume} | Ducking: ${resolvedConfig.duckingEnabled}`
  );

  await mixBackgroundMusicWithVideo({
    inputVideoPath,
    musicFilePath: resolvedFile.path,
    outputVideoPath: finalOutputPath,
    duration: videoDuration,
    baseVolume: resolvedConfig.baseVolume,
    duckingEnabled: resolvedConfig.duckingEnabled,
    fadeOutSeconds: resolvedConfig.fadeOutSeconds
  });

  if (
    fs.existsSync(finalOutputPath) &&
    fs.existsSync(inputVideoPath) &&
    path.resolve(inputVideoPath) !== path.resolve(finalOutputPath)
  ) {
    fs.unlinkSync(inputVideoPath);
  }

  const finalVideoUrl = `/videos/${finalFileName}`;
  console.log(`✅ [Música Paso 5] Video final con música listo en: ${finalVideoUrl}`);

  const updatedPayload = {
    ...masterPayload,
    music: {
      enabled: true,
      applied: true,
      trackKey: resolvedConfig.trackKey,
      trackLabel: resolvedConfig.trackLabel,
      source: resolvedFile.source,
      baseVolume: resolvedConfig.baseVolume,
      duckingEnabled: resolvedConfig.duckingEnabled,
      fadeOutSeconds: resolvedConfig.fadeOutSeconds,
      mixedAt: new Date().toISOString()
    },
    video: {
      ...(masterPayload.video || {}),
      step4VideoUrl: inputRelVideo,
      fileName: finalFileName,
      videoUrl: finalVideoUrl,
      hasBackgroundMusic: true
    }
  };

  return {
    videoFileName: finalFileName,
    videoUrl: finalVideoUrl,
    musicApplied: true,
    trackKey: resolvedConfig.trackKey,
    duckingEnabled: resolvedConfig.duckingEnabled,
    payload: updatedPayload
  };
}

module.exports = {
  applyBackgroundMusic,
  resolveMusicConfig,
  MUSIC_CATALOG
};
