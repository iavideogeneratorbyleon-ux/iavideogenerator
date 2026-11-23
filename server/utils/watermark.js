const path = require('path');

const WATERMARK_LOGO_PATH = path.join(__dirname, '..', 'assets', 'cempai-logo-transparent.png');
const WATERMARK_SLOGAN = 'Power by Cempai.ai';

async function renderWatermarkPng({
  fs,
  optionalCanvas,
  drawBitmapTextLine,
  encodeRgbaToPngBuffer,
  pngPath,
  width,
  height,
  is720
}) {
  const padX = is720 ? 18 : 28;
  const padY = is720 ? 18 : 28;
  const logoExists = fs && typeof fs.existsSync === 'function' && fs.existsSync(WATERMARK_LOGO_PATH);

  if (optionalCanvas?.mod && logoExists) {
    try {
      const { createCanvas, loadImage } = optionalCanvas.mod;
      if (typeof createCanvas === 'function' && typeof loadImage === 'function') {
        const logoImg = await loadImage(WATERMARK_LOGO_PATH);
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);

        // Logo más grande y posicionado arriba del texto
        const iconSize = is720 ? 48 : 70;
        const gapY = is720 ? 6 : 8;
        const fontSize = is720 ? 15 : 22;

        ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const textW = Math.ceil(ctx.measureText(WATERMARK_SLOGAN).width);
        const blockW = Math.max(iconSize, textW);

        const blockLeftX = Math.max(12, width - blockW - padX);
        const centerX = Math.round(blockLeftX + blockW / 2);
        const logoX = Math.round(centerX - iconSize / 2);
        const logoY = Math.max(12, padY);
        const textY = logoY + iconSize + gapY;

        // Isotipo transparente sin recuadro negro
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.drawImage(logoImg, logoX, logoY, iconSize, iconSize);
        ctx.restore();

        // Texto debajo del logo, sin caja negra detrás
        ctx.save();
        ctx.globalAlpha = 0.88;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
        ctx.shadowBlur = is720 ? 4 : 6;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(WATERMARK_SLOGAN, centerX, textY);
        ctx.restore();

        fs.writeFileSync(pngPath, canvas.toBuffer('image/png'));
        console.log('[Watermark] Generado con Canvas:', pngPath);
        return pngPath;
      }
    } catch (err) {
      console.warn('[Watermark] Falló Canvas, usando fallback:', err?.message || err);
    }
  } else {
    console.log('[Watermark] Canvas o logo no disponible:', {
      hasCanvasMod: Boolean(optionalCanvas?.mod),
      logoExists,
      WATERMARK_LOGO_PATH
    });
  }

  // Fallback bitmap sin recuadro negro
  if (typeof drawBitmapTextLine === 'function' && typeof encodeRgbaToPngBuffer === 'function') {
    try {
      const scale = is720 ? 2 : 3;
      const charAdvance = 6 * scale;
      const textW = WATERMARK_SLOGAN.length * charAdvance;
      const centerX = Math.max(Math.round(textW / 2) + 12, width - Math.round(textW / 2) - padX);
      const topY = Math.max(12, padY);

      const rgba = Buffer.alloc(width * height * 4, 0);
      drawBitmapTextLine(
        rgba,
        width,
        height,
        WATERMARK_SLOGAN,
        centerX,
        topY,
        scale,
        [255, 255, 255, 215],
        [0, 0, 0, 120]
      );

      const pngBuffer = encodeRgbaToPngBuffer(width, height, rgba);
      fs.writeFileSync(pngPath, pngBuffer);
      console.log('[Watermark] Generado con fallback bitmap:', pngPath);
      return pngPath;
    } catch (err) {
      console.warn('[Watermark] Falló fallback bitmap:', err?.message || err);
    }
  }

  return null;
}

module.exports = {
  WATERMARK_LOGO_PATH,
  WATERMARK_SLOGAN,
  renderWatermarkPng
};
