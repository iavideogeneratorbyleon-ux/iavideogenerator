import type { WizardData } from './WizardStep1';

const DRAFT_KEY = 'cempa_pending_video_draft';

export const savePendingDraft = (data: WizardData) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error guardando borrador en localStorage', e);
  }
};

export const getPendingDraft = (): WizardData | null => {
  try {
    const item = localStorage.getItem(DRAFT_KEY);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error('Error leyendo borrador de localStorage', e);
    return null;
  }
};

export const clearPendingDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    console.error('Error borrando borrador de localStorage', e);
  }
};
