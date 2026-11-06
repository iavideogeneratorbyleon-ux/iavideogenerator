import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'es';

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
    hero_sub: "Transform any idea into ready-to-publish videos for TikTok, Reels, and YouTube with ElevenLabs voices and automated AI rendering.",
    hero_cta: "Start Creating Now",
    showcase_title: "See What You Can Create",
    showcase_sub: "Click on any video to reveal its exact AI prompt, voice setup, and configuration.",
    reviews_title: "Loved by Content Creators",
    pricing_title: "Flexible Pricing for Everyone",
    pricing_sub: "Choose a monthly subscription or purchase a single-use pass with no commitment.",
    pay_per_video: "Pay-Per-Video Pass",
    pay_per_video_desc: "Perfect for one-off projects. No subscription needed.",
    free_credits: "Includes 1 Free Trial Credit upon signup",
  },
  es: {
    nav_create: "Crear Video Gratis",
    hero_badge: "Impulsado por IA de última generación",
    hero_title_1: "Crea videos profesionales",
    hero_title_2: "en cuestión de minutos",
    hero_sub: "Transforma cualquier idea en videos optimizados para Reels, TikTok y YouTube con locuciones de ElevenLabs y renderizado inteligente.",
    hero_cta: "Comenzar a Crear Ahora",
    showcase_title: "Descubre lo que puedes crear",
    showcase_sub: "Haz clic en cualquier video para ver su receta completa de prompt, voz y configuración de IA.",
    reviews_title: "Lo que dicen nuestros creadores",
    pricing_title: "Planes flexibles a tu medida",
    pricing_sub: "Elige una suscripción mensual o compra pases de un solo uso sin compromisos.",
    pay_per_video: "Pago Por Video (Paso Único)",
    pay_per_video_desc: "Ideal si solo necesitas un video puntual sin amarrarte a mensualidades.",
    free_credits: "Incluye 1 crédito de prueba gratis al registrarte",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detecta el idioma del navegador por defecto (prioriza 'en' para mercado US)
  const defaultLang: Language = navigator.language.startsWith('es') ? 'es' : 'en';
  const [lang, setLang] = useState<Language>(defaultLang);

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
