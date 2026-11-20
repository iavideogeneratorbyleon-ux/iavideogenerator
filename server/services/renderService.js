// server/services/renderService.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const VIDEO_OUTPUT_DIR = path.join(PUBLIC_DIR, 'videos');
const TEMP_DIR = path.join(PUBLIC_DIR, 'temp_render');

[VIDEO_OUTPUT_DIR, TEMP_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const PRESET_CONFIGS = {
  netflix: {
    key: 'netflix',
    label: 'Netflix',
    motion: 'slow_zoom_in',
    eqFilter: 'eq=contrast=1.06:brightness=-0.02:saturation=0.95',
    paidSubtitles: {
      style: 'cinematic_clean',
      primaryColour: '&H00FFFFFF',
      accentColour: '&H00E5E5E5',
      outlineColour: '&H00000000',
      backColour: '&H64000000',
      borderStyle: 1,
      outline: 2,
      shadow: 2,
      fontScale: 1.0
    }
  },
  mr_beast: {
    key: 'mr_beast',
    label: 'Mr Beast',
    motion: 'punch_zoom_in',
    eqFilter: 'eq=contrast=1.12:brightness=0.02:saturation=1.22',
    paidSubtitles: {
      style: 'high_impact',
      primaryColour: '&H0000FFFF', // Amarillo vibrante en formato ASS (&HAABBGGRR)
      accentColour: '&H00FFFFFF',
      outlineColour: '&H00000000',
      backColour: '&H80000000',
      borderStyle: 1,
      outline: 4,
      shadow: 3,
      fontScale: 1.18
    }
  },
  tiktok_viral: {
    key: 'tiktok_viral',
    label: 'TikTok Viral',
    motion: 'dynamic_pan',
    eqFilter: 'eq=contrast=1.08:brightness=0.01:saturation=1.15',
    paidSubtitles: {
      style: 'creator_pop',
      primaryColour: '&H00FFFFFF',
      accentColour: '&H0000FFFF',
      outlineColour: '&H00000000',
      backColour: '&H64000000',
      borderStyle: 1,
      outline: 3,
      shadow: 2,
      fontScale: 1.12
    }
  },
  luxury: {
    key: 'luxury',
    label: 'Luxury',
    motion: 'smooth_drift',
    eqFilter: 'eq=contrast=1.05:brightness=-0.01:saturation=0.92',
    paidSubtitles: {
      style: 'editorial_gold',
      primaryColour: '&H00D4F2FF', // Tono cálido/champagne suave
      accentColour: '&H00FFFFFF',
      outlineColour: '&H00141414',
      backColour: '&H50000000',
      borderStyle: 1,
      outline: 2,
      shadow: 2,
      fontScale: 0.98
    }
  },
  tech: {
    key: 'tech',
    label: 'Tech',
    motion: 'clean_zoom_out',
    eqFilter: 'eq=contrast=1.09:brightness=0.0:saturation=1.05',
    paidSubtitles: {
      style: 'modern_sharp',
      primaryColour: '&H00FFF0B3', // Cian/blanco limpio moderno
      accentColour: '&H00FFFFFF',
      outlineColour: '&H000A0A0A',
      backColour: '&H64000000',
      borderStyle: 1,
      outline: 2,
      shadow: 2,
      fontScale: 1.02
    }
  },
  default: {
    key: 'default',
    label: 'Default',
    motion: 'slow_zoom_in',
    eqFilter: 'eq=contrast=1.03:brightness=0.0:saturation=1.04',
    paidSubtitles: {
      style: 'standard_enhanced',
      primaryColour: '&H00FFFFFF',
      accentColour: '&H0000FFFF',
      outlineColour: '&H00000000',
      backColour: '&H64000000',
      borderStyle: 1,
      outline: 2,
      shadow: 1,
      fontScale: 1.0
    }
  }
};

function normalizePresetKey(rawPreset) {
  if (!rawPreset || typeof rawPreset !== 'string') return 'default';
  const cleaned = rawPreset
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (cleaned === 'mrbeast' || cleaned === 'mr_beast') return 'mr_beast';
  if (cleaned === 'tiktok' || cleaned === 'tiktok_viral' || cleaned === 'viral') {
    return 'tiktok_viral';
  }
  if (PRESET_CONFIGS[cleaned]) return cleaned;
  return 'default';
}

function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(Number(metadata?.format?.duration) || 5);
    });
  });
}

