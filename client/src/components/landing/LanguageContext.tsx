import React, { createContext, useContext, useState } from "react";

type Language = "en" | "es";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    nav_create: "Create Video Free",
    hero_badge: "Powered by Next-Gen AI",
    hero_title_1: "Create Professional Videos",
    hero_title_2: "in Seconds",
    hero_sub:
      "Transform any idea into ready-to-publish videos for TikTok, Reels, and YouTube with ElevenLabs voices and automated AI rendering.",
    hero_cta: "Start Creating Now",
    showcase_title: "See What You Can Create",
    showcase_sub:
      "Click on any video to reveal its exact AI prompt, voice setup, and configuration.",
    reviews_title: "Loved by Content Creators",
    pricing_title: "Flexible Pricing for Everyone",
    pricing_sub:
      "Choose a monthly subscription or purchase a single-use pass with no commitment.",
    pay_per_video: "Pay-Per-Video Pass",
    pay_per_video_desc: "Perfect for one-off projects. No subscription needed.",
    free_credits: "Includes 1 Free Trial Credit upon signup",
    pricing_no_sub: "No Subscription",
    pricing_per_video: "/ video",
    pricing_feat_1_hd: "1 Full HD Video",
    pricing_feat_elevenlabs: "ElevenLabs voices included",
    pricing_feat_no_watermark: "No watermark export",
    pricing_buy_1_video: "Buy 1 Video",
    pricing_most_popular: "Most Popular",
    pricing_monthly_sub: "Monthly Subscription",
    pricing_per_month: "/ month",
    pricing_pro_desc:
      "For creators and brands publishing weekly content on TikTok and Reels.",
    pricing_feat_15_hd: "15 HD Videos per month",
    pricing_feat_priority: "ElevenLabs priority support",
    pricing_feat_fast_render: "Ultra-fast rendering",
    pricing_feat_all_styles: "Access to all visual styles",
    pricing_try_pro: "Try Pro Plan",
    pricing_free_trial: "Free Trial",
    pricing_feat_free_credit: "1 Free trial credit",
    pricing_feat_all_tools: "Access to all features",
    pricing_feat_no_card: "No credit card required",
    pricing_start_free: "Start Free",
    modal_preview_label: "Preview",
    modal_recipe_badge: "Video Recipe",
    modal_initial_prompt: "Initial Prompt:",
    modal_elevenlabs_voice: "ElevenLabs Voice",
    modal_format: "Format",
    modal_tone: "Tone",
    modal_visual_style: "Visual Style",
    modal_use_style_cta: "Use this style in the Wizard",
    wizard_back_btn: "← Back",
    wizard_step: "Step",
    wizard_of: "of",
    wizard_completed: "Completed",
    summary_live_preview: "Live Preview",
    summary_project_title: "Your Project",
    summary_project_sub: "Summary of your video parameters.",
    summary_concept_label: "Concept",
    summary_undefined: "Undefined...",
    summary_tone_label: "Tone",
    summary_format_label: "Format",
    summary_voice_label: "ElevenLabs Voice",
    summary_unselected: "Unselected",
    summary_style_label: "Visual Style",
    summary_engine_label: "Cempa.ai Engine",
    step1_title: "What is your video about?",
    step1_sub:
      "Describe the core idea or concept. The AI will structure an optimized script for your audience.",
    step1_input_label: "Initial Idea or Script",
    step1_placeholder:
      "E.g., A short video explaining the benefits of our new mobile app for entrepreneurs...",
    step1_tone_label: "Communication Tone",
    step1_next_btn: "Next: Voice and Style",
    step2_title: "Choose your video's voice",
    step2_sub:
      "Select the ElevenLabs-powered AI voice that best matches your brand's personality.",
    step2_back_btn: "← Back",
    step2_next_btn: "Next: Visual Style",
    step3_title: "Visual Style and Format",
    step3_sub:
      "Define the video proportion according to the platform you will publish on and its artistic appearance.",
    step3_orientation_label: "Video Orientation",
    step3_style_label: "AI Rendering Style",
    step3_back_btn: "← Back",
    step3_next_btn: "Next: Final Summary",
    step4_title: "Project Summary",
    step4_sub: "Review that all parameters are correct before activating generation with Artificial Intelligence.",
    step4_concept_label: "Idea / Concept",
    step4_tone_label: "Tone",
    step4_format_label: "Format (Aspect Ratio)",
    step4_voice_label: "ElevenLabs Voice",
    step4_style_label: "Visual Style",
    step4_credits_title: "Estimated cost: 1 AI Credit",
    step4_credits_desc: "The process will take approximately 30 to 60 seconds.",
    step4_success_title: "Your video is being generated!",
    step4_success_sub: "The Cempasúchil AI engine has started rendering. We will notify you as soon as it is ready.",
    step4_create_another_btn: "Create another video",
    step4_back_btn: "← Back",
    step4_generate_btn: "🚀 Generate Video with AI",
    step4_generating_btn: "Generating Video...",
  
  },
  es: {
    nav_create: "Crear Video Gratis",
    hero_badge: "Impulsado por IA de última generación",
    hero_title_1: "Crea videos profesionales",
    hero_title_2: "en cuestión de minutos",
    hero_sub:
      "Transforma cualquier idea en videos optimizados para Reels, TikTok y YouTube con locuciones de ElevenLabs y renderizado inteligente.",
    hero_cta: "Comenzar a Crear Ahora",
    showcase_title: "Descubre lo que puedes crear",
    showcase_sub:
      "Haz clic en cualquier video para ver su receta completa de prompt, voz y configuración de IA.",
    reviews_title: "Lo que dicen nuestros creadores",
    pricing_title: "Planes flexibles a tu medida",
    pricing_sub:
      "Elige una suscripción mensual o compra pases de un solo uso sin compromisos.",
    pay_per_video: "Pago Por Video (Paso Único)",
    pay_per_video_desc:
      "Ideal si solo necesitas un video puntual sin amarrarte a mensualidades.",
    free_credits: "Incluye 1 crédito de prueba gratis al registrarte",
    pricing_no_sub: "Sin Suscripción",
    pricing_per_video: "/ video",
    pricing_feat_1_hd: "1 Video HD completo",
    pricing_feat_elevenlabs: "Voces ElevenLabs incluidas",
    pricing_feat_no_watermark: "Exportación sin marca de agua",
    pricing_buy_1_video: "Comprar 1 Video",
    pricing_most_popular: "Más Popular",
    pricing_monthly_sub: "Suscripción Mensual",
    pricing_per_month: "/ mes",
    pricing_pro_desc:
      "Para creadores y marcas que publican contenido semanalmente en TikTok y Reels.",
    pricing_feat_15_hd: "15 Videos HD al mes",
    pricing_feat_priority: "Soporte prioritario ElevenLabs",
    pricing_feat_fast_render: "Renderizado ultra rápido",
    pricing_feat_all_styles: "Acceso a todos los estilos visuales",
    pricing_try_pro: "Probar Plan Pro",
    pricing_free_trial: "Prueba Gratuita",
    pricing_feat_free_credit: "1 Crédito de prueba gratis",
    pricing_feat_all_tools: "Acceso a todas las herramientas",
    pricing_feat_no_card: "Sin tarjeta de crédito requerida",
    pricing_start_free: "Comenzar Gratis",
    modal_preview_label: "Vista Previa",
    modal_recipe_badge: "Receta del Video",
    modal_initial_prompt: "Prompt Inicial:",
    modal_elevenlabs_voice: "Voz ElevenLabs",
    modal_format: "Formato",
    modal_tone: "Tono",
    modal_visual_style: "Estilo Visual",
    modal_use_style_cta: "Usar este estilo en el Wizard",
    wizard_back_btn: "← Atrás",
    wizard_step: "Paso",
    wizard_of: "de",
    wizard_completed: "Completado",
    summary_live_preview: "Vista Previa en Vivo",
    summary_project_title: "Tu Proyecto",
    summary_project_sub: "Resumen de los parámetros de tu video.",
    summary_concept_label: "Concepto",
    summary_undefined: "Sin definir...",
    summary_tone_label: "Tono",
    summary_format_label: "Formato",
    summary_voice_label: "Locutor ElevenLabs",
    summary_unselected: "No seleccionada",
    summary_style_label: "Estilo Visual",
    summary_engine_label: "Motor de Cempa.ai",
    step1_title: "¿De qué tratará tu video?",
    step1_sub:
      "Describe la idea o concepto principal. La IA estructurará el guion optimizado para tu audiencia.",
    step1_input_label: "Idea o Guion Inicial",
    step1_placeholder:
      "Ej. Un video corto explicando las ventajas de nuestra nueva aplicación móvil para emprendedores...",
    step1_tone_label: "Tono de Comunicación",
    step1_next_btn: "Siguiente: Voz y Estilo",
    step2_title: "Elige la voz de tu video",
    step2_sub:
      "Selecciona la locución de IA impulsada por ElevenLabs que mejor se adapte a la personalidad de tu marca.",
    step2_back_btn: "← Regresar",
    step2_next_btn: "Siguiente: Estilo Visual",
    step3_title: "Estilo Visual y Formato",
    step3_sub:
      "Define la proporción del video según la plataforma donde lo vas a publicar y su apariencia artística.",
    step3_orientation_label: "Orientación del Video",
    step3_style_label: "Estilo de Renderizado IA",
    step3_back_btn: "← Regresar",
    step3_next_btn: "Siguiente: Resumen Final",
    step4_title: "Resumen de tu proyecto",
    step4_sub: "Revisa que todos los parámetros sean correctos antes de activar la generación con Inteligencia Artificial.",
    step4_concept_label: "Idea / Concepto",
    step4_tone_label: "Tono",
    step4_format_label: "Formato (Aspect Ratio)",
    step4_voice_label: "Locutor ElevenLabs",
    step4_style_label: "Estilo Visual",
    step4_credits_title: "Costo estimado: 1 Crédito de IA",
    step4_credits_desc: "El proceso tomará aproximadamente entre 30 y 60 segundos.",
    step4_success_title: "¡Tu video se está generando!",
    step4_success_sub: "El motor de Cempasúchil IA ha comenzado el renderizado. Te avisaremos en cuanto esté listo.",
    step4_create_another_btn: "Crear otro video",
    step4_back_btn: "← Regresar",
    step4_generate_btn: "🚀 Generar Video con IA",
    step4_generating_btn: "Generando Video...",
  
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Configurado para iniciar por defecto en inglés ('en') enfocado al mercado US
  const [lang, setLang] = useState<Language>("en");

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
