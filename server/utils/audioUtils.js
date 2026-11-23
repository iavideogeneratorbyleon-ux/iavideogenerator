const ffmpeg = require('fluent-ffmpeg');

async function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {

    ffmpeg.ffprobe(
      filePath,
      (err, metadata) => {

        if (err) {
          return reject(err);
        }

        resolve(
          Number(
            metadata?.format?.duration
          ) || 0
        );
      }
    );
  });
}

module.exports = {
  getAudioDuration
};