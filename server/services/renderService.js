// server/services/renderService.js
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

function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration || 5);
    });
  });
}

// Helper para crear el clip individual de cada escena de forma segura sin errores de filtros
function renderSceneClip({ imagePath, audioPath, duration, outputClipPath }) {
  return new Promise((resolve, reject) => {
    // Filtro simplificado compatible con todas las versiones de FFmpeg y fluent-ffmpeg
    let videoFilter = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(ow-iw)/2:(oh-ih)/2';

    ffmpeg()
      .input(imagePath)
      .loop(duration)
      .input(audioPath)
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        '-r 30',
        `-t ${duration}`
      ])
      .videoFilters(videoFilter)
      .save(outputClipPath)
      .on('end', () => resolve(outputClipPath))
      .on('error', (err) => reject(err));
  });
}


function mergeClipsAndMusic({ clipPaths, bgMusicPath, musicVolume = 0.15, finalOutputPath, jobId }) {
  return new Promise((resolve, reject) => {
    const concatListPath = path.join(TEMP_DIR, `${jobId}_concat.txt`);
    const fileContent = clipPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n');
    fs.writeFileSync(concatListPath, fileContent);

    const tempConcatVideo = path.join(TEMP_DIR, `${jobId}_concat_raw.mp4`);

    ffmpeg()
      .input(concatListPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .save(tempConcatVideo)
      .on('end', () => {
        if (bgMusicPath && fs.existsSync(bgMusicPath)) {
          ffmpeg()
            .input(tempConcatVideo)
            .input(bgMusicPath)
            .inputOptions(['-stream_loop -1'])
            .complexFilter([
              `[1:a]volume=${musicVolume}[bg]`,
              '[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[aout]'
            ])
            .outputOptions([
              '-map 0:v',
              '-map [aout]',
              '-c:v copy',
              '-c:a aac',
              '-b:a 192k',
              '-shortest'
            ])
            .save(finalOutputPath)
            .on('end', () => {
              [concatListPath, tempConcatVideo, ...clipPaths].forEach((f) => {
                if (fs.existsSync(f)) fs.unlinkSync(f);
              });
              resolve(finalOutputPath);
            })
            .on('error', (err) => reject(err));
        } else {
          fs.renameSync(tempConcatVideo, finalOutputPath);
          resolve(finalOutputPath);
        }
      })
      .on('error', (err) => reject(err));
  });
}

async function renderFinalVideo(masterPayload) {
  const jobId = masterPayload.jobId || masterPayload?.meta?.jobId || `job_${Date.now()}`;
  const scenes = masterPayload?.llmDirective?.structuredScript?.scenes || [];
  const isFreePlan = (masterPayload?.meta?.userPlan || 'free_trial') === 'free_trial';
  
  // Detectar si el usuario activó subtítulos en el Wizard
  const subtitlesEnabled = masterPayload?.config?.subtitles !== false && masterPayload?.userInputs?.subtitles !== false;

  if (!scenes.length) {
    throw new Error('No hay escenas disponibles en el payload para renderizar.');
  }

  console.log(`🎬 [Render] Iniciando ensamblaje de video para Job: ${jobId} (${scenes.length} escenas)...`);

  const clipPaths = [];

  for (const scene of scenes) {
    const relImage = scene.visual?.imageUrl || scene.imageUrl;
    const relAudio = scene.audio?.audioUrl || scene.audioUrl;

    const imagePath = path.join(PUBLIC_DIR, relImage);
    const audioPath = path.join(PUBLIC_DIR, relAudio);

    if (!fs.existsSync(imagePath) || !fs.existsSync(audioPath)) {
      throw new Error(`Faltan archivos multimedia para la escena ${scene.sceneNumber}: ${imagePath} o ${audioPath}`);
    }

    const exactDuration = await getAudioDuration(audioPath);
    const clipPath = path.join(TEMP_DIR, `${jobId}_clip_${scene.sceneNumber}.mp4`);

    console.log(`   🎞️ Renderizando escena ${scene.sceneNumber} (${exactDuration.toFixed(2)}s)...`);
    await renderSceneClip({
      imagePath,
      audioPath,
      duration: exactDuration,
      outputClipPath: clipPath,
      isFreePlan,
      subtitleText: scene.voiceoverText,
      subtitlesEnabled
    });

    clipPaths.push(clipPath);
  }

  const relBgMusic = masterPayload?.audioLayer?.backgroundMusic?.audioUrl;
  const bgMusicPath = relBgMusic ? path.join(PUBLIC_DIR, relBgMusic) : null;
  const musicVolume = masterPayload?.audioLayer?.mixSettings?.musicVolume ?? 0.15;

  const finalFileName = `${jobId}_final.mp4`;
  const finalOutputPath = path.join(VIDEO_OUTPUT_DIR, finalFileName);

  console.log(`   🎚️ Uniendo escenas y mezclando música de fondo...`);
  await mergeClipsAndMusic({
    clipPaths,
    bgMusicPath,
    musicVolume,
    finalOutputPath,
    jobId
  });

  console.log(`✅ [Render] Video final listo en: /videos/${finalFileName}`);

  return {
    videoFileName: finalFileName,
    videoUrl: `/videos/${finalFileName}`,
    renderedAt: new Date()
  };
}

module.exports = {
  renderFinalVideo
};
