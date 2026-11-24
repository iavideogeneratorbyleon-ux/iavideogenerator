type LandingSectionId =
  | "hero"
  | "howItWorks"
  | "features"
  | "products"
  | "showcase"
  | "tools"
  | "testimonials"
  | "pricing"
  | "faq";

type LocalizedText = {
  en: string;
  es: string;
};

interface TestimonialItem {
  id: string;
  author: string;
  role: LocalizedText;
  quote: LocalizedText;
  rating: number;
  avatarUrl?: string;
  featured?: boolean;
}

interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

interface FeatureItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  badge?: LocalizedText;
}

interface PricingPlanItem {
  id: string;
  name: LocalizedText;
  priceMonthly: string;
  description: LocalizedText;
  features: LocalizedText[];
  highlighted?: boolean;
  ctaLabel: LocalizedText;
}

interface LandingSectionConfig {
  id: LandingSectionId;
  enabled: boolean;
  order: number;
  variant?: "warm-light" | "warm-alt" | "carbon-contrast";
}

interface LandingPageData {
  sections: LandingSectionConfig[];
  hero: {
    eyebrow: LocalizedText;
    headline: LocalizedText;
    highlightWord: LocalizedText;
    subtitle: LocalizedText;
    promptPlaceholder: LocalizedText;
    primaryCta: LocalizedText;
    secondaryCta: LocalizedText;
  };
  features: FeatureItem[];
  testimonials: TestimonialItem[];
  pricing: PricingPlanItem[];
  faq: FaqItem[];
}

export {
  type LandingSectionId,
  type LocalizedText,
  type TestimonialItem,
  type FaqItem,
  type FeatureItem,
  type PricingPlanItem,
  type LandingSectionConfig,
  type LandingPageData,
};
