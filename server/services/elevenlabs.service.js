const { ElevenLabsClient } = require('elevenlabs');

const client = new ElevenLabsClient({ 
    apiKey: process.env.ELEVENLABS_API_KEY 
});

async function generateAudioStream(text) {
    try {
        const audioStream = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
            text: text,
            model_id: "eleven_v4",
        });
        return audioStream;
    } catch (error) {
        throw new Error(`Error en ElevenLabs: ${error.message}`);
    }
}

module.exports = { generateAudioStream };
