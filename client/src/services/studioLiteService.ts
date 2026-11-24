import { type MasterVideoPayload, type StudioLiteRenderResponse } from '../types/studioLite';
import { type PlanKey, type SupportedLanguage, type VideoResolution } from '../types/common';
import { type StudioLiteDraft } from '../context/StudioLiteContext';
import { PLAN_POLICIES } from '../config/plans';

interface RenderStudioLiteParams {
  draft: StudioLiteDraft;
  userPlan: PlanKey;
  language: SupportedLanguage;
  voiceName?: string;
  tone?: string;
}

function buildMasterPayload({
  draft,
  userPlan,
  language,
  voiceName,
  tone
}: RenderStudioLiteParams): MasterVideoPayload {
  const policy = PLAN_POLICIES[userPlan] || PLAN_POLICIES.free_trial;
  const isFreeTrial = userPlan === 'free_trial';
  const resolution: VideoResolution = isFreeTrial ? '720p' : '1080p';
  const watermark = isFreeTrial;
  const targetDurationSeconds =
    draft.targetDurationSeconds || policy.defaultDurationSeconds;

  return {
    meta: {
      userPlan,
      language,
      preset: draft.preset,
      visualStyle: draft.visualStyle,
      voice: draft.voiceId,
      voiceName,
      targetDurationSeconds
    },
    userInputs: {
      mode: draft.mode,
      language,
      preset: draft.preset,
      visualStyle: draft.visualStyle,
      voice: draft.voiceId,
      voiceName,
      tone,
      aspectRatio: draft.aspectRatio,
      rawContent: draft.rawContent,
      selectedHookId: draft.selectedHookId,
      selectedCtaId: draft.selectedCtaId
    },
    videoConfig: {
      preset: draft.preset,
      resolution,
      watermark,
      subtitles: {
        enabled: draft.subtitlesEnabled
      }
    },
    orchestration: {
      planApplied: userPlan
    }
  };
}

async function renderStudioLiteVideo(
  params: RenderStudioLiteParams
): Promise<StudioLiteRenderResponse> {
  const payload = buildMasterPayload(params);

  const response = await fetch('/api/studio-lite/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data: StudioLiteRenderResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to render video');
  }

  return data;
}

export { buildMasterPayload, renderStudioLiteVideo };
