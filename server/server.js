const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ msj: 'Hello World! El servidor de Video IA esta activo ' });
});

app.listen(PORT, () => {
  console.log(`Server Running in http://localhost:${PORT}`)
});