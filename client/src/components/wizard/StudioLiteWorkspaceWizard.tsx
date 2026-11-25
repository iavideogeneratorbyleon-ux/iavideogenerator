import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslations';
import { TermsModal, type LegalDocType } from '../terms-modal/TermsModal';
import WizardContainer, { type WizardStepNumber } from './WizardContainer';
import WizardProcessingStep from './WizardProcessingStep';
import WizardStep1 from './WizardStep1';
import WizardStep2 from './WizardStep2';
import WizardStep3 from './WizardStep3';
import WizardStep4 from './WizardStep4';
import WizardStep5 from './WizardStep5';
import {
  getOptionAccessState,
  getPlanWizardPolicy,
  normalizePlanTier,
  type AllowedDurationSec,
  type PlanTier,
} from './wizardPlanConfig';
import {
  clearWizardStorage,
  loadWizardState,
  saveWizardState,
  type PersistedWizardState,
  type StudioLiteDraft,
  type WizardAspectRatio,
  type WizardInputMode,
} from './wizardStorage';
import styles from './StudioLiteWorkspaceWizard.module.css';

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || 'http://localhost:3030';

const PIPELINE_ENDPOINT =
  import.meta.env?.VITE_PIPELINE_ENDPOINT ||
  '/api/pipeline/generate-video-project';

interface StudioLiteWorkspaceWizardProps {
  initialPrompt?: string;
  onRequireAuth?: (draft: StudioLiteDraft) => void;
  onGenerationCompleted?: (result: {
    title: string;
    prompt: string;
    presetId: string;
    styleFormatId: string;
    aspectRatio: string;
    resolution: string;
    durationSec: number;
    voice: string;
    subtitlesEnabled?: boolean;
    subtitleStyle?: string;
    creditsRemaining?: number;
  }) => void;
  onBackToDashboard?: () => void;
}

export interface PresetOptionItem {
  id: string;
  badge: { en: string; es: string };
  label: { en: string; es: string };
  description: { en: string; es: string };
  isPaidOnly?: boolean;
}

export interface VisualFormatItem {
  id: string;
  badge: { en: string; es: string };
  label: { en: string; es: string };
  description: { en: string; es: string };
  isPaidOnly?: boolean;
}

export interface VoiceOptionItem {
  id: string;
  voiceId: string;
  voiceName: string;
  language: 'es' | 'en';
  profile: string;
  tier: 'free' | 'pro';
  label: { en: string; es: string };
}

export interface SubtitleStyleOptionItem {
  id: string;
  fontFamily: string;
  label: { en: string; es: string };
  description: { en: string; es: string };
}

export const SUBTITLE_STYLE_OPTIONS: SubtitleStyleOptionItem[] = [
  {
    id: 'auto',
    fontFamily: 'Preset Default',
    label: { en: 'Match Preset Style', es: 'Según Preset (Automático)' },
    description: {
      en: 'Uses the subtitle typography and styling mapped to the selected preset.',
      es: 'Usa la tipografía y estilo de subtítulos asignados al preset elegido.',
    },
  },
  {
    id: 'standard_enhanced',
    fontFamily: 'Inter',
    label: { en: 'Standard Enhanced (Inter)', es: 'Estándar Mejorado (Inter)' },
    description: {
      en: 'Clean high-contrast subtitles with balanced line spacing.',
      es: 'Subtítulos limpios de alto contraste con espaciado equilibrado.',
    },
  },
  {
    id: 'educational_clarity',
    fontFamily: 'Plus Jakarta Sans',
    label: { en: 'Educational Clarity (Plus Jakarta Sans)', es: 'Claridad Educativa (Plus Jakarta Sans)' },
    description: {
      en: 'Crisp, legible captions suited for tutorials and explainers.',
      es: 'Subtítulos nítidos y legibles ideales para tutoriales y explicaciones.',
    },
  },
  {
    id: 'minimalist_editorial',
    fontFamily: 'Inter',
    label: { en: 'Minimalist Editorial (Inter)', es: 'Editorial Minimalista (Inter)' },
    description: {
      en: 'Subtle, refined editorial captions with wider line spacing.',
      es: 'Subtítulos sobrios y editoriales con mayor interlineado.',
    },
  },
  {
    id: 'documentary_clean',
    fontFamily: 'Source Sans 3',
    label: { en: 'Documentary Clean (Source Sans 3)', es: 'Documental Limpio (Source Sans 3)' },
    description: {
      en: 'Neutral, journalistic captions for non-fiction storytelling.',
      es: 'Subtítulos neutros y claros para narrativa documental.',
    },
  },
  {
    id: 'cinematic_film',
    fontFamily: 'Cormorant Garamond',
    label: { en: 'Cinematic Film (Cormorant Garamond)', es: 'Cine Cinematográfico (Cormorant Garamond)' },
    description: {
      en: 'Warm theatrical serif captions with subtle dark outline.',
      es: 'Subtítulos con serifa cinematográfica y contorno suave.',
    },
  },
  {
    id: 'netflix_series',
    fontFamily: 'Bebas Neue',
    label: { en: 'Series Docuseries (Bebas Neue)', es: 'Docuserie (Bebas Neue)' },
    description: {
      en: 'Condensed uppercase display captions inspired by streaming series.',
      es: 'Subtítulos condensados en mayúsculas estilo docuserie.',
    },
  },
  {
    id: 'luxury_champagne',
    fontFamily: 'Playfair Display',
    label: { en: 'Luxury Champagne (Playfair Display)', es: 'Lujo Champagne (Playfair Display)' },
    description: {
      en: 'Champagne-toned editorial serif captions for premium brands.',
      es: 'Subtítulos con serifa en tono champagne para marcas premium.',
    },
  },
  {
    id: 'tech_cyan_sharp',
    fontFamily: 'Space Grotesk',
    label: { en: 'Tech Cyan Sharp (Space Grotesk)', es: 'Tech Cian Nítido (Space Grotesk)' },
    description: {
      en: 'Modern geometric captions with cyan tint for tech topics.',
      es: 'Subtítulos geométricos modernos con tono cian para tecnología.',
    },
  },
  {
    id: 'viral_punch',
    fontFamily: 'Montserrat',
    label: { en: 'Viral Punch (Montserrat)', es: 'Impacto Viral (Montserrat)' },
    description: {
      en: 'Bold, high-impact captions built for short-form retention.',
      es: 'Subtítulos llamativos pensados para retención en formato corto.',
    },
  },
  {
    id: 'mr_beast_bold',
    fontFamily: 'Anton',
    label: { en: 'Bold Yellow Display (Anton)', es: 'Impacto Amarillo (Anton)' },
    description: {
      en: 'Heavy condensed yellow display captions with strong outline.',
      es: 'Subtítulos condensados en amarillo intenso con contorno marcado.',
    },
  },
  {
    id: 'mystery_cinema',
    fontFamily: 'Cinzel',
    label: { en: 'Mystery Cinema (Cinzel)', es: 'Misterio Cinematográfico (Cinzel)' },
    description: {
      en: 'Atmospheric serif captions for suspense and mystery narratives.',
      es: 'Subtítulos atmosféricos para historias de suspenso y misterio.',
    },
  },
];

