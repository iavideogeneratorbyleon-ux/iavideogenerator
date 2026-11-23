require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const { GLOBALS } = require('../config/globals');
const {
  MUSIC_CATALOG,
  PRESET_MUSIC_POOLS,
  selectTrackForUserAndPreset,
  getFallbackTrack
} = require('../utils/musicCatalog');
const { clampNumber, normalizeKey, resolvePlanPolicy } = require('../utils/sharedHelpers');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MUSIC_LIBRARY_DIR = path.join(PUBLIC_DIR, 'music');
const VIDEO_OUTPUT_DIR = path.join(PUBLIC_DIR, 'videos');

[MUSIC_LIBRARY_DIR, VIDEO_OUTPUT_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const SUPPORTED_PRESETS = [
  'cinematic',
  'documentary',
  'educational',
  'luxury_brand',
  'minimalistic',
  'mr_beast',
  'netflix',
  'tech_modern',
  'tiktok_viral',
  'default'
];

function findFirstMp3Recursively(dirPath) {
  if (!fs.existsSync(dirPath)) return null;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) {
      return fullPath;
    }
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nested = findFirstMp3Recursively(path.join(dirPath, entry.name));
      if (nested) return nested;
    }
  }

  return null;
}

function getMediaDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(Number(metadata?.format?.duration) || 10);
    });
  });
}