function resolveRenderConfig(masterPayload = {}) {
  const userPlan =
    masterPayload?.meta?.userPlan ||
    masterPayload?.orchestration?.planApplied ||
    'free_trial';
  const isFreePlan = userPlan === 'free_trial';

  const requestedResolution =
    masterPayload?.videoConfig?.resolution ||
    masterPayload?.userInputs?.resolution ||
    (isFreePlan ? '720p' : '1080p');

  const resolution = isFreePlan
    ? '720p'
    : requestedResolution === '720p'
      ? '720p'
      : '1080p';

  const aspectRatio =
    masterPayload?.visual?.aspectRatio ||
    masterPayload?.userInputs?.aspectRatio ||
    masterPayload?.visualConfig?.aspectRatio ||
    masterPayload?.config?.aspectRatio ||
    '9:16';

  const rawPreset =
    masterPayload?.videoConfig?.preset ||
    masterPayload?.userInputs?.preset ||
    masterPayload?.visual?.preset ||
    masterPayload?.config?.preset ||
    'default';

  const presetKey = normalizePresetKey(rawPreset);
  const presetConfig = PRESET_CONFIGS[presetKey] || PRESET_CONFIGS.default;

  const subtitlesEnabled =
    typeof masterPayload?.videoConfig?.subtitles?.enabled === 'boolean'
      ? masterPayload.videoConfig.subtitles.enabled
      : typeof masterPayload?.videoConfig?.subtitles === 'boolean'
        ? masterPayload.videoConfig.subtitles
        : typeof masterPayload?.config?.subtitles === 'boolean'
          ? masterPayload.config.subtitles
          : typeof masterPayload?.userInputs?.subtitles === 'boolean'
            ? masterPayload.userInputs.subtitles
            : true;

  // free_trial siempre usa subtítulos estáticos; planes de pago usan efectos/estilos por preset
  const subtitleMode = isFreePlan ? 'static' : 'styled_effects';

  const watermark =
    typeof masterPayload?.videoConfig?.watermark === 'boolean'
      ? isFreePlan ? true : masterPayload.videoConfig.watermark
      : isFreePlan;

  const endingBufferSeconds =
    typeof masterPayload?.orchestration?.endingBufferSeconds === 'number'
      ? masterPayload.orchestration.endingBufferSeconds
      : masterPayload?.llmDirective?.structuredScript?.endingBufferSeconds ?? 1.5;

  return {
    userPlan,
    isFreePlan,
    resolution,
    aspectRatio,
    preset: presetConfig.key,
    presetLabel: presetConfig.label,
    presetConfig,
    fps: 30,
    watermark,
    subtitles: {
      enabled: subtitlesEnabled,
      mode: subtitleMode,
      effectStyle: isFreePlan ? 'static_basic' : presetConfig.paidSubtitles.style
    },
    endingBufferSeconds
  };
}

function getTargetDimensions(aspectRatio = '9:16', resolution = '1080p') {
  const is720 = resolution === '720p';

  switch (aspectRatio) {
    case '16:9':
      return is720 ? { width: 1280, height: 720 } : { width: 1920, height: 1080 };
    case '1:1':
      return is720 ? { width: 720, height: 720 } : { width: 1080, height: 1080 };
    case '9:16':
    default:
      return is720 ? { width: 720, height: 1280 } : { width: 1080, height: 1920 };
  }
}

function splitSubtitleChunks(text = '', maxWords = 6) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
}

