export interface TranslationDictionary {
  common: {
    appName: string;
    loading: string;
    save: string;
    cancel: string;
    continue: string;
    back: string;
    upgrade: string;
    proBadge: string;
    freeBadge: string;
  };
  nav: {
    home: string;
    studioLite: string;
    pricing: string;
    dashboard: string;
    login: string;
    logout: string;
  };
  studioLite: {
    title: string;
    subtitle: string;
    modeIdea: string;
    modeScript: string;
    promptPlaceholderIdea: string;
    promptPlaceholderScript: string;
    presetLabel: string;
    visualStyleLabel: string;
    aspectRatioLabel: string;
    voiceLabel: string;
    durationLabel: string;
    subtitlesLabel: string;
    hookLabel: string;
    ctaLabel: string;
    generateButton: string;
    generatingStatus: string;
    completedStatus: string;
    errorGeneric: string;
    freeWatermarkNotice: string;
  };
  plans: {
    free_trial: string;
    pay_per_video: string;
    pro: string;
    unlimited: string;
    upgradeTitle: string;
    upgradeDescription: string;
  };
}

export const en: TranslationDictionary = {
  common: {
    appName: 'Cempai.ai',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    continue: 'Continue',
    back: 'Back',
    upgrade: 'Upgrade',
    proBadge: 'PRO',
    freeBadge: 'Free'
  },
  nav: {
    home: 'Home',
    studioLite: 'Studio Lite',
    pricing: 'Pricing',
    dashboard: 'Dashboard',
    login: 'Log in',
    logout: 'Log out'
  },
  studioLite: {
    title: 'Studio Lite',
    subtitle: 'Turn an idea or script into a ready-to-publish video.',
    modeIdea: 'From Idea',
    modeScript: 'From Script',
    promptPlaceholderIdea: 'Describe your video topic or core idea...',
    promptPlaceholderScript: 'Paste or write your narration script...',
    presetLabel: 'Narrative Preset',
    visualStyleLabel: 'Visual Style',
    aspectRatioLabel: 'Aspect Ratio',
    voiceLabel: 'Voice',
    durationLabel: 'Duration',
    subtitlesLabel: 'Subtitles',
    hookLabel: 'Opening Hook',
    ctaLabel: 'Closing CTA',
    generateButton: 'Generate Video',
    generatingStatus: 'Creating your video...',
    completedStatus: 'Your video is ready!',
    errorGeneric: 'Something went wrong while generating your video.',
    freeWatermarkNotice: 'Free trial videos include the Cempai.ai watermark in 720p.'
  },
  plans: {
    free_trial: 'Free Trial',
    pay_per_video: 'Pay Per Video',
    pro: 'Pro',
    unlimited: 'Unlimited',
    upgradeTitle: 'Unlock Pro Voices & Full HD',
    upgradeDescription: 'Remove watermarks, export in 1080p, and access all voices and templates.'
  }
};
