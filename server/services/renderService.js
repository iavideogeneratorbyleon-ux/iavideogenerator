require('dotenv').config();
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const ffprobePath = require('ffprobe-static').path;
const { GLOBALS, getPresetSubtitleStyle } = require('../config/globals');
const { clampNumber, normalizeKey, resolvePlanPolicy } = require('../utils/sharedHelpers');
const { buildBaseVideoFilter } = require('../utils/cameraMotion');
const { renderWatermarkPng } = require('../utils/watermark');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const VIDEO_OUTPUT_DIR = path.join(PUBLIC_DIR, 'videos');
const TEMP_DIR = path.join(PUBLIC_DIR, 'temp_render');

[VIDEO_OUTPUT_DIR, TEMP_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const PRESET_CONFIGS = {
  netflix: {
    key: 'netflix',
    label: 'Netflix',
    motion: 'slow_zoom_in',
    eqFilter: 'eq=contrast=1.06:brightness=-0.02:saturation=0.95',
    paidSubtitles: getPresetSubtitleStyle('netflix')
  },
  mr_beast: {
    key: 'mr_beast',
    label: 'Mr Beast',
    motion: 'punch_zoom_in',
    eqFilter: 'eq=contrast=1.12:brightness=0.02:saturation=1.22',
    paidSubtitles: getPresetSubtitleStyle('mr_beast')
  },
  tiktok_viral: {
    key: 'tiktok_viral',
    label: 'TikTok Viral',
    motion: 'dynamic_pan',
    eqFilter: 'eq=contrast=1.08:brightness=0.01:saturation=1.15',
    paidSubtitles: getPresetSubtitleStyle('tiktok_viral')
  },
  luxury: {
    key: 'luxury',
    label: 'Luxury',
    motion: 'smooth_drift',
    eqFilter: 'eq=contrast=1.05:brightness=-0.01:saturation=0.92',
    paidSubtitles: getPresetSubtitleStyle('luxury_brand')
  },
  luxury_brand: {
    key: 'luxury_brand',
    label: 'Luxury Brand',
    motion: 'smooth_drift',
    eqFilter: 'eq=contrast=1.05:brightness=-0.01:saturation=0.92',
    paidSubtitles: getPresetSubtitleStyle('luxury_brand')
  },
  tech: {
    key: 'tech',
    label: 'Tech',
    motion: 'clean_zoom_out',
    eqFilter: 'eq=contrast=1.09:brightness=0.0:saturation=1.05',
    paidSubtitles: getPresetSubtitleStyle('tech_modern')
  },
  tech_modern: {
    key: 'tech_modern',
    label: 'Tech Modern',
    motion: 'clean_zoom_out',
    eqFilter: 'eq=contrast=1.09:brightness=0.0:saturation=1.05',
    paidSubtitles: getPresetSubtitleStyle('tech_modern')
  },
  dark_mystery: {
    key: 'dark_mystery',
    label: 'Dark Mystery',
    motion: 'slow_zoom_in',
    eqFilter: 'eq=contrast=1.08:brightness=-0.03:saturation=0.9',
    paidSubtitles: getPresetSubtitleStyle('dark_mystery')
  },
  documentary: {
    key: 'documentary',
    label: 'Documentary',
    motion: 'slow_zoom_in',
    eqFilter: 'eq=contrast=1.05:brightness=-0.01:saturation=0.95',
    paidSubtitles: getPresetSubtitleStyle('documentary')
  },
  cinematic: {
    key: 'cinematic',
    label: 'Cinematic',
    motion: 'smooth_drift',
    eqFilter: 'eq=contrast=1.08:brightness=-0.02:saturation=0.96',
    paidSubtitles: getPresetSubtitleStyle('cinematic')
  },
  educational: {
    key: 'educational',
    label: 'Educational',
    motion: 'clean_zoom_out',
    eqFilter: 'eq=contrast=1.05:brightness=0.01:saturation=1.04',
    paidSubtitles: getPresetSubtitleStyle('educational')
  },
  default: {
    key: 'default',
    label: 'Default',
    motion: 'slow_zoom_in',
    eqFilter: 'eq=contrast=1.03:brightness=0.0:saturation=1.04',
    paidSubtitles: getPresetSubtitleStyle('default')
  }
};

function resolveOptionalCanvasModule() {
  for (const modName of ['@napi-rs/canvas', 'canvas']) {
    try {
      const mod = require(modName);
      if (mod && typeof mod.createCanvas === 'function') {
        return { modName, mod };
      }
    } catch (_) {
      // Fallback a BITMAP_5X7 si no está instalada la librería
    }
  }
  return null;
}

const OPTIONAL_CANVAS = resolveOptionalCanvasModule();
const REGISTERED_FONT_FILES = new Set();

function resolveFontFilePath(fontFile) {
  if (!fontFile || typeof fontFile !== 'string') return null;
  const trimmed = fontFile.trim();
  if (!trimmed) return null;
  if (path.isAbsolute(trimmed) && fs.existsSync(trimmed)) return trimmed;
  const fromRoot = path.resolve(process.cwd(), trimmed);
  if (fs.existsSync(fromRoot)) return fromRoot;
  const fromService = path.resolve(__dirname, trimmed);
  if (fs.existsSync(fromService)) return fromService;
  return null;
}

function ensurePresetFontLoaded(paidStyle = {}) {
  const fontFile = resolveFontFilePath(paidStyle.fontFile);
  const fontFamily = String(paidStyle.fontFamily || '').trim();

  if (
    OPTIONAL_CANVAS?.mod &&
    typeof OPTIONAL_CANVAS.mod.GlobalFonts?.registerFromPath === 'function' &&
    fontFile &&
    !REGISTERED_FONT_FILES.has(fontFile)
  ) {
    try {
      OPTIONAL_CANVAS.mod.GlobalFonts.registerFromPath(fontFile, fontFamily || undefined);
      REGISTERED_FONT_FILES.add(fontFile);
    } catch (_) {
      // Continuar con el nombre de familia si ya existe en el sistema
    }
  }

  return fontFamily || 'Inter';
}

function rgbaArrayToCss([r = 255, g = 255, b = 255, a = 255] = []) {
  const alpha = clampNumber(Number(a) / 255, 0, 1, 1);
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

function wrapCanvasLines(ctx, text, maxWidthPx) {
  const words = sanitizeSubtitleRenderText(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidthPx) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (ctx.measureText(word).width > maxWidthPx) {
        let chunk = '';
        for (const ch of Array.from(word)) {
          const nextChunk = `${chunk}${ch}`;
          if (ctx.measureText(nextChunk).width <= maxWidthPx) {
            chunk = nextChunk;
          } else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function renderSubtitleWithCanvas({
  cleanText,
  pngPath,
  width,
  height,
  aspectRatio,
  subtitleMode,
  presetConfig
}) {
  if (!OPTIONAL_CANVAS?.mod) return null;

  try {
    const { createCanvas } = OPTIONAL_CANVAS.mod;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    const isPaidStyled = subtitleMode === 'preset_styled';
    const paidStyle = presetConfig?.paidSubtitles || getPresetSubtitleStyle('default');

    const baseFontSize =
      aspectRatio === '9:16'
        ? Math.max(36, Math.round(width * 0.052))
        : Math.max(34, Math.round(height * 0.045));
    const fontSize = isPaidStyled
      ? Math.max(28, Math.round(baseFontSize * (paidStyle.fontScale || 1)))
      : baseFontSize;

    const fontFamily = isPaidStyled ? ensurePresetFontLoaded(paidStyle) : 'Inter';
    const fontWeight = isPaidStyled ? String(paidStyle.fontWeight || '700') : '700';

    ctx.font = `${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const textColor = isPaidStyled ? paidStyle.rgba : [255, 255, 255, 255];
    const outlineColor = isPaidStyled ? paidStyle.outlineRgba : [0, 0, 0, 225];
    const boxColor = isPaidStyled ? paidStyle.boxRgba : [0, 0, 0, 0];
    const shouldDrawBox = isPaidStyled
      ? paidStyle.showBox === true && Array.isArray(boxColor) && Number(boxColor[3]) > 0
      : Array.isArray(boxColor) && Number(boxColor[3]) > 0;

    const widthRatio = isPaidStyled ? (paidStyle.maxLineWidthRatio || 0.84) : 0.84;
    const maxLineWidthPx = Math.round(width * widthRatio);
    const lines = wrapCanvasLines(ctx, cleanText, maxLineWidthPx);
    if (!lines.length) return null;

    const gapScale = isPaidStyled ? (paidStyle.lineGapScale || 1.4) : 1.4;
    const lineHeightPx = Math.round(fontSize * 1.15);
    const lineGapPx = Math.max(6, Math.round(fontSize * 0.25 * (gapScale / 1.4)));
    const totalTextHeight = lines.length * lineHeightPx + (lines.length - 1) * lineGapPx;

    const bottomRatio = isPaidStyled
      ? (aspectRatio === '9:16' ? paidStyle.bottomRatio9x16 : paidStyle.bottomRatioDefault) ||
        (aspectRatio === '9:16' ? 0.84 : 0.88)
      : aspectRatio === '9:16'
        ? 0.84
        : 0.88;

    const centerX = Math.round(width / 2);
    const bottomAnchorY = Math.round(height * bottomRatio);
    const blockTopY = Math.max(20, bottomAnchorY - totalTextHeight);

    if (shouldDrawBox) {
      const longestLineW = Math.max(...lines.map((l) => ctx.measureText(l).width));
      const padX = Math.round(fontSize * 0.45);
      const padY = Math.round(fontSize * 0.25);
      const boxW = Math.min(width - 24, Math.round(longestLineW + padX * 2));
      const boxH = Math.round(totalTextHeight + padY * 2);
      const boxX = Math.max(12, Math.round(centerX - boxW / 2));
      const boxY = Math.max(12, Math.round(blockTopY - padY));

      ctx.fillStyle = rgbaArrayToCss(boxColor);
      ctx.fillRect(boxX, boxY, boxW, boxH);
    }

    lines.forEach((line, idx) => {
      const y = blockTopY + idx * (lineHeightPx + lineGapPx);
      if (Array.isArray(outlineColor) && Number(outlineColor[3]) > 0) {
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.12));
        ctx.strokeStyle = rgbaArrayToCss(outlineColor);
        ctx.strokeText(line, centerX, y);
      }
      ctx.fillStyle = rgbaArrayToCss(textColor);
      ctx.fillText(line, centerX, y);
    });

    const buf = canvas.toBuffer('image/png');
    fs.writeFileSync(pngPath, buf);
    return pngPath;
  } catch (_) {
    return null;
  }
}

// Mapa de glifos 5x7 para codificar texto limpio en PNG transparente sin dependencias externas
const BITMAP_5X7 = {
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11100', '10010', '10001', '10001', '10001', '10010', '11100'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  0: ['01110', '10011', '10101', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  6: ['01110', '10000', '11110', '10001', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00110', '00110'],
  ',': ['00000', '00000', '00000', '00000', '00110', '00110', '01100'],
  ':': ['00000', '00110', '00110', '00000', '00110', '00110', '00000'],
  ';': ['00000', '00110', '00110', '00000', '00110', '00110', '01100'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  "'": ['00110', '00110', '00100', '00000', '00000', '00000', '00000'],
  '"': ['01010', '01010', '01010', '00000', '00000', '00000', '00000'],
  '/': ['00001', '00010', '00100', '00100', '01000', '10000', '00000'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '%': ['11001', '11010', '00100', '01000', '01011', '10011', '00000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000']
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makePngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([lenBuf, combined, crcBuf]);
}

function encodeRgbaToPngBuffer(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter type 0
    rgba.copy(raw, rowStart + 1, y * stride, (y + 1) * stride);
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([
    signature,
    makePngChunk('IHDR', ihdr),
    makePngChunk('IDAT', compressed),
    makePngChunk('IEND', Buffer.alloc(0))
  ]);
}

function sanitizeSubtitleRenderText(text = '') {
  return String(text || '')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizeGlyphChar(ch) {
  const folded = String(ch || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
  return BITMAP_5X7[folded] ? folded : '?';
}

function wrapBitmapLines(text, maxCharsPerLine) {
  const words = sanitizeSubtitleRenderText(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (word.length > maxCharsPerLine) {
        for (let i = 0; i < word.length; i += maxCharsPerLine) {
          lines.push(word.slice(i, i + maxCharsPerLine));
        }
        current = '';
      } else {
        current = word;
      }
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function blendPixel(rgba, width, height, x, y, [r, g, b, a]) {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || py < 0 || px >= width || py >= height || a <= 0) return;

  const idx = (py * width + px) * 4;
  const alpha = Math.min(1, a / 255);
  const invAlpha = 1 - alpha;

  rgba[idx] = Math.round(r * alpha + rgba[idx] * invAlpha);
  rgba[idx + 1] = Math.round(g * alpha + rgba[idx + 1] * invAlpha);
  rgba[idx + 2] = Math.round(b * alpha + rgba[idx + 2] * invAlpha);
  const nextAlpha = Math.max(rgba[idx + 3], Math.round(alpha * 255));
  rgba[idx + 3] = nextAlpha;
}

function fillRectBlend(rgba, width, height, x0, y0, w, h, color) {
  const startX = Math.max(0, Math.floor(x0));
  const startY = Math.max(0, Math.floor(y0));
  const endX = Math.min(width, Math.ceil(x0 + w));
  const endY = Math.min(height, Math.ceil(y0 + h));

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      blendPixel(rgba, width, height, x, y, color);
    }
  }
}

function drawBitmapTextLine(rgba, width, height, line, centerX, topY, scale, color, outlineColor) {
  const chars = Array.from(line);
  const charAdvance = 6 * scale;
  const lineWidth = chars.length * charAdvance - scale;
  const startX = Math.round(centerX - lineWidth / 2);
  const outlinePx = Math.max(1, Math.round(scale * 0.45));

  chars.forEach((rawCh, cIdx) => {
    const glyph = BITMAP_5X7[normalizeGlyphChar(rawCh)];
    const gx = startX + cIdx * charAdvance;

    for (let row = 0; row < 7; row++) {
      const bits = glyph[row];
      for (let col = 0; col < 5; col++) {
        if (bits[col] !== '1') continue;
        const px = gx + col * scale;
        const py = topY + row * scale;

        if (outlineColor && outlineColor[3] > 0) {
          fillRectBlend(rgba, width, height, px - outlinePx, py, scale, scale, outlineColor);
          fillRectBlend(rgba, width, height, px + outlinePx, py, scale, scale, outlineColor);
          fillRectBlend(rgba, width, height, px, py - outlinePx, scale, scale, outlineColor);
          fillRectBlend(rgba, width, height, px, py + outlinePx, scale, scale, outlineColor);
        }

        fillRectBlend(rgba, width, height, px, py, scale, scale, color);
      }
    }
  });
}

function renderSubtitleSegmentPng({
  text,
  pngPath,
  width,
  height,
  aspectRatio,
  subtitleMode,
  presetConfig
}) {
  const cleanText = sanitizeSubtitleRenderText(text);
  if (!cleanText) return null;

  const canvasRendered = renderSubtitleWithCanvas({
    cleanText,
    pngPath,
    width,
    height,
    aspectRatio,
    subtitleMode,
    presetConfig
  });
  if (canvasRendered) return canvasRendered;

  const isPaidStyled = subtitleMode === 'preset_styled';
  const paidStyle = presetConfig?.paidSubtitles || getPresetSubtitleStyle('default');

  const baseScale = aspectRatio === '9:16' ? Math.max(3, Math.round(width / 160)) : Math.max(3, Math.round(height / 180));
  const scale = isPaidStyled
    ? Math.max(3, Math.round(baseScale * (paidStyle.fontScale || 1)))
    : baseScale;

  const textColor = isPaidStyled ? paidStyle.rgba : [255, 255, 255, 255];
  const outlineColor = isPaidStyled ? paidStyle.outlineRgba : [0, 0, 0, 225];
  const boxColor = isPaidStyled ? paidStyle.boxRgba : [0, 0, 0, 0];
  const shouldDrawBox = isPaidStyled
    ? paidStyle.showBox === true && Array.isArray(boxColor) && Number(boxColor[3]) > 0
    : Array.isArray(boxColor) && Number(boxColor[3]) > 0;

  const widthRatio = isPaidStyled ? (paidStyle.maxLineWidthRatio || 0.84) : 0.84;
  const maxLineWidthPx = Math.round(width * widthRatio);
  const charAdvance = 6 * scale;
  const maxCharsPerLine = Math.max(10, Math.floor(maxLineWidthPx / charAdvance));
  const lines = wrapBitmapLines(cleanText, maxCharsPerLine);
  if (!lines.length) return null;

  const gapScale = isPaidStyled ? (paidStyle.lineGapScale || 1.4) : 1.4;
  const lineHeightPx = 7 * scale;
  const lineGapPx = Math.max(4, Math.round(scale * gapScale));
  const totalTextHeight = lines.length * lineHeightPx + (lines.length - 1) * lineGapPx;

  const longestLineLen = Math.max(...lines.map((l) => Array.from(l).length));
  const boxWidth = longestLineLen * charAdvance + Math.round(scale * 3.5);
  const boxHeight = totalTextHeight + Math.round(scale * 2.5);

  const bottomRatio = isPaidStyled
    ? (aspectRatio === '9:16' ? paidStyle.bottomRatio9x16 : paidStyle.bottomRatioDefault) ||
      (aspectRatio === '9:16' ? 0.84 : 0.88)
    : aspectRatio === '9:16'
      ? 0.84
      : 0.88;

  const centerX = Math.round(width / 2);
  const bottomAnchorY = Math.round(height * bottomRatio);
  const blockTopY = Math.max(20, bottomAnchorY - totalTextHeight);
  const boxLeftX = Math.max(12, Math.round(centerX - boxWidth / 2));
  const boxTopY = Math.max(12, Math.round(blockTopY - scale * 1.25));

  const rgba = Buffer.alloc(width * height * 4, 0);
  if (shouldDrawBox) {
    fillRectBlend(rgba, width, height, boxLeftX, boxTopY, boxWidth, boxHeight, boxColor);
  }

  lines.forEach((line, idx) => {
    const y = blockTopY + idx * (lineHeightPx + lineGapPx);
    drawBitmapTextLine(rgba, width, height, line, centerX, y, scale, textColor, outlineColor);
  });

  const pngBuffer = encodeRgbaToPngBuffer(width, height, rgba);
  fs.writeFileSync(pngPath, pngBuffer);
  return pngPath;
}

function normalizePresetKey(rawPreset) {
  return normalizeKey(rawPreset, GLOBALS.PRESET_ALIASES, PRESET_CONFIGS, 'default');
}

function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(Number(metadata?.format?.duration) || 5);
    });
  });
}

function resolveRenderConfig(masterPayload = {}) {
  const rawPlan =
    masterPayload?.meta?.userPlan ||
    masterPayload?.orchestration?.planApplied ||
    'free_trial';
  const userPlan = normalizeKey(rawPlan, {}, GLOBALS.PLAN_POLICIES, 'free_trial');
  const planPolicy = resolvePlanPolicy(userPlan);
  const isFreePlan = userPlan === 'free_trial';

  const requestedResolution =
    masterPayload?.videoConfig?.resolution ||
    masterPayload?.userInputs?.resolution ||
    (isFreePlan ? '720p' : '1080p');

  const resolution = isFreePlan
    ? '720p'
    : requestedResolution === '720p'
      ? '720p'
      : '1080p';

  const aspectRatio =
    masterPayload?.visual?.aspectRatio ||
    masterPayload?.userInputs?.aspectRatio ||
    masterPayload?.visualConfig?.aspectRatio ||
    masterPayload?.config?.aspectRatio ||
    '9:16';

  const rawPreset =
    masterPayload?.videoConfig?.preset ||
    masterPayload?.userInputs?.preset ||
    masterPayload?.visual?.preset ||
    masterPayload?.llmDirective?.preset ||
    masterPayload?.meta?.preset ||
    masterPayload?.config?.preset ||
    'default';

  const presetKey = normalizePresetKey(rawPreset);
  const presetConfig = PRESET_CONFIGS[presetKey] || PRESET_CONFIGS.default;

  const subtitlesEnabled =
    typeof masterPayload?.videoConfig?.subtitles?.enabled === 'boolean'
      ? masterPayload.videoConfig.subtitles.enabled
      : typeof masterPayload?.videoConfig?.subtitles === 'boolean'
        ? masterPayload.videoConfig.subtitles
        : typeof masterPayload?.config?.subtitles === 'boolean'
          ? masterPayload.config.subtitles
          : typeof masterPayload?.userInputs?.subtitles === 'boolean'
            ? masterPayload.userInputs.subtitles
            : true;

  // free_trial usa subtítulos sencillos; planes de pago usan estilo coherente con el preset elegido
  const subtitleMode = isFreePlan ? 'static' : 'preset_styled';

  const watermark =
    typeof masterPayload?.videoConfig?.watermark === 'boolean'
      ? isFreePlan || !planPolicy.allowCustomOverrides
        ? true
        : masterPayload.videoConfig.watermark
      : isFreePlan;

  const rawEndingBuffer =
    typeof masterPayload?.orchestration?.endingBufferSeconds === 'number'
      ? masterPayload.orchestration.endingBufferSeconds
      : masterPayload?.llmDirective?.structuredScript?.endingBufferSeconds ??
        GLOBALS.SAFETY_LIMITS.endingBufferSeconds.defaultValue;

  const minBuffer = GLOBALS.SAFETY_LIMITS.endingBufferSeconds.min ?? 1;
  const maxBuffer = GLOBALS.SAFETY_LIMITS.endingBufferSeconds.max ?? 4;
  const defaultBuffer = GLOBALS.SAFETY_LIMITS.endingBufferSeconds.defaultValue ?? 1.5;

  const endingBufferSeconds = clampNumber(
    Math.max(Number(rawEndingBuffer) || defaultBuffer, minBuffer),
    minBuffer,
    maxBuffer,
    defaultBuffer
  );

  return {
    userPlan,
    isFreePlan,
    resolution,
    aspectRatio,
    preset: presetConfig.key,
    presetLabel: presetConfig.label,
    presetConfig,
    fps: 30,
    watermark,
    subtitles: {
      enabled: subtitlesEnabled,
      mode: subtitleMode,
      effectStyle: isFreePlan ? 'static_basic' : presetConfig.paidSubtitles.style
    },
    endingBufferSeconds
  };
}

function getTargetDimensions(aspectRatio = '9:16', resolution = '1080p') {
  const is720 = resolution === '720p';

  switch (aspectRatio) {
    case '16:9':
      return is720 ? { width: 1280, height: 720 } : { width: 1920, height: 1080 };
    case '1:1':
      return is720 ? { width: 720, height: 720 } : { width: 1080, height: 1080 };
    case '9:16':
    default:
      return is720 ? { width: 720, height: 1280 } : { width: 1080, height: 1920 };
  }
}

function splitSubtitleChunks(text = '', maxWords = 6) {
  const words = sanitizeSubtitleRenderText(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
}

function buildTimedChunks({ text, duration, maxWords = 6 }) {
  const chunks = splitSubtitleChunks(text, maxWords);
  if (!chunks.length) return [];

  const totalWords = chunks.reduce(
    (acc, chunk) => acc + chunk.split(/\s+/).length,
    0
  );

  let currentTime = 0;
  return chunks.map((chunk, idx) => {
    const wordCount = chunk.split(/\s+/).length;
    const isLast = idx === chunks.length - 1;
    const chunkDuration = isLast
      ? Math.max(0.5, duration - currentTime)
      : Math.max(0.6, (wordCount / Math.max(1, totalWords)) * duration);

    const start = currentTime;
    const end = isLast ? duration : Math.min(duration, currentTime + chunkDuration);
    currentTime = end;

    return {
      index: idx + 1,
      text: chunk,
      start,
      end
    };
  });
}

function buildSyncedWordBlocks(words = [], duration = 5, { maxWords = 4, maxPauseSec = 0.35 } = {}) {
  if (!Array.isArray(words) || !words.length) return [];

  const normalizedWords = words
    .map((w) => {
      const cleaned = sanitizeSubtitleRenderText(w?.text ?? w?.word ?? '');
      const rawStart = Number(w?.start ?? w?.start_time ?? w?.startTime);
      const rawEnd = Number(w?.end ?? w?.end_time ?? w?.endTime);
      const start = Number.isFinite(rawStart) ? Math.max(0, Math.min(duration, rawStart)) : 0;
      const end = Number.isFinite(rawEnd)
        ? Math.max(start + 0.12, Math.min(duration, rawEnd))
        : Math.min(duration, start + 0.25);
      return { text: cleaned, start, end };
    })
    .filter((w) => Boolean(w.text));

  if (!normalizedWords.length) return [];

  const blocks = [];
  let bucket = [];

  const flushBucket = (nextWordStart = null) => {
    if (!bucket.length) return;
    const first = bucket[0];
    const last = bucket[bucket.length - 1];
    const text = bucket.map((item) => item.text).join(' ').replace(/\s{2,}/g, ' ').trim();

    let endTime = last.end;
    if (typeof nextWordStart === 'number' && Number.isFinite(nextWordStart)) {
      endTime = Math.min(endTime, Math.max(first.start + 0.25, nextWordStart - 0.03));
    } else {
      // Último bloque de la escena: margen extra para que no se corte la última palabra
      endTime = endTime + 0.18;
    }
    endTime = Math.min(duration, Math.max(first.start + 0.3, endTime));

    if (text && endTime > first.start) {
      blocks.push({
        index: blocks.length + 1,
        text,
        start: Number(first.start.toFixed(2)),
        end: Number(endTime.toFixed(2))
      });
    }
    bucket = [];
  };

  for (let i = 0; i < normalizedWords.length; i++) {
    const word = normalizedWords[i];
    const prevWord = bucket.length ? bucket[bucket.length - 1] : null;

    if (prevWord) {
      const gap = word.start - prevWord.end;
      const endsSentence = /[.!?:;…]+["')\]]*$/.test(prevWord.text);
      const endsComma = /,["')\]]*$/.test(prevWord.text);

      if (
        bucket.length >= maxWords ||
        gap >= maxPauseSec ||
        (endsSentence && bucket.length >= 2) ||
        (endsComma && bucket.length >= 3)
      ) {
        flushBucket(word.start);
      }
    }

    bucket.push(word);
  }

  flushBucket(null);
  return blocks;
}

function resolveSceneSubtitleSegments({
  subtitleSegments,
  words = [],
  text,
  duration
}) {
  // PRIORIDAD ABSOLUTA:
  // palabras provenientes de Scribe
  if (
    Array.isArray(words) &&
    words.length > 0
  ) {
    return buildSyncedWordBlocks(
      words,
      duration,
      {
        maxWords: 4,
        maxPauseSec: 0.35
      }
    );
  }

  // FALLBACK:
  // alignment de Eleven
  if (
    Array.isArray(subtitleSegments) &&
    subtitleSegments.length > 0
  ) {
    return subtitleSegments;
  }

  // ÚLTIMA OPCIÓN
  console.warn(
    `⚠️ [Subtitles] No words ni subtitleSegments disponibles. Usando timing estimado.`
  );

  return buildTimedChunks({
    text,
    duration,
    maxWords: 6
  });
}

function runFfmpegClip({
  imagePath,
  audioPath,
  duration,
  outputClipPath,
  fps,
  baseVideoFilter,
  overlayAssets = [],
  padAudioSeconds = 0
}) {
  return new Promise((resolve, reject) => {
    const cmd = ffmpeg()
      .input(imagePath)
      .inputOptions(['-loop', '1'])
      .input(audioPath);

    overlayAssets.forEach((asset) => {
      cmd.input(asset.pngPath).inputOptions(['-loop', '1']);
    });

    if (padAudioSeconds > 0) {
      cmd.audioFilters(`apad=pad_dur=${padAudioSeconds}`);
    }

    const outputOptions = [
      '-c:v libx264',
      '-c:a aac',
      '-b:a 192k',
      '-pix_fmt yuv420p',
      `-r ${fps}`,
      `-t ${duration}`
    ];

    if (overlayAssets.length > 0) {
      const complexParts = [`[0:v]${baseVideoFilter}[v0]`];
      let currentLabel = 'v0';

      overlayAssets.forEach((asset, idx) => {
        const inputIdx = idx + 2; // 0: image, 1: audio, 2+: PNG overlays
        const nextLabel = idx === overlayAssets.length - 1 ? 'vout' : `v${idx + 1}`;
        const enableClause =
          typeof asset.start === 'number' && typeof asset.end === 'number'
            ? `:enable='between(t,${asset.start.toFixed(2)},${asset.end.toFixed(2)})'`
            : '';
        complexParts.push(
          `[${currentLabel}][${inputIdx}:v]overlay=0:0${enableClause}[${nextLabel}]`
        );
        currentLabel = nextLabel;
      });

      cmd.complexFilter(complexParts.join(';'));
      outputOptions.push('-map', '[vout]', '-map', '1:a');
    } else {
      cmd.videoFilters(baseVideoFilter);
      outputOptions.push('-map', '0:v', '-map', '1:a');
    }

    cmd
      .outputOptions(outputOptions)
      .save(outputClipPath)
      .on('end', () => resolve(outputClipPath))
      .on('error', (err) => reject(err));
  });
}

async function renderSceneClip({
  imagePath,
  audioPath,
  duration,
  outputClipPath,
  renderConfig,
  subtitleText,
  subtitleSegments = [],
  subtitleWords = [],
  sceneIndex,
  jobId,
  sceneNumber,
  padAudioSeconds = 0,
  globalStartSec = 0,
  globalEndSec = null,
  totalVideoDuration = null
}) {
  const { width, height } = getTargetDimensions(
    renderConfig.aspectRatio,
    renderConfig.resolution
  );
  const is720 = renderConfig.resolution === '720p';

  const baseVideoFilter = buildBaseVideoFilter({
    width,
    height,
    duration,
    fps: renderConfig.fps,
    presetConfig: renderConfig.presetConfig,
    globalStartSec,
    globalEndSec,
    totalVideoDuration
  });

  const overlayAssets = [];

  if (renderConfig.watermark) {
    const wmPath = path.join(TEMP_DIR, `${jobId}_s${sceneNumber}_wm.png`);
    await renderWatermarkPng({
      fs,
      optionalCanvas: OPTIONAL_CANVAS,
      blendPixel,
      drawBitmapTextLine,
      encodeRgbaToPngBuffer,
      pngPath: wmPath,
      width,
      height,
      is720
    });
    overlayAssets.push({ pngPath: wmPath });
  }

  const activeSegments =
    renderConfig.subtitles.enabled && subtitleText
      ? resolveSceneSubtitleSegments({
          subtitleSegments,
          words: subtitleWords,
          text: subtitleText,
          duration
        })
      : [];

  activeSegments.forEach((seg, idx) => {
    const subPngPath = path.join(TEMP_DIR, `${jobId}_s${sceneNumber}_sub_${idx}.png`);
    const builtPath = renderSubtitleSegmentPng({
      text: seg.text,
      pngPath: subPngPath,
      width,
      height,
      aspectRatio: renderConfig.aspectRatio,
      subtitleMode: renderConfig.subtitles.mode,
      presetConfig: renderConfig.presetConfig
    });
    if (builtPath) {
      overlayAssets.push({
        pngPath: builtPath,
        start: seg.start,
        end: seg.end
      });
    }
  });

  try {
    await runFfmpegClip({
      imagePath,
      audioPath,
      duration,
      outputClipPath,
      fps: renderConfig.fps,
      baseVideoFilter,
      overlayAssets,
      padAudioSeconds
    });
  } catch (err) {
    console.warn(
      `⚠️ [Render] Falló overlay en escena ${sceneIndex + 1}, reintentando clip base sin overlays:`,
      err?.message || err
    );

    await runFfmpegClip({
      imagePath,
      audioPath,
      duration,
      outputClipPath,
      fps: renderConfig.fps,
      baseVideoFilter,
      overlayAssets: [],
      padAudioSeconds
    });
  } finally {
    overlayAssets.forEach((asset) => {
      if (asset?.pngPath && fs.existsSync(asset.pngPath)) {
        fs.unlinkSync(asset.pngPath);
      }
    });
  }

  return outputClipPath;
}

function concatSceneClips({ clipPaths, outputVideoPath, jobId }) {
  return new Promise((resolve, reject) => {
    const concatListPath = path.join(TEMP_DIR, `${jobId}_concat.txt`);
    const fileContent = clipPaths
      .map((p) => `file '${p.replace(/'/g, "'\\''")}'`)
      .join('\n');
    fs.writeFileSync(concatListPath, fileContent, 'utf8');

    ffmpeg()
      .input(concatListPath)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .save(outputVideoPath)
      .on('end', () => {
        [concatListPath, ...clipPaths].forEach((f) => {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        });
        resolve(outputVideoPath);
      })
      .on('error', (err) => {
        [concatListPath, ...clipPaths].forEach((f) => {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        });
        reject(err);
      });
  });
}

async function renderFinalVideo(rawPayload) {
  const masterPayload = rawPayload?.payload || rawPayload?.data || rawPayload || {};
  const structuredScript =
    masterPayload?.llmDirective?.structuredScript ||
    masterPayload?.structuredScript ||
    (Array.isArray(masterPayload?.scenes) ? masterPayload : null);

  const scenes = structuredScript?.scenes || [];
  if (!Array.isArray(scenes) || !scenes.length) {
    throw new Error('No hay escenas disponibles en el payload para renderizar.');
  }

  const jobId =
    masterPayload.jobId ||
    masterPayload?.meta?.jobId ||
    masterPayload?.visual?.jobId ||
    `job_${Date.now()}`;

  const renderConfig = resolveRenderConfig(masterPayload);
  const { width, height } = getTargetDimensions(
    renderConfig.aspectRatio,
    renderConfig.resolution
  );

  console.log(
    `🎬 [Render Paso 4] Job: ${jobId} | Plan: ${renderConfig.userPlan} | Preset: ${renderConfig.presetLabel} | Formato: ${renderConfig.aspectRatio} | Resolución: ${renderConfig.resolution} (${width}x${height}) | Subtítulos: ${renderConfig.subtitles.enabled} (${renderConfig.subtitles.mode}) | Buffer final: ${renderConfig.endingBufferSeconds}s`
  );

  const preparedScenes = [];
  let cursorSec = 0;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const isLastScene = i === scenes.length - 1;
    const relImage = scene?.visual?.imageUrl || scene?.imageUrl;
    const relAudio = scene?.audio?.audioUrl || scene?.audioUrl;

    if (!relImage || !relAudio) {
      throw new Error(
        `Faltan visual.imageUrl o audio.audioUrl en la escena ${scene.sceneNumber}.`
      );
    }

    const imagePath = path.join(PUBLIC_DIR, relImage.replace(/^\/+/, ''));
    const audioPath = path.join(PUBLIC_DIR, relAudio.replace(/^\/+/, ''));

    if (!fs.existsSync(imagePath) || !fs.existsSync(audioPath)) {
      throw new Error(
        `No existen en disco los archivos de la escena ${scene.sceneNumber}: ${imagePath} o ${audioPath}`
      );
    }

    const audioDuration = await getAudioDuration(audioPath);
    const sceneDuration = isLastScene
      ? Number((audioDuration + renderConfig.endingBufferSeconds).toFixed(2))
      : Number(audioDuration.toFixed(2));

    const globalStartSec = Number(cursorSec.toFixed(2));
    const globalEndSec = Number((globalStartSec + sceneDuration).toFixed(2));
    cursorSec = globalEndSec;

    preparedScenes.push({
      scene,
      isLastScene,
      imagePath,
      audioPath,
      sceneDuration,
      globalStartSec,
      globalEndSec
    });
  }

  const totalVideoDuration = Math.max(0.1, cursorSec);
  const clipPaths = [];

  for (let i = 0; i < preparedScenes.length; i++) {
    const item = preparedScenes[i];
    const clipPath = path.join(TEMP_DIR, `${jobId}_clip_${item.scene.sceneNumber}.mp4`);

    await renderSceneClip({
      imagePath: item.imagePath,
      audioPath: item.audioPath,
      duration: item.sceneDuration,
      outputClipPath: clipPath,
      renderConfig,
      subtitleText: item.scene.voiceoverText,
      subtitleSegments: item.scene?.audio?.subtitleSegments || item.scene?.subtitleSegments || [],
      subtitleWords: item.scene?.audio?.words || item.scene?.words || [],
      sceneIndex: i,
      jobId,
      sceneNumber: item.scene.sceneNumber,
      padAudioSeconds: item.isLastScene ? renderConfig.endingBufferSeconds : 0,
      globalStartSec: item.globalStartSec,
      globalEndSec: item.globalEndSec,
      totalVideoDuration
    });

    clipPaths.push(clipPath);
  }

  const videoFileName = `${jobId}_step4_render.mp4`;
  const finalOutputPath = path.join(VIDEO_OUTPUT_DIR, videoFileName);

  await concatSceneClips({
    clipPaths,
    outputVideoPath: finalOutputPath,
    jobId
  });

  const videoUrl = `/videos/${videoFileName}`;
  console.log(`✅ [Render Paso 4] Video ensamblado en: ${videoUrl}`);

  const updatedPayload = {
    ...masterPayload,
    meta: {
      ...(masterPayload.meta || {}),
      jobId
    },
    video: {
      ...(masterPayload.video || {}),
      jobId,
      fileName: videoFileName,
      videoUrl,
      preset: renderConfig.preset,
      presetLabel: renderConfig.presetLabel,
      resolution: renderConfig.resolution,
      width,
      height,
      fps: renderConfig.fps,
      aspectRatio: renderConfig.aspectRatio,
      watermark: renderConfig.watermark,
      subtitles: renderConfig.subtitles,
      endingBufferSeconds: renderConfig.endingBufferSeconds,
      renderedAt: new Date().toISOString()
    }
  };

  return {
    videoFileName,
    videoUrl,
    preset: renderConfig.preset,
    resolution: renderConfig.resolution,
    subtitlesEnabled: renderConfig.subtitles.enabled,
    subtitleMode: renderConfig.subtitles.mode,
    watermark: renderConfig.watermark,
    renderedAt: new Date(),
    payload: updatedPayload
  };
}

module.exports = {
  renderFinalVideo,
  resolveRenderConfig,
  getTargetDimensions,
  PRESET_CONFIGS
};
