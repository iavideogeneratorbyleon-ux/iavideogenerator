export interface VoiceOption {
  id: string;               // ID clave del catálogo (ej: 'en_voice_1', 'es_voice_1')
  originalVoiceId: string;  // El voiceId real y exacto de ElevenLabs
  name: string;             // Nombre amigable en la UI
  originalName: string;     // Nombre original / perfil en ElevenLabs
  language: 'en' | 'es' | 'multilingual';
  gender: 'male' | 'female';
  tone: 'Cálida' | 'Corporativa' | 'Narrativa' | 'Energética' | 'Dinámica' | 'Autoritaria' | 'Casual';
  accent: string;
  description: string;
  isProOnly: boolean;
}

export const STUDIO_LITE_VOICES: VoiceOption[] = [
  // =========================================
  // 🇺🇸 ENGLISH VOICES (en_voice_1 .. en_voice_6)
  // =========================================
  {
    id: 'en_voice_1',
    originalVoiceId: 'FSZ4QLofSALZxepAyq63',
    name: 'Liam',
    originalName: 'en_voice_1 (flexible_dynamic)',
    language: 'en',
    gender: 'male',
    tone: 'Dinámica',
    accent: 'en',
    description: 'Dynamic, adaptable voice for high-retention short videos and general narration.',
    isProOnly: false
  },
  {
    id: 'en_voice_2',
    originalVoiceId: 'MClEFoImJXBTgLwdLI5n',
    name: 'Ivy',
    originalName: 'en_voice_2 (flexible_conversational)',
    language: 'en',
    gender: 'female',
    tone: 'Casual',
    accent: 'en',
    description: 'Natural, conversational delivery suited for relatable stories and social content.',
    isProOnly: false
  },
  {
    id: 'en_voice_3',
    originalVoiceId: 'gSaBu1pZi4Eb56QGbOoS',
    name: 'David',
    originalName: 'en_voice_3 (flexible_clear)',
    language: 'en',
    gender: 'male',
    tone: 'Corporativa',
    accent: 'en',
    description: 'Clear, steady voice ideal for explainers, educational topics, and clean pacing.',
    isProOnly: false
  },
  {
    id: 'en_voice_4',
    originalVoiceId: 'iq1GS1mcjc63xtqTrsFh',
    name: 'Piksel',
    originalName: 'en_voice_4 (flexible_narrative)',
    language: 'en',
    gender: 'male',
    tone: 'Narrativa',
    accent: 'en',
    description: 'Expressive narrative voice with strong presence across dramatic and story presets.',
    isProOnly: true
  },
  {
    id: 'en_voice_5',
    originalVoiceId: 'lJ00RZOOoE490i3hnZDL',
    name: 'Stu G',
    originalName: 'en_voice_5 (flexible_polished)',
    language: 'en',
    gender: 'male',
    tone: 'Autoritaria',
    accent: 'en',
    description: 'Polished, confident delivery built for brand, luxury, and structured scripts.',
    isProOnly: true
  },
  {
    id: 'en_voice_6',
    originalVoiceId: 'SQQyvkXssth4s6HD2OuR',
    name: 'Belle B',
    originalName: 'en_voice_6 (flexible_warm)',
    language: 'en',
    gender: 'female',
    tone: 'Cálida',
    accent: 'en',
    description: 'Warm, engaging tone that adapts smoothly to emotional, editorial, or upbeat pacing.',
    isProOnly: true
  },

  // =========================================
  // 🇪🇸 ESPAÑOL VOICES (es_voice_1 .. es_voice_6)
  // =========================================
  {
    id: 'es_voice_1',
    originalVoiceId: 'QmPfzE500cXXHM9uQKGc',
    name: 'Issac',
    originalName: 'es_voice_1 (flexible_dynamic)',
    language: 'es',
    gender: 'male',
    tone: 'Dinámica',
    accent: 'es',
    description: 'Voz dinámica y versátil para historias rápidas, redes sociales y narración general.',
    isProOnly: false
  },
  {
    id: 'es_voice_2',
    originalVoiceId: 'p5EUznrYaWnafKvUkNiR',
    name: 'Gaby',
    originalName: 'es_voice_2 (flexible_conversational)',
    language: 'es',
    gender: 'female',
    tone: 'Casual',
    accent: 'es',
    description: 'Tono cercano y conversacional, ideal para contenido directo y natural.',
    isProOnly: false
  },
  {
    id: 'es_voice_3',
    originalVoiceId: 'htFfPSZGJwjBv1CL0aMD',
    name: 'Atonio',
    originalName: 'es_voice_3 (flexible_clear)',
    language: 'es',
    gender: 'male',
    tone: 'Corporativa',
    accent: 'es',
    description: 'Dicción clara y firme para explicaciones, temas educativos y guiones informativos.',
    isProOnly: false
  },
  {
    id: 'es_voice_4',
    originalVoiceId: 'p1Q3ihQuPjyyENa1RGtl',
    name: 'Tom',
    originalName: 'es_voice_4 (flexible_narrative)',
    language: 'es',
    gender: 'male',
    tone: 'Narrativa',
    accent: 'es',
    description: 'Voz narrativa con matices marcados para suspenso, cine o relatos de largo aliento.',
    isProOnly: true
  },
  {
    id: 'es_voice_5',
    originalVoiceId: 'dQ0C8BEdKF2odmELvNee',
    name: 'David',
    originalName: 'es_voice_5 (flexible_polished)',
    language: 'es',
    gender: 'male',
    tone: 'Autoritaria',
    accent: 'es',
    description: 'Acabado pulido y seguro para marcas, presentaciones y piezas de alto impacto.',
    isProOnly: true
  },
  {
    id: 'es_voice_6',
    originalVoiceId: 'kcQkGnn0HAT2JRDQ4Ljp',
    name: 'Norah',
    originalName: 'es_voice_6 (flexible_warm)',
    language: 'es',
    gender: 'female',
    tone: 'Cálida',
    accent: 'es',
    description: 'Voz cálida y expresiva que se adapta bien a distintos ritmos y estilos de preset.',
    isProOnly: true
  }
];