export const PRESET_OPTIONS: PresetOptionItem[] = [
  {
    id: 'default',
    badge: { en: 'Free Trial', es: 'Prueba Gratis' },
    label: { en: 'default', es: 'default' },
    description: {
      en: 'Default balanced pacing and voice delivery (speed 0.98, stability 0.48).',
      es: 'Ritmo base equilibrado y locución estable (velocidad 0.98, estabilidad 0.48).',
    },
  },
  {
    id: 'educational',
    badge: { en: 'Free Trial', es: 'Prueba Gratis' },
    label: { en: 'educational', es: 'educational' },
    description: {
      en: 'Clear, articulate teaching delivery (speed 0.97, stability 0.56).',
      es: 'Locución clara y articulada para explicar (velocidad 0.97, estabilidad 0.56).',
    },
  },
  {
    id: 'minimalist',
    badge: { en: 'Free Trial', es: 'Prueba Gratis' },
    label: { en: 'minimalist', es: 'minimalist' },
    description: {
      en: 'Calm, unhurried rhythm with low style variation (speed 0.96, stability 0.55).',
      es: 'Ritmo sereno y pausado con variación baja (velocidad 0.96, estabilidad 0.55).',
    },
  },
  {
    id: 'documentary',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'documentary', es: 'documentary' },
    description: {
      en: 'Investigative, grounded narrative pacing (speed 0.95, stability 0.52).',
      es: 'Ritmo narrativo documental e investigativo (velocidad 0.95, estabilidad 0.52).',
    },
    isPaidOnly: true,
  },
  {
    id: 'cinematic',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'cinematic', es: 'cinematic' },
    description: {
      en: 'Dramatic, atmospheric delivery with expressive style (speed 0.96, stability 0.43).',
      es: 'Entrega dramática y atmosférica con mayor expresividad (velocidad 0.96, estabilidad 0.43).',
    },
    isPaidOnly: true,
  },
  {
    id: 'tiktok_viral',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'tiktok_viral', es: 'tiktok_viral' },
    description: {
      en: 'Upbeat, conversational short-form pacing (speed 1.04, stability 0.43).',
      es: 'Ritmo ágil y conversacional para formato corto (velocidad 1.04, estabilidad 0.43).',
    },
    isPaidOnly: true,
  },
  {
    id: 'mr_beast',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'mr_beast', es: 'mr_beast' },
    description: {
      en: 'High-energy, punchy delivery with fast momentum (speed 1.06, stability 0.42).',
      es: 'Entrega de alta energía y ritmo acelerado (velocidad 1.06, estabilidad 0.42).',
    },
    isPaidOnly: true,
  },
  {
    id: 'netflix',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'netflix', es: 'netflix' },
    description: {
      en: 'Series docuseries pacing with hooked transitions (speed 0.97, stability 0.44).',
      es: 'Ritmo de docuserie con transiciones envolventes (velocidad 0.97, estabilidad 0.44).',
    },
    isPaidOnly: true,
  },
  {
    id: 'luxury_brand',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'luxury_brand', es: 'luxury_brand' },
    description: {
      en: 'Refined, poised brand tone (speed 0.94, stability 0.54).',
      es: 'Tono refinado y pausado para marca (velocidad 0.94, estabilidad 0.54).',
    },
    isPaidOnly: true,
  },
  {
    id: 'tech_modern',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'tech_modern', es: 'tech_modern' },
    description: {
      en: 'Crisp, forward-looking technical pacing (speed 1.01, stability 0.50).',
      es: 'Ritmo técnico claro y directo (velocidad 1.01, estabilidad 0.50).',
    },
    isPaidOnly: true,
  },
  {
    id: 'dark_mystery',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'dark_mystery', es: 'dark_mystery' },
    description: {
      en: 'Low, suspenseful narration with deliberate pauses (speed 0.96, stability 0.39).',
      es: 'Narración grave y de suspenso con pausas marcadas (velocidad 0.96, estabilidad 0.39).',
    },
    isPaidOnly: true,
  },
];

