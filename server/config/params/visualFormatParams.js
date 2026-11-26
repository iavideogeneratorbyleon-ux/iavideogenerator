const VISUAL_STYLE_ALIASES = {
  photorealistic: 'realistic',
  '3d_render': '3d_cinematic',
  cgi_3d: '3d_cinematic',
  stylized_3d: '3d_stylized',
  western_comic: 'comic_book',
  comic: 'comic_book',
  vector_flat: 'flat_vector',
  minimalist_flat: 'flat_vector',
  infographics: 'motion_infographic',
  motion_graphics: 'motion_infographic',
  isometric: 'isometric_3d',
  editorial: 'editorial_conceptual',
  watercolor: 'watercolor_painting',
  painting: 'watercolor_painting'
};

const VISUAL_STYLE_CATALOG = {
  realistic: {
    key: 'realistic',
    order: 1,
    label: 'Realista / Fotorealista',
    bestFor: ['documentaries', 'history', 'science', 'news', 'professional'],
    promptAnchor:
      'Photorealistic live-action photography and natural cinema look, authentic textures, realistic lighting, crisp depth of field',
    lightingAndTexture:
      'natural lighting, authentic surface textures, lifelike shadows and detail',
    allowTextInImage: false
  },
  '3d_cinematic': {
    key: '3d_cinematic',
    order: 2,
    label: 'Animación 3D Cinematográfica (CGI)',
    bestFor: ['animated_documentaries', 'storytelling', 'cinematic_worlds'],
    promptAnchor:
      'High-end cinematic 3D CGI animation look, rich volumetric lighting, realistic materials, dramatic film depth',
    lightingAndTexture:
      'cinematic lighting, ray-traced reflections, detailed 3D environments and characters',
    allowTextInImage: false
  },
  '3d_stylized': {
    key: '3d_stylized',
    order: 3,
    label: 'Animación 3D Estilizada',
    bestFor: ['education', 'entertainment', 'character_stories'],
    promptAnchor:
      'Stylized 3D animated look, expressive proportions, vibrant studio lighting, charming character and world design',
    lightingAndTexture:
      'soft colorful studio lighting, smooth stylized surfaces, expressive depth',
    allowTextInImage: false
  },
  anime: {
    key: 'anime',
    order: 4,
    label: 'Anime',
    bestFor: ['education', 'stories', 'emotional_content'],
    promptAnchor:
      '2D Japanese anime keyframe illustration, cel-shaded anime art style, crisp clean linework, expressive anime character proportions and eyes, painted anime background art, cinematic anime lighting',
    lightingAndTexture:
      '2D cel shading with clean shadow edges, hand-painted anime sky and environment backgrounds, atmospheric rim light, zero photorealism and zero 3D CGI render',
    allowTextInImage: false
  },
  manga: {
    key: 'manga',
    order: 5,
    label: 'Manga',
    bestFor: ['dramatic_stories', 'history', 'intense_scenes'],
    promptAnchor:
      'Japanese manga illustration style, crisp monochrome black-and-white ink work, screentone shading, dramatic expressions',
    lightingAndTexture:
      'high-contrast ink and screentone textures, dynamic graphic shading',
    allowTextInImage: false
  },
  comic_book: {
    key: 'comic_book',
    order: 6,
    label: 'Comic Book (Cómic occidental)',
    bestFor: ['stories', 'explanations', 'entertainment'],
    promptAnchor:
      'Western comic book art style, bold ink outlines, rich saturated colors, dramatic graphic shadows',
    lightingAndTexture:
      'strong comic ink contours, bold color blocking, dramatic shadow contrast',
    allowTextInImage: false
  },
  cartoon_2d: {
    key: 'cartoon_2d',
    order: 7,
    label: 'Cartoon 2D',
    bestFor: ['education', 'humor', 'social_media'],
    promptAnchor:
      'Expressive 2D cartoon illustration style, simplified memorable characters, lively clean framing',
    lightingAndTexture:
      'bright clear colors, clean 2D shapes, expressive character poses',
    allowTextInImage: false
  },
  flat_vector: {
    key: 'flat_vector',
    order: 8,
    label: 'Flat Design / Ilustración Vectorial',
    bestFor: ['tutorials', 'education', 'simple_explanations'],
    promptAnchor:
      'Clean flat vector illustration style, geometric shapes, solid cohesive colors, uncluttered modern layout',
    lightingAndTexture:
      'flat crisp vector shapes, clean color harmony, minimal visual noise',
    allowTextInImage: false
  },
  motion_infographic: {
    key: 'motion_infographic',
    order: 9,
    label: 'Motion Graphics / Infografías',
    bestFor: ['statistics', 'business', 'science', 'education'],
    promptAnchor:
      'Modern infographic and motion-graphics visual design, clean data diagrams, icons, structured visual hierarchy',
    lightingAndTexture:
      'crisp UI/infographic visual clarity, structured charts and iconography, clean contrast',
    allowTextInImage: true
  },
  isometric_3d: {
    key: 'isometric_3d',
    order: 10,
    label: 'Isométrico 3D',
    bestFor: ['technology', 'processes', 'architecture', 'visual_explanations'],
    promptAnchor:
      'Isometric 3D perspective scene, detailed miniature architectural and process layout, clean elevated viewpoint',
    lightingAndTexture:
      'even studio and soft directional light, crisp isometric geometry, structured depth',
    allowTextInImage: false
  },
  editorial_conceptual: {
    key: 'editorial_conceptual',
    order: 11,
    label: 'Ilustración Editorial / Conceptual',
    bestFor: ['philosophy', 'psychology', 'history', 'reflection'],
    promptAnchor:
      'Conceptual editorial illustration, symbolic visual metaphors, thoughtful composition, artistic depth',
    lightingAndTexture:
      'evocative mood lighting, conceptual symbolism, refined editorial art direction',
    allowTextInImage: false
  },
  watercolor_painting: {
    key: 'watercolor_painting',
    order: 12,
    label: 'Pintura / Acuarela',
    bestFor: ['fairy_tales', 'stories', 'artistic_documentaries', 'emotional_content'],
    promptAnchor:
      'Traditional watercolor and fine-art painting style, visible brushstrokes, organic pigment washes, tactile paper texture',
    lightingAndTexture:
      'soft watercolor bleeds, visible brushwork, warm artistic pigment blending',
    allowTextInImage: false
  }
};

