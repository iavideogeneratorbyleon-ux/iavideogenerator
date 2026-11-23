// server/test_music_local.js
const fs = require('fs');
const path = require('path');
const { applyBackgroundMusic } = require('./services/musicService');

const VIDEOS_DIR = path.join(__dirname, 'public', 'videos');
const SOURCE_VIDEO = path.join(VIDEOS_DIR, 'job_1795382959154_step4_render.mp4'); // Pon aquí tu video base sin música

async function runTest() {
  if (!fs.existsSync(SOURCE_VIDEO)) {
    console.error('Coloca primero un video base sin música en:', SOURCE_VIDEO);
    process.exit(1);
  }

  const userId = 'user_test_01';
  const preset = 'educational';

  // Simula 11 videos seguidos con el mismo userId y preset para ver rotación y reset
  for (let i = 1; i <= 11; i += 1) {
    const tempInputName = `temp_input_${preset}_${i}.mp4`;
    const tempInputPath = path.join(VIDEOS_DIR, tempInputName);
    fs.copyFileSync(SOURCE_VIDEO, tempInputPath);

    const res = await applyBackgroundMusic({
      jobId: `test_music_${preset}_${i}`,
      userId,
      userInputs: {
        preset,
        tone: 'clear'
      },
      video: {
        fileName: tempInputName,
        videoUrl: `/videos/${tempInputName}`
      }
    });

    console.log(
      `#${i} -> track=${res.payload.music.trackKey} | file=${res.payload.music.fileName} | reset=${res.payload.music.cycleReset} | out=${res.videoUrl}`
    );
  }
}

runTest().catch((err) => {
  console.error('Error en prueba de música:', err);
  process.exit(1);
});
