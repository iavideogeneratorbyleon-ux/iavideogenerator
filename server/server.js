require('dotenv').config();
const express = require('express');
const cors = require('cors');
const audioRoutes = require('./routes/audio.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Registrar Rutas
app.use('/api/audio', audioRoutes);

// Ruta base de prueba
app.get('/', (req, res) => {
    res.send('Servidor de generación de videos/audio activo 🚀');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