export const VISUAL_FORMATS: VisualFormatItem[] = [
  {
    id: 'realistic',
    badge: { en: 'Free Trial', es: 'Prueba Gratis' },
    label: { en: 'Realistic', es: 'Realistic' },
    description: {
      en: 'Photorealistic cinematic live-action photography, natural textures, authentic lighting.',
      es: 'Fotografía fotorrealista, texturas naturales e iluminación auténtica.',
    },
  },
  {
    id: 'minimalist_flat',
    badge: { en: 'Free Trial', es: 'Prueba Gratis' },
    label: { en: 'Minimalist Editorial', es: 'Minimalist Editorial' },
    description: {
      en: 'Clean minimalist visual composition, uncluttered framing, refined studio lighting.',
      es: 'Composición minimalista limpia, encuadre despejado e iluminación de estudio.',
    },
  },
  {
    id: 'comic',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'Comic', es: 'Comic' },
    description: {
      en: 'Graphic novel comic art style, bold ink outlines, halftone shading.',
      es: 'Estilo cómic con contornos de tinta marcados y sombreado de semitonos.',
    },
    isPaidOnly: true,
  },
  {
    id: '3d_render',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: '3D Render', es: '3D Render' },
    description: {
      en: 'High-detail 3D CGI render, subsurface scattering, studio and volumetric lighting.',
      es: 'Render 3D detallado con iluminación volumétrica y profundidad.',
    },
    isPaidOnly: true,
  },
  {
    id: 'cinematic_film',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'Cinematic Film', es: 'Cinematic Film' },
    description: {
      en: 'Feature film cinematography, rich color grading, subtle lens flare, shallow depth of field.',
      es: 'Cinematografía de cine, gradación de color y profundidad de campo.',
    },
    isPaidOnly: true,
  },
  {
    id: 'anime',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'Anime', es: 'Anime' },
    description: {
      en: 'High-craft Japanese anime illustration style, expressive lighting, clean linework.',
      es: 'Ilustración estilo anime japonés con iluminación expresiva y línea limpia.',
    },
    isPaidOnly: true,
  },
  {
    id: 'retro_vintage',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'Retro Vintage', es: 'Retro Vintage' },
    description: {
      en: 'Vintage analog aesthetic, warm faded film tones, subtle grain, nostalgic lighting.',
      es: 'Estética analógica vintage con tonos cálidos, grano sutil y luz nostálgica.',
    },
    isPaidOnly: true,
  },
  {
    id: 'surreal_editorial',
    badge: { en: 'Plan+', es: 'Plan+' },
    label: { en: 'Surreal Editorial', es: 'Surreal Editorial' },
    description: {
      en: 'Surrealist editorial art direction, imaginative composition, dramatic contrast.',
      es: 'Dirección artística surrealista con composición imaginativa y contraste.',
    },
    isPaidOnly: true,
  },
];