function resolveMusicConfig(masterPayload = {}) {
  const rawPlan =
    masterPayload?.meta?.userPlan ||
    masterPayload?.orchestration?.planApplied ||
    'free_trial';
  const userPlan = normalizeKey(rawPlan, {}, GLOBALS.PLAN_POLICIES, 'free_trial');
  const planPolicy = resolvePlanPolicy(userPlan);
  const isFreePlan = userPlan === 'free_trial';
  const allowsCustomMusic = Boolean(planPolicy.allowCustomOverrides);

  const userId =
    masterPayload?.userId ||
    masterPayload?.meta?.userId ||
    masterPayload?.user?.id ||
    'anonymous';

  const musicConfig = masterPayload?.musicConfig || masterPayload?.music || {};

  const enabled =
    typeof musicConfig.enabled === 'boolean' ? musicConfig.enabled : true;

  const rawPreset =
    masterPayload?.meta?.preset ||
    masterPayload?.userInputs?.preset ||
    masterPayload?.video?.preset ||
    masterPayload?.videoConfig?.preset ||
    'default';

  const presetMap = SUPPORTED_PRESETS.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {});

  const normalizedPreset = normalizeKey(
    rawPreset,
    GLOBALS.PRESET_ALIASES,
    {
      ...presetMap,
      ...(GLOBALS.PRESET_SUBTITLE_STYLES || {}),
      ...(GLOBALS.BASE_PRESET_MODIFIERS || {}),
      ...(PRESET_MUSIC_POOLS || {})
    },
    'default'
  );

  const preset = SUPPORTED_PRESETS.includes(normalizedPreset)
    ? normalizedPreset
    : 'default';

  const tone = String(masterPayload?.userInputs?.tone || '');
  const mood = String(
    musicConfig.mood ||
      masterPayload?.musicDirection?.mood ||
      masterPayload?.script?.musicDirection?.mood ||
      ''
  );
  const explicitTrack =
    musicConfig.track ||
    masterPayload?.musicDirection?.recommendedTrackKey ||
    null;

  const selection = selectTrackForUserAndPreset({
    userId,
    preset,
    explicitTrack,
    mood,
    tone
  });

  const catalogItem = selection.item || getFallbackTrack();

  const customMusicUrl =
    !isFreePlan && allowsCustomMusic && typeof musicConfig.customMusicUrl === 'string'
      ? musicConfig.customMusicUrl.trim()
      : null;

  const baseVolume =
    typeof musicConfig.volume === 'number'
      ? clampNumber(musicConfig.volume, 0.05, 0.6, 2)
      : catalogItem.defaultVolume;

  const duckingEnabled =
    typeof musicConfig.ducking === 'boolean' ? musicConfig.ducking : true;

  const fadeOutSeconds =
    typeof musicConfig.fadeOutSeconds === 'number'
      ? clampNumber(musicConfig.fadeOutSeconds, 0.6, 5, 2)
      : 2.0;

  return {
    userId,
    preset,
    userPlan,
    isFreePlan,
    enabled,
    trackKey: catalogItem.key,
    trackLabel: catalogItem.label,
    catalogFileName: catalogItem.fileName,
    selectionMode: selection.selectionMode,
    cycleReset: selection.cycleReset,
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
      return {
        path: customPath,
        fileName: path.basename(customPath),
        source: 'custom_upload'
      };
    }
  }

  const relFileName = String(resolvedConfig.catalogFileName || '').replace(/^\/+/, '');
  const catalogPath = path.join(MUSIC_LIBRARY_DIR, relFileName);
  if (fs.existsSync(catalogPath)) {
    return {
      path: catalogPath,
      fileName: relFileName,
      source: 'catalog'
    };
  }

  // Respaldo dentro de la carpeta del preset resuelto (o default)
  const presetFolder = path.join(MUSIC_LIBRARY_DIR, resolvedConfig.preset);
  const presetMp3 = findFirstMp3Recursively(presetFolder);
  if (presetMp3) {
    return {
      path: presetMp3,
      fileName: path.relative(MUSIC_LIBRARY_DIR, presetMp3),
      source: 'preset_folder_fallback'
    };
  }

  const defaultFolder = path.join(MUSIC_LIBRARY_DIR, 'default');
  const defaultMp3 = findFirstMp3Recursively(defaultFolder);
  if (defaultMp3) {
    return {
      path: defaultMp3,
      fileName: path.relative(MUSIC_LIBRARY_DIR, defaultMp3),
      source: 'default_folder_fallback'
    };
  }

  const flatLegacyPath = path.join(MUSIC_LIBRARY_DIR, path.basename(relFileName));
  if (flatLegacyPath !== catalogPath && fs.existsSync(flatLegacyPath)) {
    return {
      path: flatLegacyPath,
      fileName: path.basename(flatLegacyPath),
      source: 'catalog_legacy'
    };
  }

  const anyMp3 = findFirstMp3Recursively(MUSIC_LIBRARY_DIR);
  if (anyMp3) {
    return {
      path: anyMp3,
      fileName: path.relative(MUSIC_LIBRARY_DIR, anyMp3),
      source: 'catalog_fallback'
    };
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
    const safeDuration = Math.max(1, Number(duration) || 10);
    const safeFadeOut = Number(
      clampNumber(Math.min(fadeOutSeconds, safeDuration * 0.28), 0.5, 4.0, 2)
    );
    const fadeStart = Math.max(0, Number((safeDuration - safeFadeOut).toFixed(2)));
    const fadeInDuration = Number(
      clampNumber(Math.min(1.0, safeDuration * 0.1), 0.3, 1.2, 2)
    );

    const musicPrep = [
      `[1:a]atrim=0:${safeDuration}`,
      `asetpts=PTS-STARTPTS`,
      `volume=${baseVolume}`,
      `afade=t=in:st=0:d=${fadeInDuration}`,
      `afade=t=out:st=${fadeStart}:d=${safeFadeOut}[bg]`
    ].join(',');

    let filterComplex;
    if (duckingEnabled) {
      filterComplex = [
        musicPrep,
        `[0:a]asplit=2[voice_main][voice_sc]`,
        `[bg][voice_sc]sidechaincompress=threshold=0.02:ratio=5:attack=45:release=450[bg_ducked]`,
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
  const inputRelVideo =
    masterPayload?.video?.videoUrl ||
    masterPayload?.video?.url ||
    masterPayload?.videoUrl ||
    null;

  const jobId =
    masterPayload.jobId ||
    masterPayload?.meta?.jobId ||
    masterPayload?.video?.jobId ||
    `job_${Date.now()}`;

  const resolvedConfig = resolveMusicConfig(masterPayload);
  const resolvedFile = resolveMusicFilePath(resolvedConfig);

  if (!resolvedConfig.enabled) {
    return {
      videoFileName: masterPayload?.video?.fileName || null,
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

  if (!inputRelVideo) {
    console.log(
      `🎵 [Música] Job: ${jobId} | User: ${resolvedConfig.userId} | Sin video.videoUrl previo aún; preparando pista [${resolvedConfig.trackKey}] (reset=${resolvedConfig.cycleReset}) para el render final.`
    );
    return {
      videoFileName: null,
      videoUrl: null,
      musicApplied: false,
      trackKey: resolvedConfig.trackKey,
      duckingEnabled: resolvedConfig.duckingEnabled,
      payload: {
        ...masterPayload,
        music: {
          enabled: true,
          applied: false,
          deferredUntilRender: true,
          userId: resolvedConfig.userId,
          preset: resolvedConfig.preset,
          trackKey: resolvedConfig.trackKey,
          trackLabel: resolvedConfig.trackLabel,
          selectionMode: resolvedConfig.selectionMode,
          cycleReset: resolvedConfig.cycleReset,
          fileName: resolvedFile?.fileName || null,
          filePath: resolvedFile?.path || null,
          source: resolvedFile?.source || 'none',
          baseVolume: resolvedConfig.baseVolume,
          duckingEnabled: resolvedConfig.duckingEnabled,
          fadeOutSeconds: resolvedConfig.fadeOutSeconds
        }
      }
    };
  }

  const inputVideoPath = path.join(PUBLIC_DIR, inputRelVideo.replace(/^\/+/, ''));
  if (!fs.existsSync(inputVideoPath)) {
    throw new Error(`No se encontró el video base en disco: ${inputVideoPath}`);
  }

  if (!resolvedFile) {
    throw new Error(
      `No hay pistas de música disponibles en ${MUSIC_LIBRARY_DIR}. Coloca al menos un archivo .mp3 (por ejemplo ${resolvedConfig.catalogFileName}).`
    );
  }

  const videoDuration = await getMediaDuration(inputVideoPath);
  const finalFileName = `${jobId}_final_with_music.mp4`;
  const finalOutputPath = path.join(VIDEO_OUTPUT_DIR, finalFileName);

  console.log(
    `🎵 [Música] Job: ${jobId} | User: ${resolvedConfig.userId} | Track: ${resolvedConfig.trackKey} (${resolvedFile.fileName} / ${resolvedFile.source}) | Reset: ${resolvedConfig.cycleReset} | Volumen: ${resolvedConfig.baseVolume} | Ducking: ${resolvedConfig.duckingEnabled}`
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
  console.log(`✅ [Música] Video final con música listo en: ${finalVideoUrl}`);

  const updatedPayload = {
    ...masterPayload,
    music: {
      enabled: true,
      applied: true,
      userId: resolvedConfig.userId,
      preset: resolvedConfig.preset,
      trackKey: resolvedConfig.trackKey,
      trackLabel: resolvedConfig.trackLabel,
      selectionMode: resolvedConfig.selectionMode,
      cycleReset: resolvedConfig.cycleReset,
      fileName: resolvedFile.fileName,
      source: resolvedFile.source,
      baseVolume: resolvedConfig.baseVolume,
      duckingEnabled: resolvedConfig.duckingEnabled,
      fadeOutSeconds: resolvedConfig.fadeOutSeconds,
      mixedAt: new Date().toISOString()
    },
    video: {
      ...(masterPayload.video || {}),
      previousVideoUrl: inputRelVideo,
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
