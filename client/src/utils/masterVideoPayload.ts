// --- CONTRATO MAESTRO DE VIDEO (MASTER JSON PAYLOAD) ---
// Este archivo centraliza la estructura de datos que se comunica con el LLM, ElevenLabs, APIs Visuales y FFmpeg.

import type { WizardData } from "../components/wizard/WizardStep1";

export type ProductType = "studio_lite" | "director_studio" | "studio_blueprints";
export type UserPlan = "free_trial" | "pay_per_video" | "pro" | "unlimited";

export interface SceneItem {
  sceneNumber: number;
  durationSeconds: number;
  voiceoverText: string;
  visualPrompt: string;
  visualAssetUrl?: string | null;
}

export interface MasterVideoPayload {
  meta: {
    productType: ProductType;
    userId: string;
    userPlan: UserPlan;
    language: "es" | "en";
    createdAt: string;
    status: "draft" | "queued" | "processing" | "completed" | "failed";
  };

  // 1. Inputs directos capturados en el Wizard
  userInputs: {
    mode: "idea" | "script";
    rawContent: string;
    tone: string;
    voiceId: string;
    aspectRatio: string;
    visualStyle: string;
    musicStyle: string;
    subtitlesEnabled: boolean;
  };

  // 2. Instrucciones para el Paso 1: Cerebro LLM
  llmDirective: {
    task: "expand_idea_to_scenes" | "segment_existing_script";
    maxDurationSeconds: number;
    targetLanguage: "es" | "en";
    visualPromptLanguage: "en";
    toneInstruction: string;
    structuredScript?: {
      title: string;
      totalDurationSeconds: number;
      scenes: SceneItem[];
    };
  };

  // 3. Configuración para el Paso 2: API de Voz (ElevenLabs)
  voiceConfig: {
    provider: "elevenlabs";
    voiceId: string;
    outputFormat: "mp3_44100_128";
    stability: number;
    similarityBoost: number;
    generatedAudioUrl?: string | null;
  };

  // 4. Configuración para el Paso 3: API Visual
  visualConfig: {
    aspectRatio: string;
    styleKey: string;
    stylePromptModifier: string;
    watermark: boolean;
  };

  // 5. Configuración para el Paso 4: Música de Fondo
  musicConfig: {
    enabled: boolean;
    styleKey: string;
    volumeDucking: number;
    selectedTrackUrl?: string | null;
  };

  // 6. Configuración para el Paso 5: Subtítulos y Renderizado (FFmpeg)
  subtitlesConfig: {
    enabled: boolean;
    stylePreset: "standard_clean" | "karaoke_dynamic";
    position: "bottom-center";
    burnIn: boolean;
  };
}

const VISUAL_STYLE_MODIFIERS: Record<string, string> = {
  cinematic: "Cinematic lighting, 35mm lens, shallow depth of field, film grain, 8k photorealistic",
  "3d-render": "Pixar and Unreal Engine 5 style 3D render, volumetric lighting, vibrant colors, octane render",
  vector: "Modern flat vector illustration, clean geometric shapes, minimalist editorial motion design",
  anime: "High-budget modern anime aesthetic, Makoto Shinkai inspired lighting, detailed background art",
  photorealistic: "Ultra-realistic commercial studio photography, crisp focus, natural lighting, 8k resolution",
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  professional: "Authoritative, clear, trustworthy, and structured for business or educational retention.",
  casual: "Warm, conversational, relatable, like talking to a close friend.",
  energetic: "Fast-paced, high-energy hooks, punchy short sentences designed for high social media retention.",
  dramatic: "Emotional storytelling, suspenseful pacing, vivid imagery and strong narrative arc.",
};

export function buildMasterVideoPayload(params: {
  wizardData: Partial<WizardData>;
  userId: string;
  userPlan: UserPlan;
  language: "es" | "en";
}): MasterVideoPayload {
  const { wizardData, userId, userPlan, language } = params;
  
  // Regla 1: Definir duración máxima basada en el plan del usuario
  // Free / Trial = 30s max | Lite (Pay-per-video), Pro, Unlimited = 70s max
  const isFreeTier = userPlan === "free_trial";
  const maxDuration = isFreeTier ? 30 : 70;
  const isProTier = userPlan === "pro" || userPlan === "unlimited";

  // Regla 2: Generar un título limpio para el Dashboard basado en la entrada
  const rawText = wizardData.scriptIdea.trim();
  let generatedTitle = language === "en" ? "Untitled Video Project" : "Proyecto de Video sin Título";
  
  if (rawText.length > 0) {
    // Si la frase es corta (modo idea), la usamos limpiándola; si es un guion largo, tomamos las primeras palabras como título
    const cleanSnippet = rawText.split('.')[0].replace(/['"]/g, '');
    generatedTitle = cleanSnippet.length > 40 ? cleanSnippet.substring(0, 37) + '...' : cleanSnippet;
  }

  return {
    meta: {
      productType: "studio_lite",
      userId,
      userPlan,
      language,
      createdAt: new Date().toISOString(),
      status: "queued",
    },

    userInputs: {
      mode: wizardData.mode || "idea",
      rawContent: rawText,
      tone: wizardData.tone,
      voiceId: wizardData.voiceId || "default_voice",
      aspectRatio: wizardData.aspectRatio || "9:16",
      visualStyle: wizardData.visualStyle || "cinematic",
      musicStyle: wizardData.musicStyle || "none",
      subtitlesEnabled: wizardData.subtitles,
    },

    llmDirective: {
      task: wizardData.mode === "script" ? "segment_existing_script" : "expand_idea_to_scenes",
      maxDurationSeconds: maxDuration, // <--- Aplicando la duración dinámica según el plan
      targetLanguage: language,
      visualPromptLanguage: "en",
      toneInstruction: TONE_INSTRUCTIONS[wizardData.tone] || TONE_INSTRUCTIONS.professional,
      structuredScript: {
        title: generatedTitle, // <--- Título limpio para el Dashboard y metadatos
        totalDurationSeconds: maxDuration,
        scenes: [], // Se llenará en el backend mediante el LLM
      },
    },

    voiceConfig: {
      provider: "elevenlabs",
      voiceId: wizardData.voiceId || "default_voice",
      outputFormat: "mp3_44100_128",
      stability: 0.5,
      similarityBoost: 0.75,
    },

    visualConfig: {
      aspectRatio: wizardData.aspectRatio || "9:16",
      styleKey: wizardData.visualStyle,
      stylePromptModifier:
        VISUAL_STYLE_MODIFIERS[wizardData.visualStyle] || VISUAL_STYLE_MODIFIERS.cinematic,
      watermark: isFreeTier, // Marca de agua solo para usuarios en plan Free/Trial
    },

    musicConfig: {
      enabled: wizardData.musicStyle !== "none",
      styleKey: wizardData.musicStyle,
      volumeDucking: 0.15,
    },

    subtitlesConfig: {
      enabled: wizardData.subtitles,
      stylePreset: isProTier ? "karaoke_dynamic" : "standard_clean",
      position: "bottom-center",
      burnIn: true,
    },
  };
}
