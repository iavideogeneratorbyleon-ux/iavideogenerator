// server/utils/musicCatalog.js

// Historial en memoria por `${userId}:${preset}` para rotar sin repetir hasta agotar el pool
const USER_PRESET_MUSIC_HISTORY = new Map();

function buildPresetTracks({
  preset,
  folderName = preset,
  count = 10,
  defaultVolume = 0.20,
  trackDefs = []
}) {
  const catalogEntries = {};
  const poolKeys = [];

  for (let i = 1; i <= count; i += 1) {
    const num = String(i).padStart(2, '0');
    const key = `${preset}_${num}`;
    const def = trackDefs[i - 1] || {};

    catalogEntries[key] = {
      key,
      label: def.label || `${preset} Track ${num}`,
      fileName: `${folderName}/track_${num}.mp3`,
      defaultVolume:
        typeof def.defaultVolume === 'number' ? def.defaultVolume : defaultVolume,
      moods: Array.isArray(def.moods) && def.moods.length > 0 ? def.moods : [preset]
    };

    poolKeys.push(key);
  }

  return { catalogEntries, poolKeys };
}

const PRESET_DEFINITIONS = [
  buildPresetTracks({
    preset: 'educational',
    folderName: 'educational',
    defaultVolume: 0.19,
    trackDefs: [
      { label: 'Calm Explainer Piano', moods: ['educational', 'clear', 'calm'] },
      { label: 'Warm Acoustic Discovery', moods: ['educational', 'storytelling', 'warm'] },
      { label: 'Soft Ambient Focus', moods: ['educational', 'analytical', 'calm'] },
      { label: 'Gentle Curiosity Keys', moods: ['educational', 'curious', 'light'] },
      { label: 'Inspiring Light Strings', moods: ['educational', 'inspiring', 'storytelling'] },
      { label: 'Clean Minimalist Pulse', moods: ['educational', 'modern', 'analytical'] },
      { label: 'Thoughtful Documentary Pad', moods: ['educational', 'documentary', 'serious'] },
      { label: 'Friendly Lo-Fi Study', moods: ['educational', 'casual', 'warm'] },
      { label: 'Hopeful Acoustic Guitar', moods: ['educational', 'inspiring', 'clear'] },
      { label: 'Subtle Tech & Science Bed', moods: ['educational', 'science', 'modern'] }
    ]
  }),
  buildPresetTracks({
    preset: 'dark_mystery',
    folderName: 'dark_mystery',
    defaultVolume: 0.18,
    trackDefs: [
      { label: 'Dark Mystery Drone', moods: ['dark_mystery', 'mystery', 'eerie', 'ambient'] },
      { label: 'Melancholic Noir Piano', moods: ['dark_mystery', 'noir', 'sad', 'investigative'] },
      { label: 'Slow Thriller Tension', moods: ['dark_mystery', 'suspense', 'tense', 'thriller'] },
      { label: 'Shadowy Ambient Pad', moods: ['dark_mystery', 'dark', 'atmospheric', 'calm'] },
      { label: 'Unsolved Case Underscore', moods: ['dark_mystery', 'investigative', 'documentary', 'mystery'] },
      { label: 'Low Cello Suspense', moods: ['dark_mystery', 'dramatic', 'tense', 'cinematic'] },
      { label: 'Midnight Fog Synth', moods: ['dark_mystery', 'night', 'eerie', 'slow'] },
      { label: 'Quiet Paranoia Pulse', moods: ['dark_mystery', 'suspense', 'subtle', 'rivalry'] },
      { label: 'Haunting Keys', moods: ['dark_mystery', 'eerie', 'storytelling'] },
      { label: 'Deep Abyssal Texture', moods: ['dark_mystery', 'deep', 'dark', 'ominous'] }
    ]
  }),
  buildPresetTracks({
    preset: 'cinematic',
    folderName: 'cinematic',
    defaultVolume: 0.19,
    trackDefs: [
      { label: 'Emotional Cinematic Piano', moods: ['cinematic', 'emotional', 'storytelling', 'warm'] },
      { label: 'Sweeping Orchestral Strings', moods: ['cinematic', 'dramatic', 'epic', 'inspiring'] },
      { label: 'Modern Trailer Underscore', moods: ['cinematic', 'tense', 'rivalry', 'modern'] },
      { label: 'Hopeful Horizon Score', moods: ['cinematic', 'inspiring', 'hopeful', 'calm'] },
      { label: 'Dramatic Finale Pad', moods: ['cinematic', 'dramatic', 'intense', 'closing'] },
      { label: 'Atmospheric Film Score', moods: ['cinematic', 'atmospheric', 'documentary', 'slow'] },
      { label: 'Rising Tension Strings', moods: ['cinematic', 'tense', 'suspense', 'building'] },
      { label: 'Minimalist Cinematic Pulse', moods: ['cinematic', 'analytical', 'modern', 'steady'] },
      { label: 'Bittersweet Memory Keys', moods: ['cinematic', 'melancholic', 'nostalgic', 'emotional'] },
      { label: 'Grand Adventure Bed', moods: ['cinematic', 'adventure', 'energetic', 'bold'] }
    ]
  }),
  buildPresetTracks({
    preset: 'documentary',
    folderName: 'documentary',
    defaultVolume: 0.19,
    trackDefs: [
      { label: 'Serious Documentary Underscore', moods: ['documentary', 'serious', 'investigative', 'analytical'] },
      { label: 'Historical Archive Piano', moods: ['documentary', 'historical', 'nostalgic', 'storytelling'] },
      { label: 'Calm Investigative Bed', moods: ['documentary', 'calm', 'investigative', 'clear'] },
      { label: 'Subtle Tension Report', moods: ['documentary', 'tense', 'rivalry', 'serious'] },
      { label: 'Warm Human Story', moods: ['documentary', 'warm', 'emotional', 'storytelling'] },
      { label: 'Minimalist Fact & Data', moods: ['documentary', 'analytical', 'modern', 'steady'] },
      { label: 'Reflective Cello & Pad', moods: ['documentary', 'reflective', 'dramatic', 'slow'] },
      { label: 'Global Society Ambient', moods: ['documentary', 'atmospheric', 'calm', 'broad'] },
      { label: 'Quiet Discovery Keys', moods: ['documentary', 'curious', 'educational', 'clear'] },
      { label: 'Steady Narrative Pulse', moods: ['documentary', 'steady', 'forward', 'direct'] }
    ]
  }),
  buildPresetTracks({
    preset: 'luxury_brand',
    folderName: 'luxury_brand',
    defaultVolume: 0.18,
    trackDefs: [
      { label: 'Deep Luxury Ambient', moods: ['luxury_brand', 'luxury', 'calm', 'elegant'] },
      { label: 'Minimalist Grand Piano', moods: ['luxury_brand', 'elegant', 'sophisticated', 'calm'] },
      { label: 'Velvet Lounge Underscore', moods: ['luxury_brand', 'smooth', 'modern', 'storytelling'] },
      { label: 'Golden Hour Pad', moods: ['luxury_brand', 'warm', 'exclusive', 'relaxed'] },
      { label: 'Quiet Atelier Strings', moods: ['luxury_brand', 'craft', 'refined', 'slow'] },
      { label: 'Subtle Glass & Synth', moods: ['luxury_brand', 'modern', 'minimal', 'analytical'] },
      { label: 'Midnight Penthouse Bed', moods: ['luxury_brand', 'night', 'deep', 'sophisticated'] },
      { label: 'Serene Heritage Keys', moods: ['luxury_brand', 'heritage', 'calm', 'emotional'] },
      { label: 'Airy Wellness Pad', moods: ['luxury_brand', 'peaceful', 'light', 'calm'] },
      { label: 'Understated Prestige Pulse', moods: ['luxury_brand', 'prestige', 'steady', 'direct'] }
    ]
  }),
  buildPresetTracks({
    preset: 'minimalistic',
    folderName: 'minimalistic',
    defaultVolume: 0.18,
    trackDefs: [
      { label: 'Clean Minimal Piano', moods: ['minimalistic', 'minimal', 'calm', 'clear'] },
      { label: 'Open Space Ambient', moods: ['minimalistic', 'calm', 'atmospheric', 'light'] },
      { label: 'Soft Pulse Minimal', moods: ['minimalistic', 'modern', 'steady', 'analytical'] },
      { label: 'Single Note Echo Keys', moods: ['minimalistic', 'quiet', 'reflective', 'storytelling'] },
      { label: 'Gentle Pluck Loop', moods: ['minimalistic', 'warm', 'light', 'curious'] },
      { label: 'Airy Synth Wash', moods: ['minimalistic', 'peaceful', 'smooth', 'calm'] },
      { label: 'Crisp Acoustic Plucks', moods: ['minimalistic', 'clear', 'direct', 'modern'] },
      { label: 'Subtle Lo-Fi Minimal', moods: ['minimalistic', 'casual', 'relaxed', 'warm'] },
      { label: 'Pure White Pad', moods: ['minimalistic', 'ambient', 'quiet', 'focus'] },
      { label: 'Balanced Metro Bed', moods: ['minimalistic', 'steady', 'clean', 'direct'] }
    ]
  }),
  buildPresetTracks({
    preset: 'mr_beast',
    folderName: 'mr_beast',
    defaultVolume: 0.19,
    trackDefs: [
      { label: 'High Energy Pulse', moods: ['mr_beast', 'energetic', 'hype', 'fast'] },
      { label: 'Upbeat Challenge Beat', moods: ['mr_beast', 'upbeat', 'energetic', 'fun'] },
      { label: 'Fast Synth Drive', moods: ['mr_beast', 'fast', 'modern', 'energetic'] },
      { label: 'Bright Pop Groove', moods: ['mr_beast', 'upbeat', 'bright', 'casual'] },
      { label: 'Momentum Percussion Bed', moods: ['mr_beast', 'driving', 'rivalry', 'fast'] },
      { label: 'Playful Hype Plucks', moods: ['mr_beast', 'hype', 'curious', 'upbeat'] },
      { label: 'Action Clockwork Beat', moods: ['mr_beast', 'tense', 'fast', 'energetic'] },
      { label: 'Punchy Electro Pop', moods: ['mr_beast', 'energetic', 'modern', 'hype'] },
      { label: 'Big Reveal Build', moods: ['mr_beast', 'dramatic', 'hype', 'energetic'] },
      { label: 'Nonstop Hook Bed', moods: ['mr_beast', 'fast', 'direct', 'upbeat'] }
    ]
  }),
  buildPresetTracks({
    preset: 'netflix',
    folderName: 'netflix',
    defaultVolume: 0.19,
    trackDefs: [
      { label: 'Series Tension Pulse', moods: ['netflix', 'tense', 'suspense', 'modern'] },
      { label: 'Dark Drama Synth', moods: ['netflix', 'dramatic', 'dark', 'storytelling'] },
      { label: 'Mystery Finale Underscore', moods: ['netflix', 'mystery', 'intense', 'closing'] },
      { label: 'Cold Investigation Bed', moods: ['netflix', 'investigative', 'calm', 'serious'] },
      { label: 'Rivalry & Betrayal Keys', moods: ['netflix', 'rivalry', 'dramatic', 'tense'] },
      { label: 'Midnight Episode Pad', moods: ['netflix', 'night', 'atmospheric', 'slow'] },
      { label: 'Propulsive Thriller Beat', moods: ['netflix', 'thriller', 'fast', 'driving'] },
      { label: 'Emotional Turning Point', moods: ['netflix', 'emotional', 'storytelling', 'warm'] },
      { label: 'Subtle Paranoia Bass', moods: ['netflix', 'suspense', 'subtle', 'dark'] },
      { label: 'Cliffhanger Drone', moods: ['netflix', 'tense', 'building', 'dramatic'] }
    ]
  }),
  buildPresetTracks({
    preset: 'tech_modern',
    folderName: 'tech_modern',
    defaultVolume: 0.19,
    trackDefs: [
      { label: 'Clean Tech Pulse', moods: ['tech_modern', 'modern', 'tech', 'analytical'] },
      { label: 'Future Innovation Pad', moods: ['tech_modern', 'futuristic', 'calm', 'inspiring'] },
      { label: 'Minimalist Data Groove', moods: ['tech_modern', 'analytical', 'steady', 'clear'] },
      { label: 'Soft Cyber Arpeggio', moods: ['tech_modern', 'modern', 'curious', 'fast'] },
      { label: 'Product Launch Bed', moods: ['tech_modern', 'energetic', 'upbeat', 'modern'] },
      { label: 'AI & Neural Ambient', moods: ['tech_modern', 'deep', 'calm', 'futuristic'] },
      { label: 'Smart Interface Beat', moods: ['tech_modern', 'direct', 'steady', 'clean'] },
      { label: 'Glass & Circuit Keys', moods: ['tech_modern', 'light', 'clear', 'educational'] },
      { label: 'Next-Gen Momentum', moods: ['tech_modern', 'driving', 'fast', 'rivalry'] },
      { label: 'Horizon Tech Underscore', moods: ['tech_modern', 'storytelling', 'modern', 'warm'] }
    ]
  }),
  buildPresetTracks({
    preset: 'tiktok_viral',
    folderName: 'tiktok_viral',
    defaultVolume: 0.19,
    trackDefs: [
      { label: 'Chill Lo-Fi Hook', moods: ['tiktok_viral', 'casual', 'trending', 'warm'] },
      { label: 'Smooth Viral Groove', moods: ['tiktok_viral', 'trending', 'modern', 'upbeat'] },
      { label: 'Late Night Scroll Beat', moods: ['tiktok_viral', 'night', 'chill', 'storytelling'] },
      { label: 'Sunny Short Beat', moods: ['tiktok_viral', 'upbeat', 'bright', 'fun'] },
      { label: 'Subtle Chill Beat', moods: ['tiktok_viral', 'cool', 'modern', 'rivalry'] },
      { label: 'Curiosity Lo-Fi Keys', moods: ['tiktok_viral', 'curious', 'storytelling', 'casual'] },
      { label: 'Fast Trend Pulse', moods: ['tiktok_viral', 'fast', 'trending', 'energetic'] },
      { label: 'Clean Chill Bed', moods: ['tiktok_viral', 'modern', 'steady', 'cool'] },
      { label: 'Playful Bounce Beat', moods: ['tiktok_viral', 'fun', 'upbeat', 'light'] },
      { label: 'Easy Loop Underscore', moods: ['tiktok_viral', 'calm', 'casual', 'direct'] }
    ]
  }),
  buildPresetTracks({
    preset: 'default',
    folderName: 'default',
    defaultVolume: 0.19,
    trackDefs: [
      { label: 'Warm Acoustic Balance', moods: ['default', 'warm', 'storytelling', 'clear'] },
      { label: 'Soft Everyday Piano', moods: ['default', 'calm', 'educational', 'warm'] },
      { label: 'Gentle Ambient Bed', moods: ['default', 'calm', 'ambient', 'smooth'] },
      { label: 'Easygoing Lo-Fi Pulse', moods: ['default', 'casual', 'modern', 'relaxed'] },
      { label: 'Curious Discovery Keys', moods: ['default', 'curious', 'educational', 'light'] },
      { label: 'Clean Narrative Underscore', moods: ['default', 'storytelling', 'direct', 'steady'] },
      { label: 'Light Uplift Strings', moods: ['default', 'inspiring', 'upbeat', 'warm'] },
      { label: 'Subtle Life & Tech Beat', moods: ['default', 'modern', 'analytical', 'steady'] },
      { label: 'Quiet Evening Pad', moods: ['default', 'night', 'calm', 'reflective'] },
      { label: 'Versatile All-Rounder Bed', moods: ['default', 'versatile', 'clear', 'balanced'] }
    ]
  })
];

