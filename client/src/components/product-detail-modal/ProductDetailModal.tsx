import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslations';
import type { ProductMenuItem } from '../navbar/Navbar';
import styles from './ProductDetailModal.module.css';

export interface ProductExampleDetail {
  scenario: { en: string; es: string };
  prompt: { en: string; es: string };
  scope: { en: string; es: string };
}

export const PRODUCT_EXAMPLES_BY_ID: Record<string, ProductExampleDetail> = {
  'studio-lite': {
    scenario: {
      en: 'Example: 30-second vertical explainer from a raw idea',
      es: 'Ejemplo: Video vertical de 30s a partir de una idea breve',
    },
    prompt: {
      en: '"Explain how a small bakery can turn morning coffee regulars into repeat afternoon pastry buyers in 3 simple steps."',
      es: '"Explica en 3 pasos sencillos cómo una cafetería local puede convertir a sus clientes de la mañana en compradores de pan dulce por la tarde."',
    },
    scope: {
      en: 'Ideal for fast social videos, product hooks, and guided 5-step drafts.',
      es: 'Ideal para piezas cortas, ganchos rápidos y borradores guiados en 5 pasos.',
    },
  },
  'director-studio': {
    scenario: {
      en: 'Example: Multi-scene mini story with controlled pacing',
      es: 'Ejemplo: Historia multiescena con control de ritmo y cortes',
    },
    prompt: {
      en: '"Scene 1: Quiet rain on glass at dawn. Scene 2: Close-up of pouring espresso. Scene 3: Warm morning light over a wooden table."',
      es: '"Escena 1: Lluvia suave en el cristal al amanecer. Escena 2: Primer plano sirviendo café. Escena 3: Luz cálida de mañana sobre una mesa de madera."',
    },
    scope: {
      en: 'Designed for scene-by-scene direction, visual continuity, and narrative cadence.',
      es: 'Pensado para dirección escena por escena, continuidad visual y ritmo narrativo.',
    },
  },
  'studio-blueprints': {
    scenario: {
      en: 'Example: Weekly series template for recurring episodes',
      es: 'Ejemplo: Plantilla semanal para episodios recurrentes',
    },
    prompt: {
      en: '"Weekly 45s tip format: Hook question (0-5s) -> Common mistake (5-20s) -> Actionable fix (20-40s) -> Recap CTA (40-45s)."',
      es: '"Formato semanal de 45s: Pregunta gancho (0-5s) -> Error común (5-20s) -> Solución práctica (20-40s) -> Cierre con llamado a la acción (40-45s)."',
    },
    scope: {
      en: 'Standardizes repeatable structures across campaigns, series, and teams.',
      es: 'Estandariza estructuras repetibles para campañas, series y flujos constantes.',
    },
  },
  'studio-memories': {
    scenario: {
      en: 'Example: Persistent brand style & tone across productions',
      es: 'Ejemplo: Estilo de marca y tono persistentes entre proyectos',
      },
    prompt: {
      en: '"Keep warm editorial lighting, calm conversational narration, clean minimalist captions, and avoid overly hype slang."',
      es: '"Mantén iluminación editorial cálida, narración conversacional serena, subtítulos limpios y evita tonos exagerados."',
    },
    scope: {
      en: 'Preserves recurring visual and voice preferences so you do not re-specify them every time.',
      es: 'Conserva preferencias visuales y de voz para no redefinirlas en cada entrega.',
    },
  },
  'text-to-speech': {
    scenario: {
      en: 'Example: Script-to-voiceover audio draft',
      es: 'Ejemplo: Locución de audio generada desde un guion',
    },
    prompt: {
      en: '"Welcome back. Today we walk through how clean layout structure makes interfaces easier to scan on any screen."',
      es: '"Bienvenidos de nuevo. Hoy vemos cómo una estructura visual clara hace que las interfaces sean fáciles de leer en cualquier pantalla."',
    },
    scope: {
      en: 'Turns written text into clean narration audio tracks with tone and pace control.',
      es: 'Convierte texto escrito en pistas de voz con control de tono y velocidad.',
    },
  },
  'text-to-image': {
    scenario: {
      en: 'Example: Concept frame or thumbnail visual generation',
      es: 'Ejemplo: Generación de cuadro conceptual o portada visual',
    },
    prompt: {
      en: '"Architectural studio desk at golden hour, warm natural shadows, editorial photography look, clean composition with negative space on the left."',
      es: '"Escritorio de estudio arquitectónico a la hora dorada, sombras naturales cálidas, estilo fotográfico editorial y espacio limpio a la izquierda."',
    },
    scope: {
      en: 'Creates key visuals, thumbnails, and look-development references from text prompts.',
      es: 'Genera cuadros clave, portadas y referencias visuales a partir de descripciones.',
    },
  },
  'image-to-video': {
    scenario: {
      en: 'Example: Subtle camera push-in on a still illustration',
      es: 'Ejemplo: Movimiento sutil de cámara sobre una imagen fija',
    },
    prompt: {
      en: '"Slow gentle camera zoom-in toward the horizon with soft atmospheric depth and subtle ambient motion."',
      es: '"Acercamiento lento y suave de cámara hacia el horizonte con profundidad atmosférica y movimiento ambiental sutil."',
    },
    scope: {
      en: 'Animates static images into motion clips while preserving original framing and look.',
      es: 'Anima imágenes fijas en clips con movimiento manteniendo el encuadre y estilo.',
    },
  },
  'ai-voiceover': {
    scenario: {
      en: 'Example: Explainer voice track for product walkthroughs',
      es: 'Ejemplo: Voz en off explicativa para recorridos de producto',
    },
    prompt: {
      en: '"First, pick your starting format; next, fine-tune pacing and voice delivery before exporting your final cut."',
      es: '"Primero elige tu formato inicial; después ajusta el ritmo y la locución antes de exportar tu versión final."',
    },
    scope: {
      en: 'Delivers clear, consistent voiceovers for promos, explainers, and short-form edits.',
      es: 'Aporta locuciones claras y uniformes para explicativos, promos y videos cortos.',
    },
  },
  'background-music': {
    scenario: {
      en: 'Example: Ambient bed under a calm tutorial voice',
      es: 'Ejemplo: Base ambiental para acompañar una guía tranquila',
    },
    prompt: {
      en: '"Soft lo-fi acoustic pulse with gentle warm pads, low dynamic range so spoken narration stays front and center."',
      es: '"Pulso acústico suave con pads cálidos y dinámica contenida para que la voz principal destaque con claridad."',
    },
    scope: {
      en: 'Adds mood-matched background music that supports pacing without overpowering dialogue.',
      es: 'Añade bases musicales acordes al tono del video sin competir con la narración.',
    },
  },
};

