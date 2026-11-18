import { type WizardFormValues, type GenerateVideoResponse, type UserPlan } from './types';

const API_BASE_URL = 'http://localhost:3030/api/studio-lite';

export async function generateStudioLiteVideo(
  values: WizardFormValues,
  userPlan: UserPlan = 'free_trial',
  userId: string = 'usr_web_001'
): Promise<GenerateVideoResponse> {
  
  // Construimos el Master Payload exacto que espera nuestro backend
  const masterPayload = {
    meta: {
      productType: 'studio_lite',
      userId,
      userPlan,
      language: 'en',
      createdAt: new Date().toISOString(),
      status: 'queued'
    },
    userInputs: {
      mode: 'idea',
      rawContent: values.rawContent,
      tone: values.tone,
      voiceId: values.voiceId,
      aspectRatio: values.aspectRatio,
      visualStyle: values.visualStyle,
      musicStyle: values.musicStyle,
      subtitlesEnabled: values.subtitlesEnabled
    },
    config: {
      subtitles: values.subtitlesEnabled
    }
  };

  const response = await fetch(`${API_BASE_URL}/generate`, {
  // const response = await fetch(`${API_BASE_URL}/generate-mock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(masterPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al generar el video en Studio Lite.');
  }

  const data: GenerateVideoResponse = await response.json();
  return data;
}
