require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { promisify } = require('util');
const {
  GLOBALS,
  resolveAiModelId,
  resolveVoiceModelId,
  modelSupportsAudioTags
} = require('../config/globals');
const {
  clampNumber,
  normalizeKey,
  sanitizePlainText,
  resolvePlanPolicy
} = require('../utils/sharedHelpers');
const { getAudioDuration } = require('../utils/audioUtils');

let ffmpegStaticPath = null;
try {
  ffmpegStaticPath = require('ffmpeg-static');
} catch (_) {
  ffmpegStaticPath = null;
}

const ffmpegPath = process.env.FFMPEG_PATH || ffmpegStaticPath || 'ffmpeg';
const execFileAsync = promisify(execFile);

const AUDIO_OUTPUT_DIR = path.join(__dirname, '..', 'public', 'audio');

if (!fs.existsSync(AUDIO_OUTPUT_DIR)) {
  fs.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
}

const VOICE_CATALOG = GLOBALS.VOICE_CATALOG;
const VOICE_MAP = GLOBALS.VOICE_MAP;
const TONE_ALIASES = GLOBALS.TONE_ALIASES;
const PRESET_ALIASES = GLOBALS.PRESET_ALIASES;
const PRESET_VOICE_MODIFIERS = GLOBALS.BASE_PRESET_MODIFIERS || {};
const PRESET_VOICE_SETTINGS = GLOBALS.PRESET_VOICE_SETTINGS || {};
const VOICE_PRESET_OVERRIDES = GLOBALS.VOICE_PRESET_OVERRIDES || {};

function normalizePresetForAudio(rawPreset) {
  return normalizeKey(
    rawPreset,
    PRESET_ALIASES,
    Object.keys(PRESET_VOICE_SETTINGS).length ? PRESET_VOICE_SETTINGS : PRESET_VOICE_MODIFIERS,
    'default'
  );
}

function getPresetVoiceModifiers(preset = 'default', voiceKey = 'default') {
  const normalizedPreset = normalizePresetForAudio(preset);
  const base = PRESET_VOICE_MODIFIERS[normalizedPreset] ||
    PRESET_VOICE_MODIFIERS.default || {
      speedDelta: 0,
      stabilityDelta: 0,
      styleDelta: 0
    };
  const voiceOverride = VOICE_PRESET_OVERRIDES[voiceKey]?.[normalizedPreset];

  return {
    speedDelta:
      typeof voiceOverride?.speedDelta === 'number'
        ? voiceOverride.speedDelta
        : base.speedDelta ?? 0,
    stabilityDelta:
      typeof voiceOverride?.stabilityDelta === 'number'
        ? voiceOverride.stabilityDelta
        : base.stabilityDelta ?? 0,
    styleDelta:
      typeof voiceOverride?.styleDelta === 'number'
        ? voiceOverride.styleDelta
        : base.styleDelta ?? 0
  };
}

