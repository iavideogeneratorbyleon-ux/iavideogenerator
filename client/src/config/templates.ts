export interface ScriptTemplateOption {
  id: string;
  type: 'hook' | 'cta';
  category: 'curiosity' | 'pain_point' | 'authority' | 'conversion' | 'engagement';
  label: { en: string; es: string };
  // Para modo "idea" (guía narrativa para la IA)
  aiDirective: { en: string; es: string };
  // Para modo "script" (texto literal que embona con el guion del usuario)
  exactText: { en: string; es: string };
  isProOnly?: boolean;
}

export const SCRIPT_TEMPLATES: ScriptTemplateOption[] = [
  // ==========================================
  // 🎣 HOOKS (GANCHOS INICIALES)
  // ==========================================
  {
    id: 'hook_secret',
    type: 'hook',
    category: 'curiosity',
    label: { en: '🤫 Industry Secret', es: '🤫 Secreto de la Industria' },
    aiDirective: {
      en: 'Start with a bold, intriguing statement revealing a hidden secret about the topic.',
      es: 'Comienza con una afirmación audaz e intrigante revelando un secreto oculto sobre el tema.'
    },
    exactText: {
      en: 'Nobody is talking about this, but it changes everything you know.',
      es: 'Nadie está hablando de esto, pero cambia por completo todo lo que sabías.'
    },
    isProOnly: false
  },
  {
    id: 'hook_mistake',
    type: 'hook',
    category: 'pain_point',
    label: { en: '⚠️ Common Mistake', es: '⚠️ Error Común' },
    aiDirective: {
      en: 'Open by calling out a painful, common mistake the audience makes and promise the fix.',
      es: 'Abre señalando un error común y costoso que comete la audiencia y promete la solución.'
    },
    exactText: {
      en: 'Stop making this huge mistake if you actually want real results!',
      es: '¡Deja de cometer este grave error si realmente quieres ver resultados!'
    },
    isProOnly: false
  },
  {
    id: 'hook_question',
    type: 'hook',
    category: 'engagement',
    label: { en: '❓ Provocative Question', es: '❓ Pregunta Directa' },
    aiDirective: {
      en: 'Start with a sharp, relatable rhetorical question that hooks the viewer immediately.',
      es: 'Empieza con una pregunta retórica directa con la que el espectador se identifique al instante.'
    },
    exactText: {
      en: 'Have you ever wondered why some people achieve this effortlessly while others struggle?',
      es: '¿Alguna vez te has preguntado por qué algunos lo logran sin esfuerzo mientras otros se estancan?'
    },
    isProOnly: false
  },
  {
    id: 'hook_3things',
    type: 'hook',
    category: 'authority',
    label: { en: '🔟 Top 3 Hacks', es: '🔟 Los 3 Mejores Tips' },
    aiDirective: {
      en: 'Frame the video as a fast-paced, high-value list of 3 essential insights.',
      es: 'Enmarca el video como una lista rápida y de alto valor con 3 puntos esenciales.'
    },
    exactText: {
      en: 'Here are 3 things I wish someone had told me before I started.',
      es: 'Aquí tienes 3 cosas que me hubiera gustado que me dijeran antes de empezar.'
    },
    isProOnly: true
  },

  // ==========================================
  // 🎯 CTAs / OUTROS (CIERRES)
  // ==========================================
  {
    id: 'cta_follow',
    type: 'cta',
    category: 'engagement',
    label: { en: '➕ Save & Follow', es: '➕ Guarda y Sígueme' },
    aiDirective: {
      en: 'End by encouraging the viewer to save the video for later and follow the channel.',
      es: 'Termina invitando al espectador a guardar el video para más tarde y seguir la cuenta.'
    },
    exactText: {
      en: 'Save this video so you don’t forget it, and follow for daily insights!',
      es: '¡Guarda este video para no olvidarlo y sígueme para más consejos diarios!'
    },
    isProOnly: false
  },
  {
    id: 'cta_comment',
    type: 'cta',
    category: 'engagement',
    label: { en: '💬 Spark Debate', es: '💬 Abre Debate' },
    aiDirective: {
      en: 'Close with a direct question prompting viewers to share their thoughts in the comments.',
      es: 'Cierra con una pregunta directa invitando a dejar su opinión en los comentarios.'
    },
    exactText: {
      en: 'Do you agree or disagree? Drop your thoughts in the comments below!',
      es: '¿Estás de acuerdo o en desacuerdo? ¡Déjame tu opinión en los comentarios!'
    },
    isProOnly: false
  },
  {
    id: 'cta_link',
    type: 'cta',
    category: 'conversion',
    label: { en: '🔗 Link in Bio', es: '🔗 Enlace en Bio' },
    aiDirective: {
      en: 'Finish with a strong, urgent call-to-action directing viewers to the link in bio.',
      es: 'Finaliza con una llamada a la acción persuasiva dirigiendo al enlace de la biografía.'
    },
    exactText: {
      en: 'Ready to take the next step? Tap the link in our bio to get started today.',
      es: '¿Listo para dar el siguiente paso? Toca el enlace en nuestra bio para empezar hoy.'
    },
    isProOnly: true
  }
];
