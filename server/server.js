// Solución compatible con versiones de Node.js para crypto.getRandomValues
const { webcrypto } = require('crypto');
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
} else if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = webcrypto.getRandomValues.bind(webcrypto);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
// require('dotenv').config({ path: '../.env' });


const authRoutes = require('./routes/auth.routes');
const videoRoutes = require('./routes/video.routes'); // <--- 1. Importa las rutas de video
const llmRoutes = require('./routes/llm.routes');

const app = express();
const PORT = process.env.PORT || 3030;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas (cempa-dara-cluster)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('📦 Conectado exitosamente a MongoDB Atlas (cempa-data-cluster)'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err));

// Rutas de la API
app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes); // <--- 2. Monta las rutas en /api/videos
app.use('/api/llm', llmRoutes); //Monta las rutas del llm en /api/llm

app.get('/', (req, res) => {
  res.send('API de cempa.ai funcionando al 100% 🚀');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