function formatSrtTime(seconds = 0) {
  const safeSec = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const millis = Math.round((safeSec - Math.floor(safeSec)) * 1000);

  const pad = (n, len = 2) => String(n).padStart(len, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(millis, 3)}`;
}

function formatAssTime(seconds = 0) {
  const safeSec = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const centis = Math.round((safeSec - Math.floor(safeSec)) * 100);

  const pad = (n, len = 2) => String(n).padStart(len, '0');
  return `${hours}:${pad(minutes)}:${pad(secs)}.${pad(centis)}`;
}

function buildTimedChunks({ text, duration, maxWords = 6 }) {
  const chunks = splitSubtitleChunks(text, maxWords);
  if (!chunks.length) return [];

  const totalWords = chunks.reduce(
    (acc, chunk) => acc + chunk.split(/\s+/).length,
    0
  );

  let currentTime = 0;
  return chunks.map((chunk, idx) => {
    const wordCount = chunk.split(/\s+/).length;
    const isLast = idx === chunks.length - 1;
    const chunkDuration = isLast
      ? Math.max(0.5, duration - currentTime)
      : Math.max(0.6, (wordCount / Math.max(1, totalWords)) * duration);

    const start = currentTime;
    const end = isLast ? duration : Math.min(duration, currentTime + chunkDuration);
    currentTime = end;

    return {
      index: idx + 1,
      text: chunk,
      start,
      end
    };
  });
}

function buildSceneSubtitleSrt({ text, duration, srtPath }) {
  const timedChunks = buildTimedChunks({ text, duration, maxWords: 6 });
  if (!timedChunks.length) return null;

  const srtBlocks = timedChunks.map(
    (item) =>
      `${item.index}\n${formatSrtTime(item.start)} --> ${formatSrtTime(item.end)}\n${item.text}\n`
  );

  fs.writeFileSync(srtPath, srtBlocks.join('\n'), 'utf8');
  return srtPath;
}

function buildSceneSubtitleAss({
  text,
  duration,
  assPath,
  width,
  height,
  aspectRatio,
  presetConfig
}) {
  const timedChunks = buildTimedChunks({ text, duration, maxWords: 5 });
  if (!timedChunks.length) return null;

  const subStyle = presetConfig?.paidSubtitles || PRESET_CONFIGS.default.paidSubtitles;
  const baseFontSize =
    aspectRatio === '9:16'
      ? Math.round(width * 0.036)
      : Math.round(height * 0.04);
  const fontSize = Math.round(baseFontSize * (subStyle.fontScale || 1));

  const marginV =
    aspectRatio === '9:16'
      ? Math.round(height * 0.12)
      : Math.round(height * 0.06);

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: PaidStyle,Arial,${fontSize},${subStyle.primaryColour},${subStyle.accentColour},${subStyle.outlineColour},${subStyle.backColour},-1,0,0,0,100,100,0,0,${subStyle.borderStyle},${subStyle.outline},${subStyle.shadow},2,40,40,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = timedChunks
    .map((item) => {
      const safeText = item.text.replace(/\r?\n/g, ' ').replace(/\{|\}/g, '');
      // Fade sutil de entrada/salida (80ms) para planes de pago
      const dialogueText = `{\\fad(80,80)}${safeText}`;
      return `Dialogue: 0,${formatAssTime(item.start)},${formatAssTime(item.end)},PaidStyle,,0,0,0,,${dialogueText}`;
    })
    .join('\n');

  fs.writeFileSync(assPath, `${header}${events}\n`, 'utf8');
  return assPath;
}

function buildMotionFilter({ width, height, duration, fps, motionType, sceneIndex = 0 }) {
  const totalFrames = Math.max(1, Math.round(duration * fps));
  // Pre-escalamos con margen para evitar bordes negros durante zoom/paneo
  const preScaleW = Math.round(width * 1.25);
  const preScaleH = Math.round(height * 1.25);

  const cycleMotion =
    motionType === 'dynamic_pan'
      ? sceneIndex % 2 === 0
        ? 'pan_left'
        : 'pan_right'
      : motionType;

  let zoomExpr = `'1.04'`;
  let xExpr = `'(iw-ow)/2'`;
  let yExpr = `'(ih-oh)/2'`;

  switch (cycleMotion) {
    case 'punch_zoom_in':
      zoomExpr = `'1.02 + 0.14*(on/${totalFrames})'`;
      xExpr = `'(iw-ow)/2'`;
      yExpr = `'(ih-oh)*0.35'`;
      break;
    case 'clean_zoom_out':
      zoomExpr = `'1.14 - 0.12*(on/${totalFrames})'`;
      xExpr = `'(iw-ow)/2'`;
      yExpr = `'(ih-oh)/2'`;
      break;
    case 'pan_left':
      zoomExpr = `'1.08'`;
      xExpr = `'(iw-ow)*(1 - on/${totalFrames})'`;
      yExpr = `'(ih-oh)/2'`;
      break;
    case 'pan_right':
      zoomExpr = `'1.08'`;
      xExpr = `'(iw-ow)*(on/${totalFrames})'`;
      yExpr = `'(ih-oh)/2'`;
      break;
    case 'smooth_drift':
      zoomExpr = `'1.03 + 0.07*(on/${totalFrames})'`;
      xExpr = `'(iw-ow)*(0.5 + 0.15*sin(2*PI*on/${totalFrames}))'`;
      yExpr = `'(ih-oh)/2'`;
      break;
    case 'slow_zoom_in':
    default:
      zoomExpr = `'1.01 + 0.09*(on/${totalFrames})'`;
      xExpr = `'(iw-ow)/2'`;
      yExpr = `'(ih-oh)/2'`;
      break;
  }

  return `scale=${preScaleW}:${preScaleH}:force_original_aspect_ratio=increase,crop=${preScaleW}:${preScaleH},zoompan=z=${zoomExpr}:x=${xExpr}:y=${yExpr}:d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
}

