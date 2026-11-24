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
  landing: {
    hero: {
      badge: string;
      headlineStart: string;
      headlineHighlight: string;
      subtitle: string;
      composerLabel: string;
      cursorHint: string;
      placeholder: string;
      quickPrompt1: string;
      quickPrompt2: string;
      quickPrompt3: string;
      footerNote: string;
      secondaryCta: string;
      primaryCta: string;
    };
    products: {
      eyebrow: string;
      titleStart: string;
      titleHighlight: string;
      subtitle: string;
    };
    tools: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
    showcase: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
    howItWorks: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
    features: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
    testimonials: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
    pricing: {
      eyebrow: string;
      title: string;
      subtitle: string;
      monthlySuffix: string;
      popularBadge: string;
    };
    faq: {
      eyebrow: string;
      title: string;
      subtitle: string;
    };
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
  },
  landing: {
    hero: {
      badge: 'CEMPAI.AI · CREATIVE STUDIO',
      headlineStart: 'Turn your ideas into something',
      headlineHighlight: 'extraordinary.',
      subtitle:
        'Create, explore, and bring your imagination to life with a high-contrast creative workspace inspired by the cempasúchil flower.',
      composerLabel: 'Prompt Composer',
      cursorHint: 'Ready to write · Cursor active',
      placeholder:
        'Describe your vision here... start typing and watch the cempasúchil cursor',
      quickPrompt1:
        'A cinematic marigold flower opening at golden hour with warm light rays',
      quickPrompt2:
        'A creative studio story with smooth camera motion and rich amber tones',
      quickPrompt3:
        'An inspiring visual journey from sketch to full motion scene',
      footerNote:
        'Opens the creative studio flow with warm cempasúchil contrast and dual-mode support.',
      secondaryCta: 'Explore Studio',
      primaryCta: 'Start Creating →',
    },
    products: {
      eyebrow: 'Products',
      titleStart: 'Built for creators at',
      titleHighlight: 'every stage',
      subtitle:
        'Modular workflows designed so you can start fast and scale without friction.',
    },
    tools: {
      eyebrow: 'Creative Tools',
      title: 'Focused tools that keep your cursor and ideas moving',
      subtitle:
        'Everything you need to shape prompts, voice, style, and assets in one workspace.',
    },
    showcase: {
      eyebrow: 'Showcase',
      title: 'Crafted with rich contrast, not flat dark boxes',
      subtitle:
        'Sample outputs and visual compositions managed dynamically for your audience.',
    },
    howItWorks: {
      eyebrow: 'How It Works',
      title: 'From first keystroke to finished creation',
      subtitle:
        'A clear step-by-step flow built around clarity and speed.',
    },
    features: {
      eyebrow: 'Features',
      title: 'Engineered with color contrast and clarity',
      subtitle:
        'Dual warm sand and carbon surfaces paired with cempasúchil accents.',
    },
    testimonials: {
      eyebrow: 'Testimonials',
      title: 'What creators are saying',
      subtitle:
        'Feedback and stories dynamically managed from your control panel.',
    },
    pricing: {
      eyebrow: 'Pricing',
      title: 'Clear plans for every stage',
      subtitle:
        'Start free and upgrade whenever you need expanded studio capabilities.',
      monthlySuffix: '/ month',
      popularBadge: 'Most Popular',
    },
    faq: {
      eyebrow: 'FAQ',
      title: 'Frequently asked questions',
      subtitle:
        'Answers about themes, dynamic sections, and creative workflows.',
    },
  },
};