export const VOICE_OPTIONS: VoiceOptionItem[] = [
  {
    id: 'es_voice_1',
    voiceId: 'QmPfzE500cXXHM9uQKGc',
    voiceName: 'Issac',
    language: 'es',
    profile: 'flexible_dynamic',
    tier: 'free',
    label: {
      en: 'Issac · es_voice_1 (ES · Free)',
      es: 'Issac · es_voice_1 (ES · Gratis)',
    },
  },
  {
    id: 'es_voice_2',
    voiceId: 'p5EUznrYaWnafKvUkNiR',
    voiceName: 'Gaby',
    language: 'es',
    profile: 'flexible_conversational',
    tier: 'free',
    label: {
      en: 'Gaby · es_voice_2 (ES · Free)',
      es: 'Gaby · es_voice_2 (ES · Gratis)',
    },
  },
  {
    id: 'es_voice_3',
    voiceId: 'htFfPSZGJwjBv1CL0aMD',
    voiceName: 'Atonio',
    language: 'es',
    profile: 'flexible_clear',
    tier: 'free',
    label: {
      en: 'Atonio · es_voice_3 (ES · Free)',
      es: 'Atonio · es_voice_3 (ES · Gratis)',
    },
  },
  {
    id: 'es_voice_4',
    voiceId: 'p1Q3ihQuPjyyENa1RGtl',
    voiceName: 'Tom',
    language: 'es',
    profile: 'flexible_narrative',
    tier: 'pro',
    label: {
      en: 'Tom · es_voice_4 (ES · Pro)',
      es: 'Tom · es_voice_4 (ES · Pro)',
    },
  },
  {
    id: 'es_voice_5',
    voiceId: 'dQ0C8BEdKF2odmELvNee',
    voiceName: 'David',
    language: 'es',
    profile: 'flexible_polished',
    tier: 'pro',
    label: {
      en: 'David · es_voice_5 (ES · Pro)',
      es: 'David · es_voice_5 (ES · Pro)',
    },
  },
  {
    id: 'es_voice_6',
    voiceId: 'kcQkGnn0HAT2JRDQ4Ljp',
    voiceName: 'Norah',
    language: 'es',
    profile: 'flexible_warm',
    tier: 'pro',
    label: {
      en: 'Norah · es_voice_6 (ES · Pro)',
      es: 'Norah · es_voice_6 (ES · Pro)',
    },
  },
  {
    id: 'en_voice_1',
    voiceId: 'FSZ4QLofSALZxepAyq63',
    voiceName: 'Liam',
    language: 'en',
    profile: 'flexible_dynamic',
    tier: 'free',
    label: {
      en: 'Liam · en_voice_1 (EN · Free)',
      es: 'Liam · en_voice_1 (EN · Gratis)',
    },
  },
  {
    id: 'en_voice_2',
    voiceId: 'MClEFoImJXBTgLwdLI5n',
    voiceName: 'Ivy',
    language: 'en',
    profile: 'flexible_conversational',
    tier: 'free',
    label: {
      en: 'Ivy · en_voice_2 (EN · Free)',
      es: 'Ivy · en_voice_2 (EN · Gratis)',
    },
  },
  {
    id: 'en_voice_3',
    voiceId: 'gSaBu1pZi4Eb56QGbOoS',
    voiceName: 'David',
    language: 'en',
    profile: 'flexible_clear',
    tier: 'free',
    label: {
      en: 'David · en_voice_3 (EN · Free)',
      es: 'David · en_voice_3 (EN · Gratis)',
    },
  },
  {
    id: 'en_voice_4',
    voiceId: 'iq1GS1mcjc63xtqTrsFh',
    voiceName: 'Piksel',
    language: 'en',
    profile: 'flexible_narrative',
    tier: 'pro',
    label: {
      en: 'Piksel · en_voice_4 (EN · Pro)',
      es: 'Piksel · en_voice_4 (EN · Pro)',
    },
  },
  {
    id: 'en_voice_5',
    voiceId: 'lJ00RZOOoE490i3hnZDL',
    voiceName: 'Stu G',
    language: 'en',
    profile: 'flexible_polished',
    tier: 'pro',
    label: {
      en: 'Stu G · en_voice_5 (EN · Pro)',
      es: 'Stu G · en_voice_5 (EN · Pro)',
    },
  },
  {
    id: 'en_voice_6',
    voiceId: 'SQQyvkXssth4s6HD2OuR',
    voiceName: 'Belle B',
    language: 'en',
    profile: 'flexible_warm',
    tier: 'pro',
    label: {
      en: 'Belle B · en_voice_6 (EN · Pro)',
      es: 'Belle B · en_voice_6 (EN · Pro)',
    },
  },
];

const STYLE_ALIAS_TO_GLOBALS: Record<string, string> = {
  'cempasuchil-editorial': 'minimalist_flat',
  '3d-render': '3d_render',
  cempasuchil: 'minimalist_flat',
};

const PRESET_ALIAS_TO_GLOBALS: Record<string, string> = {
  'short-hook': 'tiktok_viral',
  'luxury-brand': 'luxury_brand',
  'tech-modern': 'tech_modern',
  'dark-mystery': 'dark_mystery',
  tiktok: 'tiktok_viral',
  viral: 'tiktok_viral',
  mrbeast: 'mr_beast',
  luxury: 'luxury_brand',
  tech: 'tech_modern',
  mystery: 'dark_mystery',
  documental: 'documentary',
  doc: 'documentary',
  cine: 'cinematic',
  dramatic: 'cinematic',
  educativo: 'educational',
  explainer: 'educational',
};

type DraftWithSubtitles = StudioLiteDraft & {
  subtitlesEnabled?: boolean;
  subtitleStyle?: string;
};