function escapeFilterPath(filePath) {
  return filePath
    .replace(/\\/g, '/')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'");
}

function buildVideoFilterChain({
  width,
  height,
  duration,
  fps,
  aspectRatio,
  presetConfig,
  subtitlesEnabled,
  subtitleMode,
  subtitleFilePath,
  subtitleKind,
  watermark,
  is720,
  sceneIndex
}) {
  const filters = [
    buildMotionFilter({
      width,
      height,
      duration,
      fps,
      motionType: presetConfig?.motion || 'slow_zoom_in',
      sceneIndex
    })
  ];

  if (presetConfig?.eqFilter) {
    filters.push(presetConfig.eqFilter);
  }

  if (watermark) {
    const fontSize = is720 ? 18 : 24;
    const padX = is720 ? 18 : 28;
    const padY = is720 ? 18 : 28;
    filters.push(
      `drawtext=text='STUDIO FREE PREVIEW':fontcolor=white@0.65:fontsize=${fontSize}:x=w-tw-${padX}:y=${padY}:box=1:boxcolor=black@0.35:boxborderw=6`
    );
  }

  if (subtitlesEnabled && subtitleFilePath && fs.existsSync(subtitleFilePath)) {
    const escapedPath = escapeFilterPath(subtitleFilePath);

    if (subtitleKind === 'ass' && subtitleMode === 'styled_effects') {
      filters.push(`ass='${escapedPath}'`);
    } else {
      const marginV =
        aspectRatio === '9:16'
          ? Math.round(height * 0.12)
          : Math.round(height * 0.06);

      const fontSize =
        aspectRatio === '9:16'
          ? Math.round(width * 0.035)
          : Math.round(height * 0.038);

      filters.push(
        `subtitles='${escapedPath}':force_style='PlayResX=${width},PlayResY=${height},FontSize=${fontSize},PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H64000000,BorderStyle=1,Outline=2,Shadow=1,MarginV=${marginV},Alignment=2'`
      );
    }
  }

  return filters.join(',');
}

function runFfmpegClip({
  imagePath,
  audioPath,
  duration,
  outputClipPath,
  fps,
  videoFilter
}) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .loop(duration)
      .input(audioPath)
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        `-r ${fps}`,
        `-t ${duration}`
      ])
      .videoFilters(videoFilter)
      .save(outputClipPath)
      .on('end', () => resolve(outputClipPath))
      .on('error', (err) => reject(err));
  });
}