const MUSIC_CATALOG = PRESET_DEFINITIONS.reduce((acc, entry) => {
  Object.assign(acc, entry.catalogEntries);
  return acc;
}, {});

const PRESET_MUSIC_POOLS = PRESET_DEFINITIONS.reduce((acc, entry) => {
  const sampleKey = entry.poolKeys[0];
  const presetName = MUSIC_CATALOG[sampleKey]?.fileName?.split('/')[0] || 'default';
  acc[presetName] = entry.poolKeys;
  return acc;
}, {});

// Aliases por si algún preset llega con otro nombre o hacia una carpeta existente
if (!PRESET_MUSIC_POOLS.dark_mystery && PRESET_MUSIC_POOLS.cinematic) {
  PRESET_MUSIC_POOLS.dark_mystery = PRESET_MUSIC_POOLS.cinematic;
}

function pickRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getFallbackTrack() {
  return (
    MUSIC_CATALOG.default_01 ||
    MUSIC_CATALOG.educational_01 ||
    Object.values(MUSIC_CATALOG)[0]
  );
}

function selectTrackForUserAndPreset({
  userId = 'anonymous',
  preset = 'default',
  explicitTrack,
  mood = '',
  tone = ''
}) {
  if (explicitTrack && MUSIC_CATALOG[explicitTrack]) {
    return {
      item: MUSIC_CATALOG[explicitTrack],
      selectionMode: 'explicit_track',
      cycleReset: false
    };
  }

  const poolKeys = PRESET_MUSIC_POOLS[preset] || PRESET_MUSIC_POOLS.default;
  let candidates = poolKeys.map((key) => MUSIC_CATALOG[key]).filter(Boolean);

  if (candidates.length === 0) {
    candidates = [getFallbackTrack()];
  }

  const hint = `${mood} ${tone}`.toLowerCase().trim();
  const moodMatched = hint
    ? candidates.filter((item) =>
        (item.moods || []).some((m) => hint.includes(String(m).toLowerCase()))
      )
    : [];

  const activePool = moodMatched.length > 0 ? moodMatched : candidates;
  const historyKey = `${String(userId || 'anonymous')}:${preset}`;

  let state = USER_PRESET_MUSIC_HISTORY.get(historyKey);
  if (!state) {
    state = { usedKeys: new Set(), lastKey: null };
    USER_PRESET_MUSIC_HISTORY.set(historyKey, state);
  }

  let available = activePool.filter((item) => !state.usedKeys.has(item.key));
  let cycleReset = false;

  // Al completar las pistas disponibles en el ciclo (p.ej. 10/10), resetea para iniciar un nuevo ciclo
  if (available.length === 0) {
    state.usedKeys.clear();
    cycleReset = true;
    available =
      activePool.length > 1
        ? activePool.filter((item) => item.key !== state.lastKey)
        : activePool;
  }

  const chosen = pickRandomItem(available);
  state.usedKeys.add(chosen.key);
  state.lastKey = chosen.key;

  return {
    item: chosen,
    selectionMode: moodMatched.length > 0 ? 'mood_matched_rotation' : 'preset_rotation',
    cycleReset
  };
}

module.exports = {
  MUSIC_CATALOG,
  PRESET_MUSIC_POOLS,
  selectTrackForUserAndPreset,
  getFallbackTrack
};