function sanitizeDraftForPolicy(
  draft: DraftWithSubtitles,
  planTier: PlanTier,
  lang: 'es' | 'en'
): DraftWithSubtitles {
  const policy = getPlanWizardPolicy(planTier);

  const nextMode: WizardInputMode = draft.mode === 'script' ? 'script' : 'idea';

  const mappedPreset =
    PRESET_ALIAS_TO_GLOBALS[draft.presetId] || draft.presetId;
  const presetAccess = getOptionAccessState(
    policy.presets,
    mappedPreset,
    PRESET_OPTIONS.find((p) => p.id === mappedPreset)?.isPaidOnly
  );
  const nextPresetId = presetAccess.enabled
    ? mappedPreset
    : policy.defaultPresetId;

  const mappedStyle =
    STYLE_ALIAS_TO_GLOBALS[draft.visualFormatId] || draft.visualFormatId;
  const formatAccess = getOptionAccessState(
    policy.styleFormats,
    mappedStyle,
    VISUAL_FORMATS.find((f) => f.id === mappedStyle)?.isPaidOnly
  );
  const nextVisualFormatId = formatAccess.enabled
    ? mappedStyle
    : policy.defaultStyleFormatId;

  const nextAspectRatio: WizardAspectRatio = policy.allowedAspectRatios.includes(
    draft.aspectRatio
  )
    ? draft.aspectRatio
    : (policy.defaultAspectRatio as WizardAspectRatio);

  const nextDurationSec: AllowedDurationSec = policy.allowedDurationsSec.includes(
    draft.durationSec as AllowedDurationSec
  )
    ? (draft.durationSec as AllowedDurationSec)
    : policy.defaultDurationSec;

  const matchedVoice = VOICE_OPTIONS.find((v) => v.id === draft.voice);
  const allowProVoices = planTier !== 'free_trial';
  const fallbackVoiceId = lang === 'es' ? 'es_voice_1' : 'en_voice_1';
  const nextVoice =
    matchedVoice && (matchedVoice.tier === 'free' || allowProVoices)
      ? matchedVoice.id
      : fallbackVoiceId;

  const subtitlesEnabled =
    typeof draft.subtitlesEnabled === 'boolean' ? draft.subtitlesEnabled : true;

  const validSubtitleStyleIds = new Set(SUBTITLE_STYLE_OPTIONS.map((s) => s.id));
  const subtitleStyle =
    allowProVoices &&
    draft.subtitleStyle &&
    validSubtitleStyleIds.has(draft.subtitleStyle)
      ? draft.subtitleStyle
      : 'auto';

  return {
    ...draft,
    mode: nextMode,
    presetId: nextPresetId,
    visualFormatId: nextVisualFormatId,
    aspectRatio: nextAspectRatio,
    durationSec: nextDurationSec,
    voice: nextVoice,
    subtitlesEnabled,
    subtitleStyle,
  };
}