async function renderSceneClip({
  imagePath,
  audioPath,
  duration,
  outputClipPath,
  renderConfig,
  subtitleText,
  srtPath,
  assPath,
  sceneIndex
}) {
  const { width, height } = getTargetDimensions(
    renderConfig.aspectRatio,
    renderConfig.resolution
  );
  const is720 = renderConfig.resolution === '720p';

  let activeSubFile = null;
  let activeSubKind = null;

  if (renderConfig.subtitles.enabled && subtitleText) {
    if (renderConfig.subtitles.mode === 'styled_effects' && assPath) {
      activeSubFile = buildSceneSubtitleAss({
        text: subtitleText,
        duration,
        assPath,
        width,
        height,
        aspectRatio: renderConfig.aspectRatio,
        presetConfig: renderConfig.presetConfig
      });
      activeSubKind = activeSubFile ? 'ass' : null;
    } else if (srtPath) {
      activeSubFile = buildSceneSubtitleSrt({
        text: subtitleText,
        duration,
        srtPath
      });
      activeSubKind = activeSubFile ? 'srt' : null;
    }
  }

  const primaryFilter = buildVideoFilterChain({
    width,
    height,
    duration,
    fps: renderConfig.fps,
    aspectRatio: renderConfig.aspectRatio,
    presetConfig: renderConfig.presetConfig,
    subtitlesEnabled: Boolean(activeSubFile),
    subtitleMode: renderConfig.subtitles.mode,
    subtitleFilePath: activeSubFile,
    subtitleKind: activeSubKind,
    watermark: renderConfig.watermark,
    is720,
    sceneIndex
  });

  try {
    await runFfmpegClip({
      imagePath,
      audioPath,
      duration,
      outputClipPath,
      fps: renderConfig.fps,
      videoFilter: primaryFilter
    });
  } catch (err) {
    // Fallback a SRT estático o sin subtítulos si el filtro ASS/subtitles no está disponible
    if (activeSubFile) {
      let fallbackSubFile = activeSubFile;
      let fallbackSubKind = activeSubKind;

      if (activeSubKind === 'ass' && srtPath) {
        fallbackSubFile = buildSceneSubtitleSrt({
          text: subtitleText,
          duration,
          srtPath
        });
        fallbackSubKind = fallbackSubFile ? 'srt' : null;
      }

      const fallbackFilter = buildVideoFilterChain({
        width,
        height,
        duration,
        fps: renderConfig.fps,
        aspectRatio: renderConfig.aspectRatio,
        presetConfig: renderConfig.presetConfig,
        subtitlesEnabled: Boolean(fallbackSubFile),
        subtitleMode: 'static',
        subtitleFilePath: fallbackSubFile,
        subtitleKind: fallbackSubKind,
        watermark: renderConfig.watermark,
        is720,
        sceneIndex
      });

      try {
        await runFfmpegClip({
          imagePath,
          audioPath,
          duration,
          outputClipPath,
          fps: renderConfig.fps,
          videoFilter: fallbackFilter
        });
      } catch (_secondErr) {
        const cleanFilter = buildVideoFilterChain({
          width,
          height,
          duration,
          fps: renderConfig.fps,
          aspectRatio: renderConfig.aspectRatio,
          presetConfig: renderConfig.presetConfig,
          subtitlesEnabled: false,
          subtitleMode: 'static',
          subtitleFilePath: null,
          subtitleKind: null,
          watermark: renderConfig.watermark,
          is720,
          sceneIndex
        });
        await runFfmpegClip({
          imagePath,
          audioPath,
          duration,
          outputClipPath,
          fps: renderConfig.fps,
          videoFilter: cleanFilter
        });
      } finally {
        if (fallbackSubFile && fs.existsSync(fallbackSubFile)) {
          fs.unlinkSync(fallbackSubFile);
        }
      }
    } else {
      throw err;
    }
  } finally {
    [activeSubFile, srtPath, assPath].forEach((f) => {
      if (f && fs.existsSync(f)) {
        fs.unlinkSync(f);
      }
    });
  }

  return outputClipPath;
}

