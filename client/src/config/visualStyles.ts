// client/src/config/visualStyles.ts
export const VISUAL_STYLES = {
  realistic: {
    key: 'realistic',
    label: 'Realistic',
    promptAnchor:
      'Photorealistic cinematic live-action photography, natural textures, authentic lighting, crisp depth of field'
  },
  cinematic_film: {
    key: 'cinematic_film',
    label: 'Cinematic Film',
    promptAnchor:
      'Feature film cinematography, rich color grading, subtle lens flare, atmospheric lighting, shallow depth of field'
  },
  '3d_render': {
    key: '3d_render',
    label: '3D Render',
    promptAnchor:
      'High-detail 3D CGI render, subsurface scattering, studio and volumetric lighting, clean stylized depth'
  },
  anime: {
    key: 'anime',
    label: 'Anime',
    promptAnchor:
      'High-craft Japanese anime illustration style, expressive lighting, clean linework, rich atmospheric backgrounds'
  },
  comic: {
    key: 'comic',
    label: 'Comic',
    promptAnchor:
      'Graphic novel comic art style, bold ink outlines, halftone shading, dramatic panel composition'
  },
  minimalist_flat: {
    key: 'minimalist_flat',
    label: 'Minimalist Editorial',
    promptAnchor:
      'Clean minimalist visual composition, uncluttered framing, refined studio lighting, crisp geometric balance'
  },
  retro_vintage: {
    key: 'retro_vintage',
    label: 'Retro Vintage',
    promptAnchor:
      'Vintage analog aesthetic, warm faded film tones, subtle grain, nostalgic lighting and classic framing'
  },
  surreal_editorial: {
    key: 'surreal_editorial',
    label: 'Surreal Editorial',
    promptAnchor:
      'Surrealist editorial art direction, imaginative composition, dramatic contrast, dreamlike atmosphere'
  }
} as const;

export type VisualStyleKey = keyof typeof VISUAL_STYLES;
