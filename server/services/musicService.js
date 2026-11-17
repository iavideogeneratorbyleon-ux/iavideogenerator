// server/services/musicService.js
const fs = require('fs');
const path = require('path');

const MUSIC_DIR = path.join(__dirname, '..', 'public', 'audio', 'bg_music');

if (!fs.existsSync(MUSIC_DIR)) {
  fs.mkdirSync(MUSIC_DIR, { recursive: true });
}

// Catálogo base de pistas instrumentales clasificadas por temática/nicho
const MUSIC_CATALOG = {
  tech: { name: 'Tech Upbeat & Fast', url: '/audio/bg_music/tech_upbeat.mp3' },
  business: { name: 'Corporate Inspiring', url: '/audio/bg_music/corporate_inspiring.mp3' },
  lifestyle: { name: 'Lo-Fi Chill & Smooth', url: '/audio/bg_music/lofi_chill.mp3' },
  default: { name: 'Universal Energetic Beat', url: '/audio/bg_music/default_energetic.mp3' }
};

function selectBackgroundMusic(nicheOrTone = 'default') {
  console.log(`🎵 [Music] Seleccionando pista de fondo para: "${nicheOrTone}"...`);
  
  const key = nicheOrTone.toLowerCase();
  let selected = MUSIC_CATALOG.default;

  if (key.includes('tech') || key.includes('ai') || key.includes('software') || key.includes('tool')) {
    selected = MUSIC_CATALOG.tech;
  } else if (key.includes('business') || key.includes('money') || key.includes('work')) {
    selected = MUSIC_CATALOG.business;
  } else if (key.includes('lifestyle') || key.includes('travel') || key.includes('daily')) {
    selected = MUSIC_CATALOG.lifestyle;
  }

  return {
    trackName: selected.name,
    audioUrl: selected.url,
    volume: 0.15, // Sugerencia de volumen al 15% para no opacar la voz de ElevenLabs
    ducking: true // Atenuación automática cuando hable la locución
  };
}

module.exports = {
  selectBackgroundMusic
};