export interface ProductDetailModalProps {
  product: ProductMenuItem | null;
  onClose: () => void;
  onGoToSection: (product: ProductMenuItem) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  onGoToSection,
}: ProductDetailModalProps) {
  const { language } = useTranslation();
  const isEn = language !== 'es';
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, product]);

  useEffect(() => {
    setCopied(false);
  }, [product?.id]);

  if (!product) return null;

  const detail = PRODUCT_EXAMPLES_BY_ID[product.id] ?? {
    scenario: {
      en: 'Example: Practical workflow output',
      es: 'Ejemplo: Resultado práctico en flujo de trabajo',
    },
    prompt: {
      en: product.summary.en,
      es: product.summary.es,
    },
    scope: {
      en: product.summary.en,
      es: product.summary.es,
    },
  };

  const groupLabel =
    product.group === 'main'
      ? isEn
        ? 'Main Studio'
        : 'Estudio Principal'
      : isEn
      ? 'Extra Tools'
      : 'Herramientas Extra';

  const isStudioLite = product.id === 'studio-lite';
  const targetPath = isStudioLite
    ? '/workspace/studio-lite'
    : `/products/${product.id}`;

  const highlights = isEn ? product.highlights.en : product.highlights.es;
  const promptText = isEn ? detail.prompt.en : detail.prompt.es;

  const handleCopyExample = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.modalPanel}>
        <div className={styles.topBar}>
          <div>
            <div className={styles.badgeRow}>
              <span className={styles.groupBadge}>{groupLabel}</span>
              <span className={styles.routeBadge}>{targetPath}</span>
            </div>
            <h2 id="product-detail-modal-title" className={styles.title}>
              {isEn ? product.name.en : product.name.es}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isEn ? 'Close modal' : 'Cerrar modal'}
            className={styles.closeBtn}
          >
            ✕
          </button>
        </div>

        <div className={styles.sectionBlock}>
          <span className={styles.sectionLabel}>
            {isEn ? 'Overview & Scope' : 'Explicación y Alcances'}
          </span>
          <p className={styles.descriptionText}>
            {isEn ? product.summary.en : product.summary.es}
          </p>
          <p className={styles.descriptionText}>
            {isEn ? detail.scope.en : detail.scope.es}
          </p>
        </div>

        <div className={styles.sectionBlock}>
          <span className={styles.sectionLabel}>
            {isEn ? 'Key Options Summary' : 'Resumen de Opciones'}
          </span>
          <ul className={styles.optionsList}>
            {highlights.map((item, index) => (
              <li key={index} className={styles.optionCard}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.sectionBlock}>
          <span className={styles.sectionLabel}>
            {isEn ? 'What You Can Do (Example)' : 'Ejemplo de lo que puedes hacer'}
          </span>
          <div className={styles.exampleBox}>
            <div className={styles.exampleTop}>
              <span className={styles.exampleScenario}>
                {isEn ? detail.scenario.en : detail.scenario.es}
              </span>
              <button
                type="button"
                onClick={handleCopyExample}
                className={styles.copyBtn}
              >
                {copied
                  ? isEn
                    ? 'Copied'
                    : 'Copiado'
                  : isEn
                  ? 'Copy example'
                  : 'Copiar ejemplo'}
              </button>
            </div>
            <p className={styles.examplePrompt}>{promptText}</p>
          </div>
        </div>

        <div className={styles.footerBar}>
          <span className={styles.footerNote}>
            {isStudioLite
              ? isEn
                ? 'Opens directly inside your Studio Lite workspace.'
                : 'Abre directamente dentro de tu espacio en Studio Lite.'
              : isEn
              ? 'Dedicated router view pending; action connects to your workspace flow.'
              : 'Ruta dedicada pendiente en el router; se conecta a tu flujo de trabajo.'}
          </span>

          <div className={styles.footerActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.secondaryBtn}
            >
              {isEn ? 'Close' : 'Cerrar'}
            </button>

            <a
              href={targetPath}
              onClick={(e) => {
                e.preventDefault();
                onGoToSection(product);
              }}
              className={styles.primaryBtn}
            >
              <span>
                {isStudioLite
                  ? isEn
                    ? 'Go to Studio Lite Workspace'
                    : 'Ir a Studio Lite Workspace'
                  : isEn
                  ? `Open ${product.name.en}`
                  : `Ir a ${product.name.es}`}
              </span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
