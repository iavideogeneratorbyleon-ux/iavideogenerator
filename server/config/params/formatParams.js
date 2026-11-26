// server/config/params/formatParams.js
const FORMAT_CATALOG = {
  '16:9': {
    key: '16:9',
    label: 'Landscape (16:9)',
    orientation: 'landscape',
    resolutions: {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 }
    },
    defaultResolution: '720p',
    promptFraming:
      'Wide horizontal 16:9 composition, cinematic widescreen framing, balanced rule-of-thirds layout, generous lateral environmental depth, avoid tight vertical portrait cropping.',
    safeZones: {
      topMarginRatio: 0.08,
      bottomMarginRatio: 0.12,
      subtitleBottomRatio: 0.88,
      subtitleMaxWidthRatio: 0.82
    }
  },
  '9:16': {
    key: '9:16',
    label: 'Vertical (9:16)',
    orientation: 'portrait',
    resolutions: {
      '720p': { width: 720, height: 1280 },
      '1080p': { width: 1080, height: 1920 }
    },
    defaultResolution: '720p',
    promptFraming:
      'Vertical 9:16 mobile framing, primary subject centered with comfortable headroom at top and clean breathing room at bottom for captions and UI.',
    safeZones: {
      topMarginRatio: 0.12,
      bottomMarginRatio: 0.2,
      subtitleBottomRatio: 0.84,
      subtitleMaxWidthRatio: 0.84
    }
  },
  '1:1': {
    key: '1:1',
    label: 'Square (1:1)',
    orientation: 'square',
    resolutions: {
      '720p': { width: 720, height: 720 },
      '1080p': { width: 1080, height: 1080 }
    },
    defaultResolution: '720p',
    promptFraming:
      'Balanced 1:1 square composition, clear central focal point, clean framing with balanced margins on all sides.',
    safeZones: {
      topMarginRatio: 0.1,
      bottomMarginRatio: 0.14,
      subtitleBottomRatio: 0.86,
      subtitleMaxWidthRatio: 0.84
    }
  }
};

function resolveFormatParams({ aspectRatio = '16:9', resolution = '720p', overrides = {} } = {}) {
  const ratioKey = Object.prototype.hasOwnProperty.call(FORMAT_CATALOG, aspectRatio)
    ? aspectRatio
    : '16:9';
  const base = FORMAT_CATALOG[ratioKey];
  const resKey = Object.prototype.hasOwnProperty.call(base.resolutions, resolution)
    ? resolution
    : base.defaultResolution;
  const dims = base.resolutions[resKey];

  return {
    ...base,
    ...(overrides[ratioKey] || {}),
    aspectRatio: ratioKey,
    resolution: resKey,
    width: dims.width,
    height: dims.height
  };
}

module.exports = {
  FORMAT_CATALOG,
  resolveFormatParams
};