function StudioLiteWorkspaceWizard({
  initialPrompt = '',
  onRequireAuth,
  onGenerationCompleted,
  onBackToDashboard,
}: StudioLiteWorkspaceWizardProps) {
  const { language } = useTranslation();
  const { isAuthenticated, planTier, user } = useAuth();
  const lang = language === 'es' ? 'es' : 'en';
  const normalizedPlan = normalizePlanTier(planTier);
  const planPolicy = useMemo(
    () => getPlanWizardPolicy(normalizedPlan),
    [normalizedPlan]
  );

  const [wizardState, setWizardState] = useState<PersistedWizardState>(() => {
    const loaded = loadWizardState(initialPrompt);
    return {
      ...loaded,
      draft: sanitizeDraftForPolicy(
        loaded.draft as DraftWithSubtitles,
        normalizePlanTier(planTier),
        lang
      ),
      updatedAt: Date.now(),
    };
  });

  const [validationError, setValidationError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [showTermsError, setShowTermsError] = useState<boolean>(false);
  const [acceptedAiDisclaimer, setAcceptedAiDisclaimer] = useState<boolean>(false);
  const [showAiDisclaimerError, setShowAiDisclaimerError] = useState<boolean>(false);
  const [termsModalType, setTermsModalType] = useState<LegalDocType>('terms');
  const [isTermsModalOpen, setIsTermsModalOpen] = useState<boolean>(false);

  const updateDraft = useCallback(
    (updater: (prev: DraftWithSubtitles) => DraftWithSubtitles) => {
      setWizardState((prev) => {
        const nextDraft = sanitizeDraftForPolicy(
          updater(prev.draft as DraftWithSubtitles),
          normalizedPlan,
          lang
        );
        const nextState: PersistedWizardState = {
          ...prev,
          draft: nextDraft,
          updatedAt: Date.now(),
        };
        saveWizardState(nextState);
        return nextState;
      });
      setValidationError('');
    },
    [lang, normalizedPlan]
  );

  useEffect(() => {
    setWizardState((prev) => {
      const sanitized = sanitizeDraftForPolicy(
        prev.draft as DraftWithSubtitles,
        normalizedPlan,
        lang
      );
      const nextState: PersistedWizardState = {
        ...prev,
        draft: sanitized,
        updatedAt: Date.now(),
      };
      saveWizardState(nextState);
      return nextState;
    });
  }, [lang, normalizedPlan]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      updateDraft((prev) => ({
        ...prev,
        prompt: prev.prompt.trim().length > 0 ? prev.prompt : initialPrompt,
      }));
    }
  }, [initialPrompt, updateDraft]);

  const startGenerationFlow = useCallback(
    async (draftToRun: DraftWithSubtitles) => {
      const trimmedPrompt = draftToRun.prompt.trim();
      if (!trimmedPrompt) {
        setValidationError(
          lang === 'es'
            ? 'El campo de idea o guion es obligatorio para generar el video.'
            : 'Idea or script content is required to generate the video.'
        );
        return;
      }

      setIsProcessing(true);
      setValidationError('');

      const jobId = `job_${Date.now()}`;
      const videoTitle =
        trimmedPrompt.slice(0, 48) ||
        (lang === 'es' ? 'Video Studio Lite' : 'Studio Lite Video');
      const resolvedResolution = planPolicy.defaultResolution || '720p';
      const chosenVoice =
        VOICE_OPTIONS.find((v) => v.id === draftToRun.voice) ||
        VOICE_OPTIONS.find((v) => v.language === lang && v.tier === 'free') ||
        VOICE_OPTIONS[0];

      const isPaidPlan = normalizedPlan !== 'free_trial';
      const subtitlesEnabled =
        typeof draftToRun.subtitlesEnabled === 'boolean'
          ? draftToRun.subtitlesEnabled
          : true;
      const resolvedSubtitleStyle =
        isPaidPlan && subtitlesEnabled
          ? draftToRun.subtitleStyle || 'auto'
          : 'auto';

      try {
        const token = localStorage.getItem('cempa_token');
        const userRecord = user as {
          id?: string;
          _id?: string;
          email?: string;
        } | null;
        const userId = userRecord?.id || userRecord?._id || null;
        const email = userRecord?.email || null;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const masterPayload = {
          jobId,
          userId,
          email,
          title: videoTitle,
          product: 'studio_lite',
          language: lang,
          prompt: trimmedPrompt,
          mode: draftToRun.mode,
          preset: draftToRun.presetId,
          visualStyle: draftToRun.visualFormatId,
          styleFormat: draftToRun.visualFormatId,
          aspectRatio: draftToRun.aspectRatio,
          resolution: resolvedResolution,
          durationSec: draftToRun.durationSec,
          voice: chosenVoice.id,
          subtitlesEnabled,
          subtitleStyle: resolvedSubtitleStyle,
          plan: normalizedPlan,
          acceptedTerms: true,
          acceptedAiDisclaimer: true,
          meta: {
            jobId,
            userId,
            email,
            userPlan: normalizedPlan,
            product: 'studio_lite',
            preset: draftToRun.presetId,
            targetDurationSeconds: draftToRun.durationSec,
            language: lang,
            subtitlesEnabled,
            subtitleStyle: resolvedSubtitleStyle,
          },
          userInputs: {
            rawContent: trimmedPrompt,
            prompt: trimmedPrompt,
            topic: videoTitle,
            script: draftToRun.mode === 'script' ? trimmedPrompt : '',
            inputMode: draftToRun.mode,
            mode: draftToRun.mode,
            preset: draftToRun.presetId,
            visualStyle: draftToRun.visualFormatId,
            language: lang,
          },
          videoConfig: {
            preset: draftToRun.presetId,
            visualStyle: draftToRun.visualFormatId,
            styleFormat: draftToRun.visualFormatId,
            aspectRatio: draftToRun.aspectRatio,
            resolution: resolvedResolution,
            durationSec: draftToRun.durationSec,
            durationSeconds: draftToRun.durationSec,
            subtitlesEnabled,
            subtitles: subtitlesEnabled,
            subtitleStyle: resolvedSubtitleStyle,
          },
          voiceConfig: {
            key: chosenVoice.id,
            voiceKey: chosenVoice.id,
            voiceId: chosenVoice.voiceId,
            voiceName: chosenVoice.voiceName,
            language: chosenVoice.language,
          },
        };

        const response = await fetch(`${API_BASE_URL}${PIPELINE_ENDPOINT}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(masterPayload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data?.success === false) {
          setIsProcessing(false);
          setValidationError(
            data?.error ||
              data?.details ||
              data?.message ||
              (lang === 'es'
                ? 'No se pudo completar la generación del video en el pipeline.'
                : 'Could not complete video generation in the pipeline.')
          );
          return;
        }

        const pipelineResult =
          data?.payload && typeof data.payload === 'object'
            ? data.payload
            : data?.data && typeof data.data === 'object'
            ? data.data
            : data;

        const updatedCredits =
          typeof data?.creditsRemaining === 'number'
            ? data.creditsRemaining
            : typeof pipelineResult?.creditsRemaining === 'number'
            ? pipelineResult.creditsRemaining
            : typeof data?.credits === 'number'
            ? data.credits
            : undefined;

        clearWizardStorage();
        const resetState: PersistedWizardState = {
          draft: sanitizeDraftForPolicy(
            {
              ...loadWizardState('').draft,
              currentStep: 1,
              prompt: '',
              subtitlesEnabled: true,
              subtitleStyle: 'auto',
            } as DraftWithSubtitles,
            normalizedPlan,
            lang
          ),
          pendingGenerateAfterAuth: false,
          updatedAt: Date.now(),
        };
        saveWizardState(resetState);
        setWizardState(resetState);
        setAcceptedTerms(false);
        setShowTermsError(false);
        setAcceptedAiDisclaimer(false);
        setShowAiDisclaimerError(false);

        setIsProcessing(false);
        onGenerationCompleted?.({
          title: pipelineResult?.title || data?.title || videoTitle,
          prompt: trimmedPrompt,
          presetId: draftToRun.presetId,
          styleFormatId: draftToRun.visualFormatId,
          aspectRatio: draftToRun.aspectRatio,
          resolution: resolvedResolution,
          durationSec: draftToRun.durationSec,
          voice: chosenVoice.id,
          subtitlesEnabled,
          subtitleStyle: resolvedSubtitleStyle,
          creditsRemaining: updatedCredits,
        });
      } catch (err) {
        console.error('Error connecting Wizard to pipeline backend:', err);
        setIsProcessing(false);
        setValidationError(
          lang === 'es'
            ? 'Error de conexión con el servidor del pipeline. Verifica que el backend esté activo.'
            : 'Connection error with the pipeline server. Make sure the backend is running.'
        );
      }
    },
    [lang, normalizedPlan, onGenerationCompleted, planPolicy.defaultResolution, user]
  );

  useEffect(() => {
    if (isAuthenticated && wizardState.pendingGenerateAfterAuth && !isProcessing) {
      const draftSnapshot = wizardState.draft as DraftWithSubtitles;
      const clearedPendingState: PersistedWizardState = {
        ...wizardState,
        pendingGenerateAfterAuth: false,
        updatedAt: Date.now(),
      };
      saveWizardState(clearedPendingState);
      setWizardState(clearedPendingState);
      void startGenerationFlow(draftSnapshot);
    }
  }, [isAuthenticated, isProcessing, startGenerationFlow, wizardState]);

  const currentStep = wizardState.draft.currentStep;

  const handleStepSelect = (targetStep: WizardStepNumber) => {
    if (targetStep <= currentStep) {
      setValidationError('');
      updateDraft((prev) => ({ ...prev, currentStep: targetStep }));
    }
  };

  const handleBack = () => {
    setValidationError('');
    if (currentStep > 1) {
      const prevStep = (currentStep - 1) as WizardStepNumber;
      updateDraft((prev) => ({ ...prev, currentStep: prevStep }));
    } else {
      onBackToDashboard?.();
    }
  };

  const handleNextOrGenerate = () => {
    if (currentStep === 1 && !wizardState.draft.prompt.trim()) {
      setValidationError(
        lang === 'es'
          ? 'Escribe una idea o guion breve antes de pasar al Paso 2.'
          : 'Enter a brief idea or script before moving to Step 2.'
      );
      return;
    }

    if (currentStep < 5) {
      setValidationError('');
      const nextStep = (currentStep + 1) as WizardStepNumber;
      updateDraft((prev) => ({ ...prev, currentStep: nextStep }));
      return;
    }

    if (!wizardState.draft.prompt.trim()) {
      setValidationError(
        lang === 'es'
          ? 'El contenido (idea o guion) es obligatorio en el Paso 1 antes de generar.'
          : 'Content (idea or script) is required in Step 1 before generating.'
      );
      return;
    }

    if (!acceptedTerms || !acceptedAiDisclaimer) {
      if (!acceptedTerms) {
        setShowTermsError(true);
      }
      if (!acceptedAiDisclaimer) {
        setShowAiDisclaimerError(true);
      }
      setValidationError(
        lang === 'es'
          ? 'Debes aceptar los Términos de Servicio, la Política de Generación de Contenido con IA y la variabilidad de duración y resultados antes de generar.'
          : 'You must accept the Terms of Service, AI Content Generation Policy, and duration/output variability policy before generating.'
      );
      return;
    }

    if (!isAuthenticated) {
      const currentSaved = loadWizardState();
      saveWizardState({
        ...currentSaved,
        draft: wizardState.draft,
        pendingGenerateAfterAuth: true,
        updatedAt: Date.now(),
      });
      onRequireAuth?.(wizardState.draft);
      return;
    }

    void startGenerationFlow(wizardState.draft as DraftWithSubtitles);
  };

  const selectedPreset =
    PRESET_OPTIONS.find((item) => item.id === wizardState.draft.presetId) ||
    PRESET_OPTIONS.find((item) => item.id === planPolicy.defaultPresetId) ||
    PRESET_OPTIONS[0];

  const selectedFormat =
    VISUAL_FORMATS.find(
      (item) => item.id === wizardState.draft.visualFormatId
    ) ||
    VISUAL_FORMATS.find(
      (item) => item.id === planPolicy.defaultStyleFormatId
    ) ||
    VISUAL_FORMATS[0];

  const selectedVoice =
    VOICE_OPTIONS.find((item) => item.id === wizardState.draft.voice) ||
    VOICE_OPTIONS.find((item) => item.language === lang && item.tier === 'free') ||
    VOICE_OPTIONS[0];

  const draftWithSubs = wizardState.draft as DraftWithSubtitles;
  const subtitlesEnabled =
    typeof draftWithSubs.subtitlesEnabled === 'boolean'
      ? draftWithSubs.subtitlesEnabled
      : true;
  const subtitleStyle = draftWithSubs.subtitleStyle || 'auto';
  const canChooseSubtitleStyle = normalizedPlan !== 'free_trial';

  return (
    <div className={styles.wizardShell}>
      <WizardContainer
        currentStep={currentStep}
        planLabel={planPolicy.label[lang]}
        isProcessing={isProcessing}
        onSelectStep={handleStepSelect}
        onBack={handleBack}
        onNextOrGenerate={handleNextOrGenerate}
      >
        {isProcessing ? (
          <WizardProcessingStep
            draft={wizardState.draft}
            voiceLabel={selectedVoice?.voiceName || wizardState.draft.voice}
            onCancel={() => setIsProcessing(false)}
          />
        ) : (
          <>
            {validationError && (
              <p className={styles.validationBanner} role="alert">
                {validationError}
              </p>
            )}

            {currentStep === 1 && (
              <WizardStep1
                mode={wizardState.draft.mode}
                prompt={wizardState.draft.prompt}
                planTier={normalizedPlan}
                onModeChange={(mode) =>
                  updateDraft((prev) => ({ ...prev, mode }))
                }
                onPromptChange={(prompt) =>
                  updateDraft((prev) => ({ ...prev, prompt }))
                }
                onLockedScriptMode={() =>
                  setValidationError(
                    lang === 'es'
                      ? 'El modo guion personalizado requiere un plan superior.'
                      : 'Custom script mode requires a higher plan.'
                  )
                }
              />
            )}

            {currentStep === 2 && (
              <WizardStep2
                selectedPresetId={wizardState.draft.presetId}
                planTier={normalizedPlan}
                presets={PRESET_OPTIONS}
                onSelectPreset={(presetId) =>
                  updateDraft((prev) => ({ ...prev, presetId }))
                }
              />
            )}

            {currentStep === 3 && (
              <WizardStep3
                selectedFormatId={wizardState.draft.visualFormatId}
                planTier={normalizedPlan}
                formats={VISUAL_FORMATS}
                onSelectFormat={(visualFormatId) =>
                  updateDraft((prev) => ({ ...prev, visualFormatId }))
                }
              />
            )}

            {currentStep === 4 && (
              <WizardStep4
                aspectRatio={wizardState.draft.aspectRatio}
                voice={wizardState.draft.voice}
                durationSec={wizardState.draft.durationSec}
                planTier={normalizedPlan}
                promptText={wizardState.draft.prompt}
                subtitlesEnabled={subtitlesEnabled}
                subtitleStyle={subtitleStyle}
                canChooseSubtitleStyle={canChooseSubtitleStyle}
                subtitleStyles={SUBTITLE_STYLE_OPTIONS}
                onAspectRatioChange={(aspectRatio) =>
                  updateDraft((prev) => ({ ...prev, aspectRatio }))
                }
                onVoiceChange={(voice) =>
                  updateDraft((prev) => ({ ...prev, voice }))
                }
                onDurationChange={(durationSec) =>
                  updateDraft((prev) => ({ ...prev, durationSec }))
                }
                onSubtitlesEnabledChange={(enabled) =>
                  updateDraft((prev) => ({
                    ...prev,
                    subtitlesEnabled: enabled,
                    subtitleStyle: enabled ? prev.subtitleStyle || 'auto' : 'auto',
                  }))
                }
                onSubtitleStyleChange={(styleId) =>
                  updateDraft((prev) => ({
                    ...prev,
                    subtitleStyle: canChooseSubtitleStyle ? styleId : 'auto',
                  }))
                }
              />
            )}

            {currentStep === 5 && (
              <WizardStep5
                draft={wizardState.draft}
                presetLabel={selectedPreset.label[lang]}
                visualFormatLabel={selectedFormat.label[lang]}
                subtitlesEnabled={subtitlesEnabled}
                subtitleStyle={subtitleStyle}
                canChooseSubtitleStyle={canChooseSubtitleStyle}
                planTier={normalizedPlan}
                isAuthenticated={isAuthenticated}
                acceptedTerms={acceptedTerms}
                acceptedAiDisclaimer={acceptedAiDisclaimer}
                showTermsError={showTermsError}
                showAiDisclaimerError={showAiDisclaimerError}
                onAcceptedTermsChange={(checked) => {
                  setAcceptedTerms(checked);
                  if (checked) {
                    setShowTermsError(false);
                    if (acceptedAiDisclaimer) {
                      setValidationError('');
                    }
                  }
                }}
                onAcceptedAiDisclaimerChange={(checked) => {
                  setAcceptedAiDisclaimer(checked);
                  if (checked) {
                    setShowAiDisclaimerError(false);
                    if (acceptedTerms) {
                      setValidationError('');
                    }
                  }
                }}
                onOpenLegalDoc={(docType) => {
                  setTermsModalType(docType);
                  setIsTermsModalOpen(true);
                }}
                onJumpToStep={(step) =>
                  updateDraft((prev) => ({ ...prev, currentStep: step }))
                }
              />
            )}
          </>
        )}
      </WizardContainer>

      <TermsModal
        isOpen={isTermsModalOpen}
        type={termsModalType}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => {
          setAcceptedTerms(true);
          setShowTermsError(false);
          if (acceptedAiDisclaimer) {
            setValidationError('');
          }
        }}
      />
    </div>
  );
}

export { StudioLiteWorkspaceWizard };
export default StudioLiteWorkspaceWizard;
