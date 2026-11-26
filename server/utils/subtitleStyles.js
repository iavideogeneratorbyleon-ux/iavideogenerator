// server/utils/subtitleStyles.js

const DEFAULT_SUBTITLE_STYLE = {
  effectStyle: "standard_enhanced",
  style: "standard_enhanced",
  fontFamily: "Inter",
  fontWeight: "600",
  fontFile: null,
  rgba: [248, 246, 242, 255],
  outlineRgba: [10, 10, 12, 240],
  boxRgba: [10, 10, 12, 0],
  showBox: false,
  fontScale: 1.0,
  bottomRatio9x16: 0.84,
  bottomRatioDefault: 0.88,
  maxLineWidthRatio: 0.84,
  lineGapScale: 1.4,
  maxWordsPerCue: 7,
  maxCharsPerLineByRatio: {
    "9:16": 26,
    "1:1": 32,
    "16:9": 44,
  },
};

export const SUBTITLE_STYLE_CATALOG = {
  default: {
    base: { ...DEFAULT_SUBTITLE_STYLE },
    variants: {},
  },

  dark_mystery: {
    base: {
      ...DEFAULT_SUBTITLE_STYLE,
      effectStyle: "mystery_cinema",
      style: "mystery_cinema",
      fontFamily: "Cinzel",
      fontWeight: "600",
      rgba: [242, 231, 214, 255],
      outlineRgba: [6, 6, 8, 250],
      boxRgba: [8, 8, 12, 0],
      showBox: false,
      fontScale: 1.0,
      bottomRatio9x16: 0.84,
      bottomRatioDefault: 0.88,
      maxLineWidthRatio: 0.82,
      lineGapScale: 1.45,
      maxWordsPerCue: 6,
    },
    variants: {
      film_noir: {
        effectStyle: "noir_monochrome_shadow",
        style: "noir_monochrome_shadow",
        rgba: [232, 232, 236, 255],
        outlineRgba: [0, 0, 0, 255],
        fontScale: 0.99,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 6,
      },
      mystery: {
        effectStyle: "mystery_suspense_whisper",
        style: "mystery_suspense_whisper",
        rgba: [236, 224, 206, 255],
        outlineRgba: [8, 6, 12, 250],
        fontScale: 1.0,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 6,
      },
    },
  },

  cinematic: {
    base: {
      ...DEFAULT_SUBTITLE_STYLE,
      effectStyle: "cinematic_film",
      style: "cinematic_film",
      fontFamily: "Cormorant Garamond",
      fontWeight: "600",
      rgba: [248, 236, 210, 255],
      outlineRgba: [10, 10, 12, 245],
      boxRgba: [12, 10, 8, 0],
      showBox: false,
      fontScale: 1.02,
      bottomRatio9x16: 0.84,
      bottomRatioDefault: 0.88,
      maxLineWidthRatio: 0.84,
      lineGapScale: 1.4,
      maxWordsPerCue: 6,
    },
    variants: {
      epic_cinematic: {
        effectStyle: "epic_widescreen_gold",
        style: "epic_widescreen_gold",
        fontWeight: "700",
        rgba: [255, 242, 204, 255],
        fontScale: 1.05,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      golden_hour: {
        effectStyle: "golden_hour_warm",
        style: "golden_hour_warm",
        rgba: [255, 228, 176, 255],
        outlineRgba: [24, 14, 6, 245],
        fontScale: 1.01,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 6,
      },
      dramatic_storytelling: {
        effectStyle: "dramatic_story_focus",
        style: "dramatic_story_focus",
        rgba: [248, 238, 222, 255],
        outlineRgba: [8, 8, 12, 250],
        fontScale: 1.02,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 6,
      },
      epic_story: {
        effectStyle: "epic_saga_title",
        style: "epic_saga_title",
        fontWeight: "700",
        rgba: [252, 238, 200, 255],
        fontScale: 1.04,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      fantasy_adventure: {
        effectStyle: "fantasy_realm_glow",
        style: "fantasy_realm_glow",
        rgba: [232, 244, 255, 255],
        outlineRgba: [12, 16, 28, 250],
        fontScale: 1.03,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 6,
      },
      emotional_story: {
        effectStyle: "emotional_intimate",
        style: "emotional_intimate",
        rgba: [250, 242, 236, 255],
        outlineRgba: [14, 12, 14, 240],
        fontScale: 1.0,
        bottomRatio9x16: 0.85,
        maxWordsPerCue: 6,
      },
      anime_cinematic: {
        effectStyle: "anime_cinema_caption",
        style: "anime_cinema_caption",
        fontFamily: "Plus Jakarta Sans",
        fontWeight: "700",
        rgba: [255, 250, 240, 255],
        outlineRgba: [10, 12, 24, 250],
        fontScale: 1.05,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      motivational_speech: {
        effectStyle: "motivational_anthem",
        style: "motivational_anthem",
        fontWeight: "700",
        rgba: [255, 246, 220, 255],
        fontScale: 1.04,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      inspirational_journey: {
        effectStyle: "inspirational_horizon",
        style: "inspirational_horizon",
        rgba: [248, 244, 232, 255],
        fontScale: 1.02,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 6,
      },
      travel_cinematic: {
        effectStyle: "travel_cinematic_vista",
        style: "travel_cinematic_vista",
        fontFamily: "Source Sans 3",
        fontWeight: "600",
        rgba: [250, 248, 242, 255],
        outlineRgba: [12, 14, 18, 240],
        fontScale: 1.0,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 5,
      },
      adventure: {
        effectStyle: "adventure_expedition",
        style: "adventure_expedition",
        fontFamily: "Source Sans 3",
        fontWeight: "700",
        rgba: [252, 244, 224, 255],
        outlineRgba: [14, 12, 10, 245],
        fontScale: 1.03,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
    },
  },

  netflix: {
    base: {
      ...DEFAULT_SUBTITLE_STYLE,
      effectStyle: "netflix_series",
      style: "netflix_series",
      fontFamily: "Bebas Neue",
      fontWeight: "700",
      rgba: [255, 250, 242, 255],
      outlineRgba: [0, 0, 0, 245],
      boxRgba: [0, 0, 0, 0],
      showBox: false,
      fontScale: 1.03,
      bottomRatio9x16: 0.84,
      bottomRatioDefault: 0.88,
      maxLineWidthRatio: 0.84,
      lineGapScale: 1.35,
      maxWordsPerCue: 5,
    },
    variants: {},
  },

  documentary: {
    base: {
      ...DEFAULT_SUBTITLE_STYLE,
      effectStyle: "documentary_clean",
      style: "documentary_clean",
      fontFamily: "Source Sans 3",
      fontWeight: "600",
      rgba: [244, 246, 248, 255],
      outlineRgba: [12, 14, 18, 240],
      boxRgba: [10, 12, 16, 0],
      showBox: false,
      fontScale: 0.99,
      bottomRatio9x16: 0.85,
      bottomRatioDefault: 0.89,
      maxLineWidthRatio: 0.85,
      lineGapScale: 1.4,
      maxWordsPerCue: 6,
    },
    variants: {
      cinematic_documentary: {
        effectStyle: "doc_cinematic_field",
        style: "doc_cinematic_field",
        fontScale: 0.99,
        bottomRatio9x16: 0.85,
        maxWordsPerCue: 6,
      },
      history_explained: {
        effectStyle: "doc_history_archive",
        style: "doc_history_archive",
        rgba: [244, 238, 224, 255],
        outlineRgba: [16, 14, 12, 245],
        fontScale: 0.99,
        bottomRatio9x16: 0.85,
        maxWordsPerCue: 6,
      },
      historical_story: {
        effectStyle: "doc_historical_chronicle",
        style: "doc_historical_chronicle",
        rgba: [242, 236, 220, 255],
        outlineRgba: [14, 12, 10, 245],
        fontScale: 0.99,
        bottomRatio9x16: 0.85,
        maxWordsPerCue: 6,
      },
      life_lessons: {
        effectStyle: "doc_life_reflection",
        style: "doc_life_reflection",
        rgba: [246, 248, 246, 255],
        fontScale: 0.99,
        bottomRatio9x16: 0.85,
        maxWordsPerCue: 6,
      },
      sci_fi_documentary: {
        effectStyle: "doc_scifi_cosmos",
        style: "doc_scifi_cosmos",
        rgba: [210, 236, 255, 255],
        outlineRgba: [8, 14, 24, 250],
        fontScale: 1.0,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 6,
      },
      nature_documentary: {
        effectStyle: "doc_nature_wilderness",
        style: "doc_nature_wilderness",
        rgba: [242, 248, 244, 255],
        outlineRgba: [10, 18, 14, 240],
        fontScale: 0.98,
        bottomRatio9x16: 0.85,
        maxWordsPerCue: 6,
      },
      city_exploration: {
        effectStyle: "doc_urban_atlas",
        style: "doc_urban_atlas",
        rgba: [248, 248, 250, 255],
        outlineRgba: [12, 14, 20, 245],
        fontScale: 1.0,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      wildlife_documentary: {
        effectStyle: "doc_wildlife_observe",
        style: "doc_wildlife_observe",
        rgba: [246, 245, 238, 255],
        outlineRgba: [14, 14, 10, 245],
        fontScale: 0.97,
        bottomRatio9x16: 0.86,
        maxWordsPerCue: 6,
      },
    },
  },

  educational: {
    base: {
      ...DEFAULT_SUBTITLE_STYLE,
      effectStyle: "educational_clarity",
      style: "educational_clarity",
      fontFamily: "Plus Jakarta Sans",
      fontWeight: "700",
      rgba: [255, 255, 255, 255],
      outlineRgba: [15, 23, 42, 245],
      boxRgba: [15, 23, 42, 0],
      showBox: false,
      fontScale: 1.05,
      bottomRatio9x16: 0.83,
      bottomRatioDefault: 0.87,
      maxLineWidthRatio: 0.85,
      lineGapScale: 1.4,
      maxWordsPerCue: 6,
    },
    variants: {
      educational_explainer: {
        effectStyle: "edu_explainer_step",
        style: "edu_explainer_step",
        fontScale: 1.04,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 6,
      },
      science_explained: {
        effectStyle: "edu_science_lab",
        style: "edu_science_lab",
        rgba: [216, 244, 255, 255],
        outlineRgba: [10, 22, 42, 250],
        fontScale: 1.04,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 6,
      },
      animated_infographic: {
        effectStyle: "edu_infographic_badge",
        style: "edu_infographic_badge",
        showBox: true,
        boxRgba: [15, 23, 42, 185],
        fontScale: 1.02,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      whiteboard_explanation: {
        effectStyle: "edu_whiteboard_marker",
        style: "edu_whiteboard_marker",
        rgba: [255, 255, 255, 255],
        outlineRgba: [15, 23, 42, 255],
        fontScale: 1.05,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 6,
      },
      "3d_animated_story": {
        effectStyle: "edu_3d_stage",
        style: "edu_3d_stage",
        rgba: [245, 248, 255, 255],
        outlineRgba: [12, 18, 36, 250],
        fontScale: 1.05,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      professional_training: {
        effectStyle: "edu_training_module",
        style: "edu_training_module",
        rgba: [248, 250, 252, 255],
        outlineRgba: [15, 23, 42, 245],
        fontScale: 1.02,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 6,
      },
    },
  },

  minimalist: {
    base: {
      ...DEFAULT_SUBTITLE_STYLE,
      effectStyle: "minimalist_editorial",
      style: "minimalist_editorial",
      fontFamily: "Inter",
      fontWeight: "500",
      rgba: [245, 245, 245, 255],
      outlineRgba: [20, 20, 20, 225],
      boxRgba: [18, 18, 18, 0],
      showBox: false,
      fontScale: 0.97,
      bottomRatio9x16: 0.85,
      bottomRatioDefault: 0.89,
      maxLineWidthRatio: 0.8,
      lineGapScale: 1.5,
      maxWordsPerCue: 6,
    },
    variants: {
      claymation_story: {
        effectStyle: "min_clay_tactile",
        style: "min_clay_tactile",
        fontWeight: "600",
        rgba: [252, 246, 238, 255],
        outlineRgba: [28, 22, 18, 235],
        fontScale: 1.0,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 5,
      },
      corporate_presentation: {
        effectStyle: "min_corp_deck",
        style: "min_corp_deck",
        fontWeight: "600",
        rgba: [248, 250, 252, 255],
        outlineRgba: [15, 23, 42, 235],
        fontScale: 0.98,
        bottomRatio9x16: 0.85,
        maxWordsPerCue: 6,
      },
      business_overview: {
        effectStyle: "min_biz_summary",
        style: "min_biz_summary",
        fontWeight: "600",
        rgba: [244, 246, 248, 255],
        outlineRgba: [18, 24, 34, 235],
        fontScale: 0.98,
        bottomRatio9x16: 0.85,
        maxWordsPerCue: 6,
      },
    },
  },

  luxury_brand: {
    base: {
      ...DEFAULT_SUBTITLE_STYLE,
      effectStyle: "luxury_champagne",
      style: "luxury_champagne",
      fontFamily: "Playfair Display",
      fontWeight: "600",
      rgba: [246, 224, 168, 255],
      outlineRgba: [18, 15, 10, 240],
      boxRgba: [16, 14, 10, 0],
      showBox: false,
      fontScale: 1.0,
      bottomRatio9x16: 0.84,
      bottomRatioDefault: 0.88,
      maxLineWidthRatio: 0.82,
      lineGapScale: 1.45,
      maxWordsPerCue: 5,
    },
    variants: {
      product_showcase: {
        effectStyle: "lux_showcase_spotlight",
        style: "lux_showcase_spotlight",
        rgba: [250, 234, 188, 255],
        fontScale: 1.01,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 5,
      },
      luxury_commercial: {
        effectStyle: "lux_commercial_atelier",
        style: "lux_commercial_atelier",
        rgba: [246, 224, 168, 255],
        fontScale: 1.0,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 5,
      },
      brand_promotion: {
        effectStyle: "lux_brand_signature",
        style: "lux_brand_signature",
        rgba: [248, 232, 190, 255],
        fontScale: 1.01,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 5,
      },
      lifestyle_advertisement: {
        effectStyle: "lux_lifestyle_editorial",
        style: "lux_lifestyle_editorial",
        rgba: [252, 244, 224, 255],
        outlineRgba: [16, 14, 12, 235],
        fontScale: 1.0,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 5,
      },
      success_mindset: {
        effectStyle: "lux_mindset_crest",
        style: "lux_mindset_crest",
        rgba: [246, 224, 168, 255],
        fontScale: 1.02,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      company_profile: {
        effectStyle: "lux_company_heritage",
        style: "lux_company_heritage",
        rgba: [244, 226, 178, 255],
        fontScale: 0.99,
        bottomRatio9x16: 0.84,
        maxWordsPerCue: 6,
      },
    },
  },

  tech_modern: {
    base: {
      ...DEFAULT_SUBTITLE_STYLE,
      effectStyle: "tech_cyan_sharp",
      style: "tech_cyan_sharp",
      fontFamily: "Space Grotesk",
      fontWeight: "700",
      rgba: [186, 242, 255, 255],
      outlineRgba: [8, 14, 24, 245],
      boxRgba: [8, 16, 28, 0],
      showBox: false,
      fontScale: 1.04,
      bottomRatio9x16: 0.83,
      bottomRatioDefault: 0.87,
      maxLineWidthRatio: 0.85,
      lineGapScale: 1.35,
      maxWordsPerCue: 5,
    },
    variants: {
      product_explainer: {
        effectStyle: "tech_product_ui",
        style: "tech_product_ui",
        rgba: [214, 248, 255, 255],
        fontScale: 1.03,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      futuristic_technology: {
        effectStyle: "tech_future_grid",
        style: "tech_future_grid",
        rgba: [165, 238, 255, 255],
        outlineRgba: [6, 12, 24, 250],
        fontScale: 1.05,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      cyberpunk: {
        effectStyle: "tech_cyber_neon",
        style: "tech_cyber_neon",
        rgba: [255, 130, 220, 255],
        outlineRgba: [12, 6, 24, 255],
        fontScale: 1.06,
        bottomRatio9x16: 0.82,
        maxWordsPerCue: 4,
      },
      ai_and_innovation: {
        effectStyle: "tech_ai_neural",
        style: "tech_ai_neural",
        rgba: [186, 242, 255, 255],
        fontScale: 1.04,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      digital_world: {
        effectStyle: "tech_digital_matrix",
        style: "tech_digital_matrix",
        rgba: [176, 250, 232, 255],
        outlineRgba: [6, 16, 18, 250],
        fontScale: 1.04,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
      startup_pitch: {
        effectStyle: "tech_pitch_keynote",
        style: "tech_pitch_keynote",
        rgba: [232, 246, 255, 255],
        fontScale: 1.02,
        bottomRatio9x16: 0.83,
        maxWordsPerCue: 5,
      },
    },
  },

  tiktok_viral: {
    base: {
      ...DEFAULT_SUBTITLE_STYLE,
      effectStyle: "viral_punch",
      style: "viral_punch",
      fontFamily: "Montserrat",
      fontWeight: "800",
      rgba: [255, 255, 255, 255],
      outlineRgba: [0, 0, 0, 255],
      boxRgba: [20, 10, 35, 0],
      showBox: false,
      fontScale: 1.14,
      bottomRatio9x16: 0.82,
      bottomRatioDefault: 0.86,
      maxLineWidthRatio: 0.86,
      lineGapScale: 1.3,
      maxWordsPerCue: 4,
    },
    variants: {
      instagram_reels: {
        effectStyle: "viral_reels_snap",
        style: "viral_reels_snap",
        rgba: [255, 255, 255, 255],
        fontScale: 1.13,
        bottomRatio9x16: 0.82,
        maxWordsPerCue: 4,
      },
      fast_facts: {
        effectStyle: "viral_fast_facts",
        style: "viral_fast_facts",
        rgba: [255, 240, 102, 255],
        outlineRgba: [0, 0, 0, 255],
        fontScale: 1.15,
        bottomRatio9x16: 0.82,
        maxWordsPerCue: 3,
      },
      trending_edit: {
        effectStyle: "viral_trending_beat",
        style: "viral_trending_beat",
        rgba: [255, 255, 255, 255],
        outlineRgba: [18, 0, 32, 255],
        fontScale: 1.14,
        bottomRatio9x16: 0.81,
        maxWordsPerCue: 4,
      },
    },
  },

  mr_beast: {
    base: {
      ...DEFAULT_SUBTITLE_STYLE,
      effectStyle: "mr_beast_bold",
      style: "mr_beast_bold",
      fontFamily: "Anton",
      fontWeight: "900",
      rgba: [255, 238, 45, 255],
      outlineRgba: [0, 0, 0, 255],
      boxRgba: [0, 0, 0, 0],
      showBox: false,
      fontScale: 1.18,
      bottomRatio9x16: 0.82,
      bottomRatioDefault: 0.86,
      maxLineWidthRatio: 0.86,
      lineGapScale: 1.3,
      maxWordsPerCue: 3,
    },
    variants: {
      cartoon_comedy: {
        effectStyle: "beast_comedy_pop",
        style: "beast_comedy_pop",
        rgba: [255, 248, 120, 255],
        outlineRgba: [0, 0, 0, 255],
        fontScale: 1.16,
        bottomRatio9x16: 0.82,
        maxWordsPerCue: 4,
      },
      manga_action: {
        effectStyle: "beast_manga_impact",
        style: "beast_manga_impact",
        rgba: [255, 224, 48, 255],
        outlineRgba: [0, 0, 0, 255],
        fontScale: 1.2,
        bottomRatio9x16: 0.81,
        maxWordsPerCue: 3,
      },
      youtube_shorts: {
        effectStyle: "beast_shorts_hook",
        style: "beast_shorts_hook",
        rgba: [255, 238, 45, 255],
        outlineRgba: [0, 0, 0, 255],
        fontScale: 1.18,
        bottomRatio9x16: 0.82,
        maxWordsPerCue: 3,
      },
    },
  },
};

function findVariantOwnerPreset(variantKey) {
  if (!variantKey) return null;
  for (const [presetKey, entry] of Object.entries(SUBTITLE_STYLE_CATALOG)) {
    if (
      entry.variants &&
      Object.prototype.hasOwnProperty.call(entry.variants, variantKey)
    ) {
      return presetKey;
    }
  }
  return null;
}

export function resolveSubtitleStyle({
  preset = "default",
  presetVariant = null,
  aspectRatio = "9:16",
  resolution = "720p",
  plan = "free_trial",
}) {
  const rawVariant = presetVariant ? String(presetVariant).trim() : null;
  const variantOwnerPreset = rawVariant ? findVariantOwnerPreset(rawVariant) : null;

  const effectivePresetKey = SUBTITLE_STYLE_CATALOG[preset]
    ? preset
    : variantOwnerPreset || "default";

  const presetEntry =
    SUBTITLE_STYLE_CATALOG[effectivePresetKey] || SUBTITLE_STYLE_CATALOG.default;

  const hasVariant = Boolean(
    rawVariant &&
      presetEntry.variants &&
      Object.prototype.hasOwnProperty.call(presetEntry.variants, rawVariant)
  );

  const variantKey = hasVariant ? rawVariant : null;
  const variantOverride = hasVariant ? presetEntry.variants[rawVariant] : {};

  const merged = {
    ...DEFAULT_SUBTITLE_STYLE,
    ...presetEntry.base,
    ...variantOverride,
  };

  const isVertical = aspectRatio === "9:16";
  const bottomRatio = isVertical
    ? merged.bottomRatio9x16
    : merged.bottomRatioDefault;

  const maxCharsPerLine =
    merged.maxCharsPerLineByRatio?.[aspectRatio] ??
    merged.maxCharsPerLineByRatio?.["9:16"] ??
    26;

  const isFreeTrialDefault =
    plan === "free_trial" && effectivePresetKey === "default" && !hasVariant;

  const finalEffectStyle = isFreeTrialDefault
    ? "static_basic"
    : merged.effectStyle;

  return {
    styleKey: effectivePresetKey,
    variantKey,
    aspectRatio,
    resolution,
    style: {
      effectStyle: finalEffectStyle,
      style: finalEffectStyle,
      fontFamily: merged.fontFamily,
      fontWeight: merged.fontWeight,
      fontFile: merged.fontFile,
      rgba: merged.rgba,
      outlineRgba: merged.outlineRgba,
      boxRgba: merged.boxRgba,
      showBox: merged.showBox,
      fontScale: merged.fontScale,
      bottomRatio9x16: merged.bottomRatio9x16,
      bottomRatioDefault: merged.bottomRatioDefault,
      maxLineWidthRatio: merged.maxLineWidthRatio,
      lineGapScale: merged.lineGapScale,
      bottomRatio,
    },
    sync: {
      enabledByDefault: true,
      stripVoiceTags: true,
      maxCharsPerLineByRatio: merged.maxCharsPerLineByRatio,
      maxLinesPerCue: 2,
      maxWordsPerCueByPreset: {
        tiktok_viral: 4,
        mr_beast: 3,
        educational: 6,
        documentary: 6,
        cinematic: 6,
        default: 7,
      },
      minCueDurationSec: 0.45,
      maxCueDurationSec: 4.2,
      gapMergeThresholdSec: 0.12,
      maxCharsPerLine,
      maxWordsPerCue: merged.maxWordsPerCue,
    },
    videoMeta: {
      enabled: true,
      mode: isFreeTrialDefault ? "static" : "preset_styled",
      effectStyle: finalEffectStyle,
      styleKey: effectivePresetKey,
      variantKey,
    },
  };
}

export function getPresetSubtitleStyle(rawPreset = "default", rawVariant = null) {
  const resolved = resolveSubtitleStyle({
    preset: rawPreset,
    presetVariant: rawVariant,
  });
  return resolved.style;
}

export {
  getPresetSubtitleStyle as default
};