function stripBracketTags(text = '') {
  return String(text || '')
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanSubtitleTokenText(text = '') {
  return String(text || '')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeTextForSpeech(text = '', { preserveTags = true } = {}) {
  const raw = String(text || '');
  if (!preserveTags) {
    return sanitizePlainText(stripBracketTags(raw));
  }

  // Protegemos temporalmente etiquetas válidas [tag] para que sanitizePlainText no las borre
  const tokens = [];
  const protectedText = raw.replace(/\[[^\]]+\]/g, (match) => {
    const token = `__ELEVEN_TAG_${tokens.length}__`;
    tokens.push(match);
    return ` ${token} `;
  });

  const cleaned = sanitizePlainText(protectedText);
  let restored = cleaned;
  tokens.forEach((tag, idx) => {
    restored = restored.replace(new RegExp(`__ELEVEN_TAG_${idx}__`, 'g'), tag);
  });

  return restored.replace(/\s{2,}/g, ' ').trim();
}

function buildSubtitleSegmentsFromAlignment(alignment, cleanSubtitleText = '', maxWords = 6) {
  const chars = alignment?.characters;
  const starts = alignment?.character_start_times_seconds;
  const ends = alignment?.character_end_times_seconds;

  if (!Array.isArray(chars) || !Array.isArray(starts) || !Array.isArray(ends) || !chars.length) {
    return [];
  }

  const wordsWithTimes = [];
  let currentWord = '';
  let wordStart = null;
  let wordEnd = null;

  for (let i = 0; i < chars.length; i++) {
    const ch = String(chars[i] || '');
    const s = Number(starts[i]);
    const e = Number(ends[i]);
    const isSpace = /\s/.test(ch);

    if (!isSpace) {
      if (!currentWord) {
        wordStart = Number.isFinite(s) ? s : 0;
      }
      currentWord += ch;
      if (Number.isFinite(e)) {
        wordEnd = e;
      }
    } else if (currentWord) {
      wordsWithTimes.push({
        word: currentWord,
        start: wordStart ?? 0,
        end: wordEnd ?? (wordStart ?? 0) + 0.25
      });
      currentWord = '';
      wordStart = null;
      wordEnd = null;
    }
  }

  if (currentWord) {
    wordsWithTimes.push({
      word: currentWord,
      start: wordStart ?? 0,
      end: wordEnd ?? (wordStart ?? 0) + 0.25
    });
  }

  if (!wordsWithTimes.length) return [];

  const targetWords = String(cleanSubtitleText || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const alignedWords = wordsWithTimes.map((w, idx) => ({
    text: cleanSubtitleTokenText(targetWords[idx] || w.word),
    start: w.start,
    end: w.end
  }));

  const segments = [];
  for (let i = 0; i < alignedWords.length; i += maxWords) {
    const slice = alignedWords.slice(i, i + maxWords).filter((w) => Boolean(w.text));
    if (!slice.length) continue;
    const start = slice[0].start;
    const end = Math.max(start + 0.4, slice[slice.length - 1].end);
    segments.push({
      index: segments.length + 1,
      text: slice.map((w) => w.text).join(' ').trim(),
      start,
      end
    });
  }

  return segments.filter((seg) => Boolean(seg.text));
}

function mapLanguageToScribeCode(lang = '') {
  const normalized = String(lang || '').toLowerCase().trim();
  if (!normalized) return null;
  if (normalized.startsWith('es') || normalized === 'spa') return 'spa';
  if (normalized.startsWith('en') || normalized === 'eng') return 'eng';
  return normalized;
}

function extractCleanSpokenWords(words = []) {
  if (!Array.isArray(words) || !words.length) return [];

  return words
    .filter((item) => {
      if (!item || typeof item !== 'object') return false;
      const itemType = String(item.type || 'word').toLowerCase();
      if (itemType === 'spacing' || itemType === 'audio_event') return false;
      const rawWord = String(item.text ?? item.word ?? '').trim();
      if (!rawWord || /^\[[^\]]+\]$/.test(rawWord)) return false;
      return true;
    })
    .map((item) => {
      const cleaned = cleanSubtitleTokenText(item.text ?? item.word ?? '');
      const startVal = Number(item.start ?? item.start_time ?? item.startTime);
      const endVal = Number(item.end ?? item.end_time ?? item.endTime);
      const start = Number.isFinite(startVal) ? Math.max(0, startVal) : 0;
      const end = Number.isFinite(endVal) ? Math.max(start + 0.15, endVal) : start + 0.25;
      return {
        text: cleaned,
        start,
        end
      };
    })
    .filter((w) => Boolean(w.text));
}

function buildSubtitleSegmentsFromScribeWords(
  words = [],
  { maxWords = 6, minWordsForBreak = 3, minWordsForComma = 4 } = {}
) {
  const spokenWords = extractCleanSpokenWords(words);
  if (!spokenWords.length) return [];

  const segments = [];
  let currentSlice = [];

  const flushSlice = () => {
    if (!currentSlice.length) return;
    const start = currentSlice[0].start;
    const end = Math.max(start + 0.4, currentSlice[currentSlice.length - 1].end);
    const text = currentSlice
      .map((w) => w.text)
      .join(' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (text) {
      segments.push({
        index: segments.length + 1,
        text,
        start: Number(start.toFixed(2)),
        end: Number(end.toFixed(2))
      });
    }
    currentSlice = [];
  };

  for (let i = 0; i < spokenWords.length; i++) {
    const wordObj = spokenWords[i];
    currentSlice.push(wordObj);

    const count = currentSlice.length;
    const endsStrongPunct = /[.!?:;…]+["')\]]*$/.test(wordObj.text);
    const endsComma = /,["')\]]*$/.test(wordObj.text);

    if ((endsStrongPunct && count >= minWordsForBreak) || (endsComma && count >= minWordsForComma) || count >= maxWords) {
      flushSlice();
    }
  }

  flushSlice();
  return segments;
}

function toSrtTimestamp(seconds = 0) {
  const safeSec = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const totalMs = Math.round(safeSec * 1000);
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const ss = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const mm = totalMinutes % 60;
  const hh = Math.floor(totalMinutes / 60);

  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function buildSrtFromSegments(segments = []) {
  return (Array.isArray(segments) ? segments : [])
    .map((seg, idx) => {
      const text = cleanSubtitleTokenText(seg?.text || '');
      if (!text) return null;
      const start = Number(seg?.start) || 0;
      const end = Math.max(start + 0.2, Number(seg?.end) || start + 0.5);
      return `${idx + 1}\n${toSrtTimestamp(start)} --> ${toSrtTimestamp(end)}\n${text}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

async function transcribeAudioWithScribeV3({ filePath, apiKey, language = '', modelId = null, signal }) {
  const resolvedSttModelId = resolveAiModelId('stt', { explicitModelId: modelId }) || 'scribe_v3';
  const audioBytes = fs.readFileSync(filePath);
  const formData = new FormData();
  const blob = new Blob([audioBytes], { type: 'audio/mpeg' });
  formData.append('file', blob, path.basename(filePath));
  formData.append('model_id', resolvedSttModelId);
  formData.append('timestamps_granularity', 'word');

  const scribeLang = mapLanguageToScribeCode(language);
  if (scribeLang) {
    formData.append('language_code', scribeLang);
  }

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'xi-api-key': apiKey
    },
    signal,
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Scribe v3 API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const words = extractCleanSpokenWords(data?.words || []);
  const segments = buildSubtitleSegmentsFromScribeWords(words, {
    maxWords: 6,
    minWordsForBreak: 3,
    minWordsForComma: 4
  });
  return {
    text: cleanSubtitleTokenText(data?.text || ''),
    words,
    segments,
    srt: buildSrtFromSegments(segments)
  };
}

async function probeMp3DurationSeconds(filePath) {
  try {
    const { stdout } = await execFileAsync(ffmpegPath, ['-i', filePath]);
    void stdout;
  } catch (err) {
    const stderr = String(err?.stderr || err?.message || '');
    const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (match) {
      const h = Number(match[1]) || 0;
      const m = Number(match[2]) || 0;
      const s = Number(match[3]) || 0;
      return h * 3600 + m * 60 + s;
    }
  }
  return 0;
}

async function transcribeMergedJobAudio(payload = {}) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const masterPayload = payload?.payload || payload?.data || payload || {};
  const structuredScript =
    masterPayload?.llmDirective?.structuredScript ||
    masterPayload?.structuredScript ||
    (Array.isArray(masterPayload?.scenes) ? masterPayload : null);
  const scenes = Array.isArray(structuredScript?.scenes) ? structuredScript.scenes : [];

  const mergedFileName =
    masterPayload?.voice?.mergedAudio?.fileName ||
    masterPayload?.mergedAudio?.fileName ||
    null;

  if (!apiKey || !mergedFileName || !scenes.length) {
    return masterPayload;
  }

  const mergedFilePath = path.join(AUDIO_OUTPUT_DIR, mergedFileName);
  if (!fs.existsSync(mergedFilePath)) {
    return masterPayload;
  }

  const language =
    masterPayload?.meta?.language ||
    masterPayload?.userInputs?.language ||
    masterPayload?.llmDirective?.language ||
    '';

  const sttModelId = resolveAiModelId('stt', {
    explicitModelId:
      masterPayload?.subtitles?.modelId ||
      masterPayload?.voiceConfig?.sttModelId ||
      masterPayload?.meta?.sttModelId
  });

  const scribeResult = await transcribeAudioWithScribeV3({
    filePath: mergedFilePath,
    apiKey,
    language,
    modelId: sttModelId
  });

  let cursor = 0;
  const sceneWindows = [];

  for (const sc of scenes) {
    const sceneFile = sc?.audio?.fileName;
    const sceneFilePath = sceneFile ? path.join(AUDIO_OUTPUT_DIR, sceneFile) : null;
    const measuredDur =
      sceneFilePath && fs.existsSync(sceneFilePath)
        ? await getAudioDuration(sceneFilePath)
        : 0;
    const dur = measuredDur > 0 ? measuredDur : Number(sc?.durationSeconds) || 4;
    const startSec = cursor;
    const endSec = cursor + dur;
    sceneWindows.push({ startSec, endSec, dur });
    cursor = endSec;
  }

  const updatedScenes = scenes.map((sc, idx) => {
    const win = sceneWindows[idx] || { startSec: 0, endSec: 5, dur: 5 };

    const sceneWords = scribeResult.words
      .filter((w) => {
        const wMid = (w.start + w.end) / 2;
        return idx === scenes.length - 1
          ? wMid >= win.startSec
          : wMid >= win.startSec && wMid < win.endSec;
      })
      .map((w) => ({
        text: w.text,
        start: Number(Math.max(0, w.start - win.startSec).toFixed(2)),
        end: Number(Math.max(0.15, Math.min(win.dur, w.end - win.startSec)).toFixed(2))
      }));

    const sceneSegments = buildSubtitleSegmentsFromScribeWords(sceneWords, {
      maxWords: 6,
      minWordsForBreak: 3,
      minWordsForComma: 4
    });

    return {
      ...sc,
      audio: {
        ...(sc.audio || {}),
        subtitleSegments:
          sceneSegments.length > 0 ? sceneSegments : sc?.audio?.subtitleSegments || [],
        words: sceneWords,
        subtitleSource: 'scribe_v3_merged'
      }
    };
  });

  return {
    ...masterPayload,
    subtitles: {
      ...(masterPayload.subtitles || {}),
      provider: 'elevenlabs_scribe_v3',
      text: scribeResult.text,
      words: scribeResult.words,
      segments: scribeResult.segments,
      srt: scribeResult.srt
    },
    llmDirective: {
      ...(masterPayload.llmDirective || {}),
      structuredScript: {
        ...structuredScript,
        scenes: updatedScenes
      }
    },
    structuredScript: {
      ...structuredScript,
      scenes: updatedScenes
    },
    scenes: updatedScenes
  };
}

function applyVoiceDirectionToScene({
  text,
  voiceDirection,
  voiceSettings,
  modelId,
  preset = 'default',
  sceneRole = 'body'
}) {
  const preserveTags = modelSupportsAudioTags(modelId);
  let spokenText = normalizeTextForSpeech(text, { preserveTags });
  const nextSettings = { ...voiceSettings };

  if (!voiceDirection || typeof voiceDirection !== 'object') {
    return { spokenText, voiceSettings: nextSettings };
  }

  const pauseBeforeMs = Number(voiceDirection.pauseBeforeMs || 0);
  const pauseAfterMs = Number(voiceDirection.pauseAfterMs || 0);
  const normalizedPreset = normalizePresetForAudio(preset);
  const isAtmosphericCta =
    sceneRole === 'cta' &&
    ['dark_mystery', 'cinematic', 'documentary'].includes(normalizedPreset);
  const isBoundaryScene = sceneRole === 'hook' || sceneRole === 'cta';

  if (pauseBeforeMs >= 500 && !spokenText.startsWith('...')) {
    spokenText = `... ${spokenText}`;
  }
  if (pauseAfterMs >= 500 && !/[.!?…\]\s]$/.test(spokenText)) {
    spokenText = `${spokenText}...`;
  }

  if (voiceDirection.energyShift === 'slight_up') {
    if (!isAtmosphericCta && typeof nextSettings.speed === 'number') {
      nextSettings.speed = clampNumber(
        nextSettings.speed + 0.01,
        GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
        1.02,
        2
      );
    }
    if (typeof nextSettings.style === 'number') {
      nextSettings.style = isBoundaryScene
        ? 0
        : clampNumber(
            nextSettings.style,
            GLOBALS.SAFETY_LIMITS.voiceStyle.min,
            0.05,
            2
          );
    }
    if (typeof nextSettings.stability === 'number') {
      const targetStability = isBoundaryScene
        ? Math.max(nextSettings.stability, 0.72)
        : nextSettings.stability;
      nextSettings.stability = clampNumber(
        targetStability,
        GLOBALS.SAFETY_LIMITS.voiceStability.min,
        GLOBALS.SAFETY_LIMITS.voiceStability.max,
        2
      );
    }
  } else if (voiceDirection.energyShift === 'slight_down') {
    if (typeof nextSettings.speed === 'number') {
      nextSettings.speed = clampNumber(
        nextSettings.speed - 0.02,
        GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
        GLOBALS.SAFETY_LIMITS.voiceSpeed.max,
        2
      );
    }
    if (typeof nextSettings.style === 'number') {
      nextSettings.style = isBoundaryScene
        ? 0
        : clampNumber(
            nextSettings.style,
            GLOBALS.SAFETY_LIMITS.voiceStyle.min,
            0.05,
            2
          );
    }
    if (typeof nextSettings.stability === 'number') {
      const bumpedStability = nextSettings.stability + 0.02;
      nextSettings.stability = clampNumber(
        isBoundaryScene ? Math.max(bumpedStability, 0.72) : bumpedStability,
        GLOBALS.SAFETY_LIMITS.voiceStability.min,
        GLOBALS.SAFETY_LIMITS.voiceStability.max,
        2
      );
    }
  }

  if (isBoundaryScene) {
    if (typeof nextSettings.stability === 'number') {
      nextSettings.stability = clampNumber(
        Math.max(nextSettings.stability, 0.72),
        GLOBALS.SAFETY_LIMITS.voiceStability.min,
        GLOBALS.SAFETY_LIMITS.voiceStability.max,
        2
      );
    }
    nextSettings.style = 0;
  }

  if (sceneRole === 'cta') {
    if (typeof nextSettings.stability === 'number') {
      nextSettings.stability = clampNumber(
        Math.max(nextSettings.stability, 0.78),
        GLOBALS.SAFETY_LIMITS.voiceStability.min,
        GLOBALS.SAFETY_LIMITS.voiceStability.max,
        2
      );
    }
    nextSettings.style = 0;

    spokenText = spokenText
      .replace(/^\s*\[emphasis\]\s*/i, '')
      .replace(/^(\[[^\]]+\]\s*)+(\S+)\s+\[emphasis\]/i, '$1$2')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  return { spokenText, voiceSettings: nextSettings };
}


function resolveVoiceId({ requestedVoiceId, userPlan = 'free_trial' }) {
  const defaultFreeId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'xfcOcwRJ5AZQ8qZsQMw2';
  const policy = resolvePlanPolicy(userPlan);
  const isPaidPlan = Boolean(policy.allowProVoices);

  if (!requestedVoiceId) {
    return {
      voiceId: defaultFreeId,
      voiceKey: 'default',
      voiceName: null,
      downgradedFromPro: false
    };
  }

  const normalized = String(requestedVoiceId).toLowerCase().trim();
  const matchedEntry = Object.entries(VOICE_CATALOG).find(
    ([key, item]) =>
      key.toLowerCase() === normalized ||
      String(item.name || '').toLowerCase() === normalized ||
      String(item.voiceName || '').toLowerCase() === normalized ||
      String(item.id || '').toLowerCase() === normalized
  );

  if (matchedEntry) {
    const [key, item] = matchedEntry;
    const resolvedName = item.voiceName || item.name || key;
    if (!item.id) {
      return {
        voiceId: defaultFreeId,
        voiceKey: key,
        voiceName: resolvedName,
        downgradedFromPro: false
      };
    }
    if (item.tier === 'pro' && !isPaidPlan) {
      return {
        voiceId: defaultFreeId,
        voiceKey: 'default_free_fallback',
        voiceName: resolvedName,
        downgradedFromPro: true
      };
    }
    return {
      voiceId: item.id,
      voiceKey: key,
      voiceName: resolvedName,
      downgradedFromPro: false
    };
  }

  return {
    voiceId: requestedVoiceId,
    voiceKey: 'custom_id',
    voiceName: null,
    downgradedFromPro: false
  };
}

function getVoiceTuningByTone(tone = 'engaging', preset = 'default', voiceKey = 'default') {
  const normalizedTone = normalizeKey(tone, TONE_ALIASES, {}, 'engaging');
  const normalizedPreset = normalizePresetForAudio(preset);

  const tonePresets = {
    dramatic: {
      stability: 0.62,
      similarity_boost: 0.78,
      style: 0.04,
      use_speaker_boost: true,
      speed: 0.96
    },
    storytelling: {
      stability: 0.65,
      similarity_boost: 0.78,
      style: 0.0,
      use_speaker_boost: true,
      speed: 0.98
    },
    engaging: {
      stability: 0.65,
      similarity_boost: 0.78,
      style: 0.0,
      use_speaker_boost: true,
      speed: 0.99
    },
    dynamic: {
      stability: 0.65,
      similarity_boost: 0.78,
      style: 0.0,
      use_speaker_boost: true,
      speed: 0.99
    },
    calm: {
      stability: 0.72,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true,
      speed: 0.95
    },
    direct: {
      stability: 0.68,
      similarity_boost: 0.78,
      style: 0.0,
      use_speaker_boost: true,
      speed: 1.0
    }
  };

  const presetBase =
    (normalizedPreset !== 'default' && PRESET_VOICE_SETTINGS[normalizedPreset]) ||
    null;
  const toneBase = tonePresets[normalizedTone] || tonePresets.engaging;
  const presetMod = getPresetVoiceModifiers(normalizedPreset, voiceKey);
  const voiceOverride = VOICE_PRESET_OVERRIDES[voiceKey]?.[normalizedPreset] || {};

  const rawStability = presetBase
    ? typeof voiceOverride.stability === 'number'
      ? voiceOverride.stability
      : presetBase.stability + (typeof voiceOverride.stabilityDelta === 'number' ? voiceOverride.stabilityDelta : 0)
    : typeof voiceOverride.stability === 'number'
      ? voiceOverride.stability
      : toneBase.stability + presetMod.stabilityDelta;

  const rawStyle = presetBase
    ? typeof voiceOverride.style === 'number'
      ? voiceOverride.style
      : presetBase.style + (typeof voiceOverride.styleDelta === 'number' ? voiceOverride.styleDelta : 0)
    : typeof voiceOverride.style === 'number'
      ? voiceOverride.style
      : toneBase.style + presetMod.styleDelta;

  const rawSpeed = presetBase
    ? typeof voiceOverride.speed === 'number'
      ? voiceOverride.speed
      : presetBase.speed + (typeof voiceOverride.speedDelta === 'number' ? voiceOverride.speedDelta : 0)
    : typeof voiceOverride.speed === 'number'
      ? voiceOverride.speed
      : toneBase.speed + presetMod.speedDelta;

  const rawSimilarity =
    typeof voiceOverride.similarity_boost === 'number'
      ? voiceOverride.similarity_boost
      : typeof presetBase?.similarity_boost === 'number'
        ? presetBase.similarity_boost
        : toneBase.similarity_boost;

  const rawSpeakerBoost =
    typeof voiceOverride.use_speaker_boost === 'boolean'
      ? voiceOverride.use_speaker_boost
      : typeof presetBase?.use_speaker_boost === 'boolean'
        ? presetBase.use_speaker_boost
        : toneBase.use_speaker_boost;

  return {
    stability: clampNumber(
      rawStability,
      GLOBALS.SAFETY_LIMITS.voiceStability.min,
      GLOBALS.SAFETY_LIMITS.voiceStability.max,
      2
    ),
    similarity_boost: clampNumber(
      rawSimilarity,
      GLOBALS.SAFETY_LIMITS.voiceSimilarity.min,
      GLOBALS.SAFETY_LIMITS.voiceSimilarity.max,
      2
    ),
    style: clampNumber(
      rawStyle,
      GLOBALS.SAFETY_LIMITS.voiceStyle.min,
      GLOBALS.SAFETY_LIMITS.voiceStyle.max,
      2
    ),
    use_speaker_boost: Boolean(rawSpeakerBoost),
    speed: clampNumber(
      rawSpeed,
      GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
      GLOBALS.SAFETY_LIMITS.voiceSpeed.max,
      2
    )
  };
}

function computeSceneSpeed({ text, durationSeconds, baseSpeed, overrideSpeed }) {
  const safeBase =
    typeof baseSpeed === 'number' && !Number.isNaN(baseSpeed) ? baseSpeed : 0.98;

  if (typeof overrideSpeed === 'number' && !Number.isNaN(overrideSpeed)) {
    return clampNumber(
      overrideSpeed,
      GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
      1.02,
      2
    );
  }

  const cleanText = stripBracketTags(text);
  if (!cleanText || !durationSeconds || durationSeconds <= 0) {
    return clampNumber(
      safeBase,
      GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
      1.02,
      2
    );
  }

  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedNaturalSec = words / 2.3;
  const ratio = estimatedNaturalSec / durationSeconds;

  const adjusted = safeBase * Math.max(0.88, Math.min(ratio, 1.03));
  return Number(Math.max(0.85, Math.min(adjusted, 1.02)).toFixed(2));
}

async function generateSceneAudio({
  text,
  cleanSubtitleText = '',
  voiceId,
  jobId,
  sceneNumber,
  modelId,
  sttModelId = null,
  preset = 'default',
  sceneRole = 'body',
  voiceSettings = { stability: 0.5, similarity_boost: 0.75 },
  voiceDirection = null,
  signal
}) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('Falta ELEVENLABS_API_KEY en el archivo .env');
  }

  const cleanVoiceKey = (voiceId || '').toLowerCase();
  const selectedVoiceId =
    VOICE_MAP[cleanVoiceKey] ||
    voiceId ||
    process.env.ELEVENLABS_DEFAULT_VOICE_ID ||
    'xfcOcwRJ5AZQ8qZsQMw2';

  const resolvedModelId = resolveVoiceModelId({
    explicitModelId: modelId,
    preset
  });

  const baseSafeVoiceSettings =
    voiceSettings && typeof voiceSettings.speed === 'number'
      ? {
        ...voiceSettings,
        speed: clampNumber(
          voiceSettings.speed,
          GLOBALS.SAFETY_LIMITS.voiceSpeed.min,
          GLOBALS.SAFETY_LIMITS.voiceSpeed.max,
          2
        )
      }
      : voiceSettings;

  const { spokenText, voiceSettings: safeVoiceSettings } = applyVoiceDirectionToScene({
    text,
    voiceDirection,
    voiceSettings: baseSafeVoiceSettings,
    modelId: resolvedModelId,
    preset,
    sceneRole
  });

  const fileName = `${jobId}_scene_${sceneNumber}.mp3`;
  const filePath = path.join(AUDIO_OUTPUT_DIR, fileName);

  const timestampsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/with-timestamps`;
  let buffer = null;
  let subtitleSegments = [];

  try {
    const tsResponse = await fetch(timestampsUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      signal,
      body: JSON.stringify({
        text: spokenText,
        model_id: resolvedModelId,
        voice_settings: safeVoiceSettings
      })
    });

    if (tsResponse.ok) {
      const tsJson = await tsResponse.json();
      if (tsJson?.audio_base64) {
        buffer = Buffer.from(tsJson.audio_base64, 'base64');
        const alignment = tsJson.normalized_alignment || tsJson.alignment || null;
        subtitleSegments = buildSubtitleSegmentsFromAlignment(
          alignment,
          cleanSubtitleText || stripBracketTags(text),
          6
        );
      }
    }
  } catch (tsErr) {
    console.warn(
      `⚠️ [ElevenLabs] Sin timestamps para escena ${sceneNumber} (${tsErr.message}). Usando endpoint estándar...`
    );
  }

  if (!buffer) {
    const standardUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`;
    const response = await fetch(standardUrl, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      signal,
      body: JSON.stringify({
        text: spokenText,
        model_id: resolvedModelId,
        voice_settings: safeVoiceSettings
      })
    });

    if (!response.ok) {
      const errorDetail = await response.text();
      throw new Error(`ElevenLabs API Error (${response.status}): ${errorDetail}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  fs.writeFileSync(filePath, buffer);

  let scribeData = {
    words: [],
    segments: []
  };

  try {
    scribeData =
      await transcribeAudioWithScribeV3({
        filePath,
        apiKey,
        modelId: sttModelId
      });
  }
  catch (err) {
    console.warn(
      `Scribe failed: ${err.message}`
    );
  }

  return {
    fileName,
    audioUrl: `/audio/${fileName}`,
    voiceIdUsed: selectedVoiceId,
    modelIdUsed: resolvedModelId,
    voiceSettingsUsed: safeVoiceSettings,

    subtitleSegments:
      scribeData.segments,

    words:
      scribeData.words,

    subtitleSource:
      "scribe_v3"
  };
}

async function mergeAudioFiles({ fileNames, mergedFileName }) {
  if (!Array.isArray(fileNames) || fileNames.length <= 1) {
    return null;
  }

  const listFileName = `${mergedFileName}_concat.txt`;
  const listFilePath = path.join(AUDIO_OUTPUT_DIR, listFileName);
  const mergedFilePath = path.join(AUDIO_OUTPUT_DIR, mergedFileName);

  const lines = fileNames.map((name) => {
    const fullPath = path.join(AUDIO_OUTPUT_DIR, name).replace(/\\/g, '/');
    return `file '${fullPath}'`;
  });

  fs.writeFileSync(listFilePath, lines.join('\n'), 'utf8');

  try {
    await execFileAsync(ffmpegPath, [
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listFilePath,
      '-c:a',
      'libmp3lame',
      '-q:a',
      '2',
      mergedFilePath
    ]);

    const stat = fs.statSync(mergedFilePath);
    return {
      fileName: mergedFileName,
      audioUrl: `/audio/${mergedFileName}`,
      sizeBytes: stat.size
    };
  } catch (error) {
    console.warn(`⚠️ [AudioService] No se pudieron fusionar los audios (${error.message}).`);
    return null;
  } finally {
    if (fs.existsSync(listFilePath)) {
      fs.unlinkSync(listFilePath);
    }
  }
}

async function generateAllScenesAudio(rawPayload) {
  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload;

  const structuredScript =
    masterPayload?.llmDirective?.structuredScript ||
    masterPayload?.structuredScript ||
    rawPayload?.llmDirective?.structuredScript ||
    rawPayload?.structuredScript ||
    (Array.isArray(masterPayload?.scenes) ? masterPayload : null);

  if (!structuredScript || !Array.isArray(structuredScript.scenes)) {
    throw new Error(
      'El payload no contiene un arreglo de "scenes" válido. Revisa la estructura del JSON.'
    );
  }

  const llmVoiceConfig =
    masterPayload?.llmDirective?.voiceConfig ||
    rawPayload?.llmDirective?.voiceConfig ||
    {};

  const jobId = masterPayload?.meta?.jobId || rawPayload?.meta?.jobId || `job_${Date.now()}`;
  const userPlan = masterPayload?.meta?.userPlan || rawPayload?.meta?.userPlan || 'free_trial';
  const tone =
    masterPayload?.userInputs?.tone ||
    masterPayload?.script?.tone ||
    rawPayload?.userInputs?.tone ||
    'engaging';
  const preset = normalizePresetForAudio(
    llmVoiceConfig.preset ||
    masterPayload?.llmDirective?.preset ||
    masterPayload?.meta?.preset ||
    masterPayload?.videoConfig?.preset ||
    masterPayload?.userInputs?.preset ||
    masterPayload?.video?.preset ||
    rawPayload?.videoConfig?.preset ||
    rawPayload?.userInputs?.preset ||
    'default'
  );
  const endingBufferSeconds =
    typeof masterPayload?.orchestration?.endingBufferSeconds === 'number'
      ? masterPayload.orchestration.endingBufferSeconds
      : structuredScript.endingBufferSeconds ?? 1.5;

  const requestedVoiceId =
    masterPayload?.userInputs?.voiceId ||
    masterPayload?.voiceConfig?.voiceId ||
    masterPayload?.voice?.voiceId ||
    masterPayload?.config?.voiceId ||
    rawPayload?.voiceConfig?.voiceId ||
    llmVoiceConfig.voiceId ||
    llmVoiceConfig.voiceSlot ||
    llmVoiceConfig.voiceName ||
    masterPayload?.meta?.voice ||
    masterPayload?.meta?.voiceName ||
    masterPayload?.userInputs?.voice ||
    masterPayload?.userInputs?.voiceName ||
    process.env.ELEVENLABS_DEFAULT_VOICE_ID;

  const explicitModelId =
    masterPayload?.voiceConfig?.modelId ||
    masterPayload?.voice?.modelId ||
    llmVoiceConfig.modelId ||
    masterPayload?.llmDirective?.voiceModelId ||
    rawPayload?.voiceConfig?.modelId;

  const modelId = resolveVoiceModelId({
    explicitModelId,
    preset,
    userPlan
  });

  const sttModelId = resolveAiModelId('stt', {
    explicitModelId:
      masterPayload?.subtitles?.modelId ||
      masterPayload?.voiceConfig?.sttModelId ||
      masterPayload?.meta?.sttModelId
  });

  const resolvedVoice = resolveVoiceId({ requestedVoiceId, userPlan });
  const resolvedVoiceName =
    resolvedVoice.voiceName ||
    llmVoiceConfig.voiceName ||
    masterPayload?.meta?.voiceName ||
    null;
  const baseTuning = getVoiceTuningByTone(tone, preset, resolvedVoice.voiceKey);

  if (resolvedVoice.downgradedFromPro) {
    console.warn(
      `🔒 [ElevenLabs] Voz "${requestedVoiceId}" es Pro y el plan es "${userPlan}". Usando voz gratuita por defecto.`
    );
  }

  console.log(
    `🎙️ [ElevenLabs] Generando audio para ${structuredScript.scenes.length} escenas | Voz: [${resolvedVoice.voiceKey}${resolvedVoiceName ? `:${resolvedVoiceName}` : ''}:${resolvedVoice.voiceId}] | Modelo: [${modelId}] | Tono: [${tone}] | Preset: [${preset}] (Job: ${jobId})...`
  );

  const updatedScenes = [];

  async function generateSceneAudioWithRetry(scenePayload, maxRetries = 3, timeoutMs = 30000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const audioResult = await generateSceneAudio({
          ...scenePayload,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        return audioResult;
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn(
          `⚠️ [ElevenLabs] Intento ${attempt}/${maxRetries} fallido para escena ${scenePayload.sceneNumber} (${error.message}). Reintentando...`
        );

        if (attempt === maxRetries) {
          throw new Error(
            `Fallo definitivo en ElevenLabs para la escena ${scenePayload.sceneNumber} tras ${maxRetries} intentos: ${error.message}`
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  for (const scene of structuredScript.scenes) {
    const sourceText = scene.spokenText || scene.voiceoverText || '';
    const cleanSubtitleText = scene.voiceoverText || stripBracketTags(sourceText);
    const sceneSpeed = computeSceneSpeed({
      text: sourceText,
      durationSeconds: scene.durationSeconds,
      baseSpeed: baseTuning.speed,
      overrideSpeed:
        masterPayload?.voiceConfig?.speakingRate || masterPayload?.voice?.speakingRate
    });

    const sceneVoiceSettings = {
      stability:
        typeof masterPayload?.voiceConfig?.stability === 'number'
          ? masterPayload.voiceConfig.stability
          : baseTuning.stability,
      similarity_boost:
        typeof masterPayload?.voiceConfig?.similarityBoost === 'number'
          ? masterPayload.voiceConfig.similarityBoost
          : baseTuning.similarity_boost,
      style:
        typeof masterPayload?.voiceConfig?.style === 'number'
          ? masterPayload.voiceConfig.style
          : baseTuning.style,
      use_speaker_boost:
        typeof masterPayload?.voiceConfig?.useSpeakerBoost === 'boolean'
          ? masterPayload.voiceConfig.useSpeakerBoost
          : baseTuning.use_speaker_boost,
      speed: sceneSpeed
    };

    console.log(
      `   🔊 Sintetizando escena ${scene.sceneNumber} (speed=${sceneSpeed}): "${sourceText}"`
    );

    const audioResult = await generateSceneAudioWithRetry({
      text: sourceText,
      cleanSubtitleText,
      voiceId: resolvedVoice.voiceId,
      modelId,
      sttModelId,
      preset,
      sceneRole: scene.role || 'body',
      voiceSettings: sceneVoiceSettings,
      voiceDirection: scene.voiceDirection || null,
      jobId,
      sceneNumber: scene.sceneNumber
    });

    updatedScenes.push({
      ...scene,
      voiceSlot: scene.voiceSlot || resolvedVoice.voiceKey,
      voiceName: scene.voiceName || resolvedVoiceName,
      voiceId: scene.voiceId || resolvedVoice.voiceId,
      audio: audioResult
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  const mergedAudio = await mergeAudioFiles({
    fileNames: updatedScenes.map((sc) => sc?.audio?.fileName).filter(Boolean),
    mergedFileName: `${jobId}_voiceover_merged.mp3`
  });

  return {
    ...masterPayload,
    voice: {
      ...(masterPayload.voice || {}),
      provider: 'elevenlabs',
      modelId,
      tone,
      preset,
      endingBufferSeconds,
      voiceKey: resolvedVoice.voiceKey,
      voiceName: resolvedVoiceName,
      voiceId: resolvedVoice.voiceId,
      downgradedFromPro: resolvedVoice.downgradedFromPro,
      mergedAudio
    },
    llmDirective: {
      ...(masterPayload.llmDirective || {}),
      structuredScript: {
        ...structuredScript,
        scenes: updatedScenes
      }
    },
    structuredScript: {
      ...structuredScript,
      scenes: updatedScenes
    },
    scenes: updatedScenes
  };
}

async function generateDialogueAudio(rawPayload) {
  const payload = rawPayload?.payload || rawPayload?.data || rawPayload || {};
  const dialogueObj = payload.dialogue || payload;
  const turns = Array.isArray(dialogueObj.turns) ? dialogueObj.turns : [];

  if (turns.length === 0) {
    throw new Error('El payload de diálogo no contiene un arreglo "turns" válido.');
  }

  const jobId = payload?.meta?.jobId || payload.jobId || `dialogue_${Date.now()}`;
  const userPlan = payload?.meta?.userPlan || payload.userPlan || 'free_trial';
  const tone = payload?.userInputs?.tone || payload.tone || 'storytelling';
  const preset = normalizePresetForAudio(payload.preset || 'default');
  const modelId = resolveVoiceModelId({
    explicitModelId: payload.modelId,
    preset,
    userPlan
  });

  const segments = [];

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    const turnNumber = Number(turn.turnNumber) || i + 1;
    const requestedVoice = turn.voiceId || turn.speaker;
    const resolvedVoice = resolveVoiceId({ requestedVoiceId: requestedVoice, userPlan });
    const tuning = getVoiceTuningByTone(tone, preset, resolvedVoice.voiceKey);

    const audioResult = await generateSceneAudio({
      text: turn.line || turn.text || '',
      voiceId: resolvedVoice.voiceId,
      jobId,
      sceneNumber: turnNumber,
      modelId,
      preset,
      sceneRole: 'body',
      voiceSettings: tuning,
      voiceDirection: turn.voiceDirection || null
    });

    segments.push({
      ...turn,
      turnNumber,
      voiceKey: resolvedVoice.voiceKey,
      voiceName: resolvedVoice.voiceName,
      downgradedFromPro: resolvedVoice.downgradedFromPro,
      audio: audioResult
    });
  }

  const mergedAudio = await mergeAudioFiles({
    fileNames: segments.map((s) => s.audio.fileName),
    mergedFileName: `${jobId}_merged.mp3`
  });

  return {
    jobId,
    preset,
    userPlan,
    mergedAudio,
    turns: segments
  };
}

module.exports = {
  VOICE_MAP,
  VOICE_CATALOG,
  getVoiceTuningByTone,
  getPresetVoiceModifiers,
  generateSceneAudio,
  generateAllScenesAudio,
  generateDialogueAudio,
  transcribeMergedJobAudio
};
