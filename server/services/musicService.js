// server/services/musicService.js
const fs = require('fs');
const path = require('path');

const MUSIC_DIR = path.join(__dirname, '..', 'public', 'audio', 'bg_music');

if (!fs.existsSync(MUSIC_DIR)) {
  fs.mkdirSync(MUSIC_DIR, { recursive: true });
}

// Catálogo ampliado y mapeado directamente por clave exacta
const MUSIC_CATALOG = {
  lofi: { name: 'Lo-Fi Chill & Smooth', url: '/audio/bg_music/lofi_chill.mp3' },
  tech: { name: 'Tech Upbeat & Fast', url: '/audio/bg_music/tech_upbeat.mp3' },
  business: { name: 'Corporate Inspiring', url: '/audio/bg_music/corporate_inspiring.mp3' },
  lifestyle: { name: 'Lifestyle & Ambient', url: '/audio/bg_music/lifestyle_ambient.mp3' }, // Asegúrate de tener este archivo o ajusta el nombre
  upbeat: { name: 'Upbeat Energetic Beat', url: '/audio/bg_music/default_energetic.mp3' },
  default: { name: 'Universal Energetic Beat', url: '/audio/bg_music/default_energetic.mp3' }
};

function selectBackgroundMusic(nicheOrTone = 'default') {
  const cleanKey = (nicheOrTone || 'default').toLowerCase();
  console.log(`🎵 [Music Engine] Estilo de música solicitado en el Payload: "${cleanKey}"`);
  
  // Búsqueda directa: Si existe la clave exacta en el catálogo, la usa. Si no, busca coincidencia o usa default.
  let selected = MUSIC_CATALOG[cleanKey];

  if (!selected) {
    // Búsqueda flexible por subcadenas si mandan un texto compuesto
    const matchedKey = Object.keys(MUSIC_CATALOG).find(k => cleanKey.includes(k));
    selected = matchedKey ? MUSIC_CATALOG[matchedKey] : MUSIC_CATALOG.default;
  }

  console.log(`🎧 [Music Engine] Pista seleccionada: [${selected.name}] (${selected.url})`);

  return {
    trackName: selected.name,
    audioUrl: selected.url,
    volume: 0.15, // Volumen al 15% para no opacar la voz de ElevenLabs
    ducking: true // Atenuación automática cuando hable la locución
  };
}

module.exports = {
  selectBackgroundMusic
};
