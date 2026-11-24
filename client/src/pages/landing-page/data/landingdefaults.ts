import {
  type FeatureItem,
  type TestimonialItem,
  type PricingPlanItem,
  type FaqItem,
} from '../../../types/landing';

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 'dual-mode',
    title: {
      en: 'Dual-Mode Warm & Carbon Contrast',
      es: 'Contraste Dual Cálido y Carbón',
    },
    description: {
      en: 'Switch seamlessly between warm sand surfaces and rich carbon panels with cempasúchil accents.',
      es: 'Alterna entre superficies arena cálidas y paneles carbón con acentos cempasúchil.',
    },
    badge: { en: 'UI System', es: 'Sistema UI' },
  },
  {
    id: 'cursor-focus',
    title: {
      en: 'High-Visibility Prompt Focus',
      es: 'Foco de Prompt de Alta Visibilidad',
    },
    description: {
      en: 'Elevated input surfaces and marigold caret indicators ensure you never lose where to type.',
      es: 'Superficies elevadas y cursor cempasúchil visible para saber siempre dónde escribir.',
    },
    badge: { en: 'UX', es: 'UX' },
  },
  {
    id: 'dynamic-sections',
    title: {
      en: 'Control-Panel Driven Sections',
      es: 'Secciones Controladas desde Panel',
    },
    description: {
      en: 'Enable, reorder, or update reviews, pricing, and FAQs dynamically without editing JSX.',
      es: 'Activa, reordena o actualiza reseñas, precios y preguntas desde el panel sin tocar código.',
    },
    badge: { en: 'CMS Ready', es: 'Dinámico' },
  },
];

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'rev-1',
    author: 'María G.',
    role: { en: 'Content Creator', es: 'Creadora de Contenido' },
    quote: {
      en: 'The prompt workspace is super clear—I immediately know where to write and iterate.',
      es: 'El espacio del prompt es clarísimo; al instante sé dónde escribir e iterar.',
    },
    rating: 5,
    featured: true,
  },
  {
    id: 'rev-2',
    author: 'David K.',
    role: { en: 'Creative Producer', es: 'Productor Creativo' },
    quote: {
      en: 'Warm cempasúchil contrast feels distinct and much easier on the eyes than flat black tools.',
      es: 'El contraste cálido cempasúchil tiene identidad propia y cansa mucho menos que el negro plano.',
    },
    rating: 5,
  },
  {
    id: 'rev-3',
    author: 'Ana R.',
    role: { en: 'Brand Strategist', es: 'Estratega de Marca' },
    quote: {
      en: 'Being able to manage sections and reviews from one place saves hours every week.',
      es: 'Poder administrar secciones y reseñas desde un solo lugar nos ahorra horas cada semana.',
    },
    rating: 5,
  },
];

const DEFAULT_PRICING: PricingPlanItem[] = [
  {
    id: 'free_trial',
    name: { en: 'Free Trial', es: 'Prueba Gratis' },
    priceMonthly: '$0',
    description: {
      en: 'Explore Studio Lite and test your first creative prompts.',
      es: 'Explora Studio Lite y prueba tus primeros prompts creativos.',
    },
    features: [
      { en: 'Studio Lite guided flow', es: 'Flujo guiado Studio Lite' },
      { en: 'Dual-mode workspace', es: 'Espacio de trabajo dual' },
      { en: 'Starter render credits', es: 'Créditos iniciales de render' },
    ],
    ctaLabel: { en: 'Start Free', es: 'Empezar Gratis' },
  },
  {
    id: 'pro',
    name: { en: 'Pro Studio', es: 'Estudio Pro' },
    priceMonthly: '$19',
    description: {
      en: 'Full creative control, priority rendering, and reusable blueprints.',
      es: 'Control creativo total, render prioritario y blueprints reutilizables.',
    },
    features: [
      { en: 'Director Studio & Blueprints', es: 'Director Studio y Blueprints' },
      { en: 'Expanded monthly credits', es: 'Créditos mensuales ampliados' },
      { en: 'High-resolution exports', es: 'Exportaciones en alta resolución' },
    ],
    highlighted: true,
    ctaLabel: { en: 'Upgrade to Pro', es: 'Subir a Pro' },
  },
];

const DEFAULT_FAQ: FaqItem[] = [
  {
    id: 'faq-1',
    question: {
      en: 'Can I switch between light and dark themes?',
      es: '¿Puedo cambiar entre tema claro y oscuro?',
    },
    answer: {
      en: 'Yes. Cempai.ai uses global CSS tokens with warm sand and carbon variants so both modes stay legible.',
      es: 'Sí. Cempai.ai usa variables globales CSS con variantes arena cálida y carbón para mantener legibilidad en ambos modos.',
    },
  },
  {
    id: 'faq-2',
    question: {
      en: 'How does the dynamic landing page work?',
      es: '¿Cómo funciona la landing page dinámica?',
    },
    answer: {
      en: 'Sections and items load from your control panel endpoint with local data defaults as instant fallback.',
      es: 'Las secciones y elementos cargan desde tu endpoint del panel de control usando la data local como respaldo inmediato.',
    },
  },
];

export {
  DEFAULT_FEATURES,
  DEFAULT_TESTIMONIALS,
  DEFAULT_PRICING,
  DEFAULT_FAQ,
};
