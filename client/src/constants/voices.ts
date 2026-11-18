export interface VoiceOption {
  id: string;               // ID amigable para el Wizard (ej: 'en_adam', 'es_carlos')
  originalVoiceId: string;  // El voiceId real y exacto de ElevenLabs
  name: string;             // Nombre amigable en la UI
  originalName: string;     // Nombre original en ElevenLabs
  language: 'en' | 'es' | 'multilingual'; // Idioma principal de la voz
  gender: 'male' | 'female';
  tone: 'Cálida' | 'Corporativa' | 'Narrativa' | 'Energética' | 'Dinámica' | 'Autoritaria' | 'Casual';
  accent: string;           // Ejemplo: 'American', 'British', 'Latam', 'Spain', 'Neutral'
  description: string;
  isProOnly: boolean;
}

export const STUDIO_LITE_VOICES: VoiceOption[] = [
  // =========================================
  // 🇺🇸 ENGLISH VOICES (~20 opciones clave)
  // =========================================
  {
    id: 'en_adam',
    originalVoiceId: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    originalName: 'Adam (Deep & Engaging)',
    language: 'en',
    gender: 'male',
    tone: 'Narrativa',
    accent: 'American',
    description: 'Deep, steady, and captivating voice, excellent for storytelling and documentaries.',
    isProOnly: false
  },
  {
    id: 'en_rachel',
    originalVoiceId: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    originalName: 'Rachel (Calm & Clear)',
    language: 'en',
    gender: 'female',
    tone: 'Cálida',
    accent: 'American',
    description: 'Smooth, professional, and friendly. Perfect for commercial explainers and tutorials.',
    isProOnly: false
  },
  {
    id: 'en_antony',
    originalVoiceId: 'ErXwobaYiN019PkySvjV',
    name: 'Antony',
    originalName: 'Antony (Confident)',
    language: 'en',
    gender: 'male',
    tone: 'Corporativa',
    accent: 'British',
    description: 'Sophisticated British accent, authoritative and clear for corporate branding.',
    isProOnly: false
  },
  {
    id: 'en_josh',
    originalVoiceId: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    originalName: 'Josh (Deep & Casual)',
    language: 'en',
    gender: 'male',
    tone: 'Casual',
    accent: 'American',
    description: 'Relaxed and relatable, great for podcast style and social media content.',
    isProOnly: false
  },
  {
    id: 'en_bella',
    originalVoiceId: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    originalName: 'Bella (Soft & Expressive)',
    language: 'en',
    gender: 'female',
    tone: 'Dinámica',
    accent: 'American',
    description: 'Youthful and energetic tone, fantastic for TikTok and high-retention Reels.',
    isProOnly: false
  },
  // ... Puedes agregar más voces en inglés hasta llegar a las 20 deseadas ...

  // =========================================
  // 🇪🇸 ESPAÑOL VOICES (~20 opciones clave)
  // =========================================
  {
    id: 'es_carlos',
    originalVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Mapeado a multilingüe compatible
    name: 'Carlos',
    originalName: 'Antony (Multilingual Span)',
    language: 'es',
    gender: 'male',
    tone: 'Cálida',
    accent: 'Español Neutral',
    description: 'Voz profunda y cercana, ideal para reflexiones, historias y storytelling.',
    isProOnly: false
  },
  {
    id: 'es_sofia',
    originalVoiceId: '21m00Tcm4TlvDq8ikWAM',
    name: 'Sofía',
    originalName: 'Rachel (Multilingual Latam)',
    language: 'es',
    gender: 'female',
    tone: 'Dinámica',
    accent: 'Español Latino',
    description: 'Voz fresca, enérgica y moderna, perfecta para TikToks, Reels y marketing.',
    isProOnly: false
  },
  {
    id: 'es_mateo',
    originalVoiceId: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Mateo',
    originalName: 'Domi (Spain Accent)',
    language: 'es',
    gender: 'male',
    tone: 'Energética',
    accent: 'Español de España',
    description: 'Ritmo ágil y tono persuasivo para contenido educativo y llamadas a la acción.',
    isProOnly: false
  },
  {
    id: 'es_valeria',
    originalVoiceId: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Valeria',
    originalName: 'Elli (Soft & Elegant)',
    language: 'es',
    gender: 'female',
    tone: 'Narrativa',
    accent: 'Español Neutral',
    description: 'Suave, pausada y muy elegante, excelente para contenido poético o documental.',
    isProOnly: false
  },
  {
    id: 'es_alejandro',
    originalVoiceId: 'ErXwobaYiN019PkySvjV',
    name: 'Alejandro',
    originalName: 'Antoni (Corporate)',
    language: 'es',
    gender: 'male',
    tone: 'Corporativa',
    accent: 'Español Latino',
    description: 'Tono profesional, claro y confiable para marcas y presentaciones comerciales.',
    isProOnly: false
  },
  // ... Puedes agregar más voces en español hasta completar las 20 ...
];
