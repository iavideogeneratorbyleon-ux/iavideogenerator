import { type ReactNode } from 'react';
import Hero, { type HeroProps } from './sections/Hero/Hero';
import Products, { type ProductCardItem } from './sections/Products/Products';
import Tools, { type ToolItem } from './sections/Tools/Tools';
import Showcase, { type ShowcaseItem } from './sections/Showcase/Showcase';
import HowItWorks, { type StepItem } from './sections/HowItWorks/Howitworks';
import Features, { type FeatureItem } from './sections/Features/Features';
import Testimonials, {
  type TestimonialItem,
} from './sections/Testimonials/Testimonials';
import Pricing, { type PricingPlanItem } from './sections/Pricing/Pricing';
import FAQ, { type FaqItem } from './sections/FAQ/FAQ';
import styles from './LandingPage.module.css';

export type LandingSectionKey =
  | 'hero'
  | 'products'
  | 'tools'
  | 'showcase'
  | 'howItWorks'
  | 'features'
  | 'testimonials'
  | 'pricing'
  | 'faq';

export interface LandingSectionConfig {
  key: LandingSectionKey;
  enabled: boolean;
}

export interface LandingDynamicData {
  sections?: LandingSectionConfig[];
  products?: ProductCardItem[];
  tools?: ToolItem[];
  showcase?: ShowcaseItem[];
  howItWorks?: StepItem[];
  features?: FeatureItem[];
  testimonials?: TestimonialItem[];
  pricing?: PricingPlanItem[];
  faq?: FaqItem[];
}

interface LandingPageProps {
  onStartWizard?: HeroProps['onStartWizard'];
  onSelectPlan?: (planId: string) => void;
  dynamicData?: LandingDynamicData;
}

const DEFAULT_SECTION_ORDER: LandingSectionConfig[] = [
  { key: 'hero', enabled: true },
  { key: 'products', enabled: true },
  { key: 'tools', enabled: true },
  { key: 'showcase', enabled: true },
  { key: 'howItWorks', enabled: true },
  { key: 'features', enabled: true },
  { key: 'testimonials', enabled: true },
  { key: 'pricing', enabled: true },
  { key: 'faq', enabled: true },
];

function LandingPage({
  onStartWizard,
  onSelectPlan,
  dynamicData,
}: LandingPageProps) {
  const sectionList =
    dynamicData?.sections && dynamicData.sections.length > 0
      ? dynamicData.sections
      : DEFAULT_SECTION_ORDER;

  const renderSection = (key: LandingSectionKey): ReactNode => {
    switch (key) {
      case 'hero':
        return <Hero key="hero" onStartWizard={onStartWizard} />;
      case 'products':
        return <Products key="products" items={dynamicData?.products} />;
      case 'tools':
        return <Tools key="tools" items={dynamicData?.tools} />;
      case 'showcase':
        return <Showcase key="showcase" items={dynamicData?.showcase} />;
      case 'howItWorks':
        return <HowItWorks key="howItWorks" items={dynamicData?.howItWorks} />;
      case 'features':
        return <Features key="features" items={dynamicData?.features} />;
      case 'testimonials':
        return (
          <Testimonials key="testimonials" items={dynamicData?.testimonials} />
        );
      case 'pricing':
        return (
          <Pricing
            key="pricing"
            plans={dynamicData?.pricing}
            onSelectPlan={onSelectPlan}
          />
        );
      case 'faq':
        return <FAQ key="faq" items={dynamicData?.faq} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {sectionList
          .filter((section) => section.enabled)
          .map((section) => renderSection(section.key))}
      </main>
    </div>
  );
}

export { LandingPage, DEFAULT_SECTION_ORDER, type LandingPageProps };
export default LandingPage;
