require('dotenv').config();
const { ElevenLabsClient } = require('elevenlabs');
const fs = require('fs');
const path = require('path');

// Inicializar el cliente usando la API Key del archivo .env
const client = new ElevenLabsClient({ 
    apiKey: process.env.ELEVENLABS_API_KEY 
});

async function probarAudio() {
    try {
        console.log("Generando audio con ElevenLabs...");

        // Usamos el método convert del SDK oficial
        const audioStream = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
            text: "Hola, este es un saludo desde mi servidor con Express y ElevenLabs.",
            model_id: "eleven_v4",
        });

        // Crear la carpeta output si no existe
        const outputDir = path.join(__dirname, 'output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const filePath = path.join(outputDir, 'resultado.mp3');

        // Guardar el flujo de datos directamente en el archivo .mp3
        const fileStream = fs.createWriteStream(filePath);
        audioStream.pipe(fileStream);

        fileStream.on('finish', () => {
            console.log(`✅ ¡Audio guardado exitosamente en: ${filePath}`);
        });

        fileStream.on('error', (err) => {
            console.error("❌ Error al escribir el archivo de audio:", err);
        });

    } catch (error) {
        console.error("❌ Error al generar el audio:", error);
        if (error.body) {
            console.error("Detalle del servidor:", error.body);
        }
    }
}

probarAudio();
