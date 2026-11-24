import type { WorkspaceSection } from '../pages/dashboard/Dashboard';

export type AppRouteId =
  | 'landing'
  | 'studio-lite'
  | 'dashboard'
  | 'text-to-speech'
  | 'products'
  | 'extra-tools'
  | 'features'
  | 'plans'
  | 'pricing'
  | 'testimonials';

export interface AppRouteConfig {
  id: AppRouteId;
  path: string;
  showSidebar: boolean;
  isWorkspaceRoute: boolean;
  workspaceSection?: WorkspaceSection;
  label: {
    en: string;
    es: string;
  };
}

export const APP_ROUTES: Record<AppRouteId, AppRouteConfig> = {
  landing: {
    id: 'landing',
    path: '/',
    showSidebar: false,
    isWorkspaceRoute: false,
    label: { en: 'Landing Page', es: 'Página de Inicio' },
  },
  'studio-lite': {
    id: 'studio-lite',
    path: '/studio-lite',
    showSidebar: true,
    isWorkspaceRoute: true,
    workspaceSection: 'studio-lite',
    label: { en: 'Studio Lite', es: 'Studio Lite' },
  },
  dashboard: {
    id: 'dashboard',
    path: '/dashboard',
    showSidebar: true,
    isWorkspaceRoute: false,
    workspaceSection: 'dashboard',
    label: { en: 'My Dashboard', es: 'Mi Panel' },
  },
  'text-to-speech': {
    id: 'text-to-speech',
    path: '/text-to-speech',
    showSidebar: true,
    isWorkspaceRoute: false,
    workspaceSection: 'text-to-speech',
    label: { en: 'Text to Speech', es: 'Text to Speech' },
  },
  products: {
    id: 'products',
    path: '/products',
    showSidebar: true,
    isWorkspaceRoute: false,
    label: { en: 'Director Studio', es: 'Director Studio' },
  },
  'extra-tools': {
    id: 'extra-tools',
    path: '/extra-tools',
    showSidebar: true,
    isWorkspaceRoute: false,
    label: { en: 'Text to Image', es: 'Text to Image' },
  },
  features: {
    id: 'features',
    path: '/features',
    showSidebar: true,
    isWorkspaceRoute: false,
    label: { en: 'Studio Blueprints', es: 'Studio Blueprints' },
  },
  plans: {
    id: 'plans',
    path: '/plans',
    showSidebar: true,
    isWorkspaceRoute: false,
    label: { en: 'Studio Memories', es: 'Studio Memories' },
  },
  pricing: {
    id: 'pricing',
    path: '/pricing',
    showSidebar: true,
    isWorkspaceRoute: false,
    label: { en: 'Image to Video', es: 'Image to Video' },
  },
  testimonials: {
    id: 'testimonials',
    path: '/testimonials',
    showSidebar: true,
    isWorkspaceRoute: false,
    label: { en: 'AI Voiceover', es: 'AI Voiceover' },
  },
};

export function shouldShowAppSidebar(route: AppRouteId): boolean {
  return APP_ROUTES[route]?.showSidebar ?? false;
}

export function isWorkspaceRoute(route: AppRouteId): boolean {
  return APP_ROUTES[route]?.isWorkspaceRoute ?? false;
}

export function routeToWorkspaceSection(route: AppRouteId): WorkspaceSection {
  return APP_ROUTES[route]?.workspaceSection ?? 'studio-lite';
}