function concatSceneClips({ clipPaths, outputVideoPath, jobId }) {
  return new Promise((resolve, reject) => {
    const concatListPath = path.join(TEMP_DIR, `${jobId}_concat.txt`);
    const fileContent = clipPaths
      .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
      .join('\n');
    fs.writeFileSync(concatListPath, fileContent, 'utf8');

    ffmpeg()
      .input(concatListPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .save(outputVideoPath)
      .on('end', () => {
        [concatListPath, ...clipPaths].forEach((f) => {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        });
        resolve(outputVideoPath);
      })
      .on('error', (err) => {
        [concatListPath, ...clipPaths].forEach((f) => {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        });
        reject(err);
      });
  });
}

async function renderFinalVideo(rawPayload) {
  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload || {};
  const structuredScript =
    masterPayload?.llmDirective?.structuredScript ||
    masterPayload?.structuredScript ||
    (Array.isArray(masterPayload?.scenes) ? masterPayload : null);

  const scenes = structuredScript?.scenes || [];
  if (!Array.isArray(scenes) || !scenes.length) {
    throw new Error('No hay escenas disponibles en el payload para renderizar.');
  }

  const jobId =
    masterPayload.jobId ||
    masterPayload?.meta?.jobId ||
    masterPayload?.visual?.jobId ||
    `job_${Date.now()}`;

  const renderConfig = resolveRenderConfig(masterPayload);
  const { width, height } = getTargetDimensions(
    renderConfig.aspectRatio,
    renderConfig.resolution
  );

  console.log(
    `🎬 [Render Paso 4] Job: ${jobId} | Plan: ${renderConfig.userPlan} | Preset: ${renderConfig.presetLabel} | Formato: ${renderConfig.aspectRatio} | Resolución: ${renderConfig.resolution} (${width}x${height}) | Subtítulos: ${renderConfig.subtitles.enabled} (${renderConfig.subtitles.mode})`
  );

  const clipPaths = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const isLastScene = i === scenes.length - 1;
    const relImage = scene?.visual?.imageUrl || scene?.imageUrl;
    const relAudio = scene?.audio?.audioUrl || scene?.audioUrl;

    if (!relImage || !relAudio) {
      throw new Error(
        `Faltan visual.imageUrl o audio.audioUrl en la escena ${scene.sceneNumber}.`
      );
    }

    const imagePath = path.join(PUBLIC_DIR, relImage.replace(/^\/+/, ''));
    const audioPath = path.join(PUBLIC_DIR, relAudio.replace(/^\/+/, ''));

    if (!fs.existsSync(imagePath) || !fs.existsSync(audioPath)) {
      throw new Error(
        `No existen en disco los archivos de la escena ${scene.sceneNumber}: ${imagePath} o ${audioPath}`
      );
    }

    const audioDuration = await getAudioDuration(audioPath);
    const sceneDuration = isLastScene
      ? Number((audioDuration + renderConfig.endingBufferSeconds).toFixed(2))
      : Number(audioDuration.toFixed(2));

    const clipPath = path.join(TEMP_DIR, `${jobId}_clip_${scene.sceneNumber}.mp4`);
    const srtPath = path.join(TEMP_DIR, `${jobId}_scene_${scene.sceneNumber}.srt`);
    const assPath = path.join(TEMP_DIR, `${jobId}_scene_${scene.sceneNumber}.ass`);

    await renderSceneClip({
      imagePath,
      audioPath,
      duration: sceneDuration,
      outputClipPath: clipPath,
      renderConfig,
      subtitleText: scene.voiceoverText,
      srtPath,
      assPath,
      sceneIndex: i
    });

    clipPaths.push(clipPath);
  }

  const videoFileName = `${jobId}_step4_render.mp4`;
  const finalOutputPath = path.join(VIDEO_OUTPUT_DIR, videoFileName);

  await concatSceneClips({
    clipPaths,
    outputVideoPath: finalOutputPath,
    jobId
  });

  const videoUrl = `/videos/${videoFileName}`;
  console.log(`✅ [Render Paso 4] Video ensamblado en: ${videoUrl}`);

  const updatedPayload = {
    ...masterPayload,
    meta: {
      ...(masterPayload.meta || {}),
      jobId
    },
    video: {
      ...(masterPayload.video || {}),
      jobId,
      fileName: videoFileName,
      videoUrl,
      preset: renderConfig.preset,
      presetLabel: renderConfig.presetLabel,
      resolution: renderConfig.resolution,
      width,
      height,
      fps: renderConfig.fps,
      aspectRatio: renderConfig.aspectRatio,
      watermark: renderConfig.watermark,
      subtitles: renderConfig.subtitles,
      endingBufferSeconds: renderConfig.endingBufferSeconds,
      renderedAt: new Date().toISOString()
    }
  };

  return {
    videoFileName,
    videoUrl,
    preset: renderConfig.preset,
    resolution: renderConfig.resolution,
    subtitlesEnabled: renderConfig.subtitles.enabled,
    subtitleMode: renderConfig.subtitles.mode,
    watermark: renderConfig.watermark,
    renderedAt: new Date(),
    payload: updatedPayload
  };
}

module.exports = {
  renderFinalVideo,
  resolveRenderConfig,
  getTargetDimensions,
  PRESET_CONFIGS
};