const VISUAL_MEDIA_MODES = {
  static_only: {
    key: 'static_only',
    label: 'Static Images Only',
    sceneRoleMediaMap: {
      hook: 'static_image',
      body: 'static_image',
      cta: 'static_image'
    },
    defaultSceneMedia: 'static_image',
    applyCameraZoomInRender: true
  },
  motion_images_only: {
    key: 'motion_images_only',
    label: 'Motion Images Only',
    sceneRoleMediaMap: {
      hook: 'motion_image',
      body: 'motion_image',
      cta: 'motion_image'
    },
    defaultSceneMedia: 'motion_image',
    applyCameraZoomInRender: false
  },
  video_clips_only: {
    key: 'video_clips_only',
    label: 'Short Video Clips Only',
    sceneRoleMediaMap: {
      hook: 'video_clip',
      body: 'video_clip',
      cta: 'video_clip'
    },
    defaultSceneMedia: 'video_clip',
    applyCameraZoomInRender: false
  },
  hybrid_stills_motion: {
    key: 'hybrid_stills_motion',
    label: 'Hybrid: Static + Motion Images',
    sceneRoleMediaMap: {
      hook: 'motion_image',
      body: 'static_image',
      cta: 'motion_image'
    },
    defaultSceneMedia: 'static_image',
    applyCameraZoomInRender: 'by_scene_type'
  },
  hybrid_stills_clips: {
    key: 'hybrid_stills_clips',
    label: 'Hybrid: Static Images + Short Clips',
    sceneRoleMediaMap: {
      hook: 'video_clip',
      body: 'static_image',
      cta: 'video_clip'
    },
    defaultSceneMedia: 'static_image',
    applyCameraZoomInRender: 'by_scene_type'
  },
  hybrid_full_mix: {
    key: 'hybrid_full_mix',
    label: 'Hybrid: Static + Motion + Clips',
    sceneRoleMediaMap: {
      hook: 'video_clip',
      body: 'motion_image',
      cta: 'static_image'
    },
    defaultSceneMedia: 'static_image',
    applyCameraZoomInRender: 'by_scene_type'
  }
};

function normalizeVisualStyleKey(rawStyle = 'realistic') {
  const cleaned = String(rawStyle || 'realistic')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  const aliased = VISUAL_STYLE_ALIASES[cleaned] || cleaned;
  return Object.prototype.hasOwnProperty.call(VISUAL_STYLE_CATALOG, aliased)
    ? aliased
    : 'realistic';
}

function normalizeVisualMediaModeKey(rawMode = 'static_only') {
  const cleaned = String(rawMode || 'static_only')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return Object.prototype.hasOwnProperty.call(VISUAL_MEDIA_MODES, cleaned)
    ? cleaned
    : 'static_only';
}

function resolveVisualFormatParams({
  visualStyle = 'realistic',
  mediaMode = 'static_only',
  styleOverrides = {},
  modeOverrides = {}
} = {}) {
  const styleKey = normalizeVisualStyleKey(visualStyle);
  const modeKey = normalizeVisualMediaModeKey(mediaMode);

  return {
    style: {
      ...VISUAL_STYLE_CATALOG[styleKey],
      ...(styleOverrides[styleKey] || {})
    },
    mediaMode: {
      ...VISUAL_MEDIA_MODES[modeKey],
      ...(modeOverrides[modeKey] || {})
    }
  };
}

function resolveSceneMediaType(mediaModeConfig = {}, sceneRole = 'body', explicitSceneMedia = null) {
  const roleMap = mediaModeConfig?.sceneRoleMediaMap;
  if (roleMap && typeof roleMap === 'object') {
    return roleMap[sceneRole] || mediaModeConfig?.defaultSceneMedia || 'static_image';
  }
  if (explicitSceneMedia) {
    return explicitSceneMedia;
  }
  return mediaModeConfig?.defaultSceneMedia || 'static_image';
}

module.exports = {
  VISUAL_STYLE_ALIASES,
  VISUAL_STYLE_CATALOG,
  VISUAL_MEDIA_MODES,
  normalizeVisualStyleKey,
  normalizeVisualMediaModeKey,
  resolveVisualFormatParams,
  resolveSceneMediaType
};
