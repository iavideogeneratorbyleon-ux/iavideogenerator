import { useMemo, useState } from "react";
import type { WizardData } from "./WizardStep1";
import { useLanguage } from "../landing/LanguageContext";
import styles from "./WizardStep3.module.css";

interface Step3Props {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
  wizardMode?: "lite" | "pro";
}

type StyleCategory = "all" | "realistic" | "animation" | "graphic";

interface VisualStyleOption {
  id: string;
  category: Exclude<StyleCategory, "all">;
  label: string;
  desc: string;
  isProOnly: boolean;
}

export default function WizardStep3({
  data,
  onUpdate,
  onNext,
  onPrev,
  wizardMode = "lite",
}: Step3Props) {
  const { lang, t } = useLanguage();
  const isPro = wizardMode === "pro";
  const [selectedCategory, setSelectedCategory] = useState<StyleCategory>("all");

  const aspectRatios = [
    {
      id: "9:16",
      label: lang === "en" ? "Vertical (9:16)" : "Vertical (9:16)",
      tag: "Reels / TikTok / Shorts",
      icon: "📱",
      isProOnly: false,
    },
    {
      id: "16:9",
      label: lang === "en" ? "Horizontal (16:9)" : "Horizontal (16:9)",
      tag: "YouTube / Widescreen",
      icon: "🖥️",
      isProOnly: false,
    },
    {
      id: "1:1",
      label: lang === "en" ? "Square (1:1)" : "Cuadrado (1:1)",
      tag: "Feed / Social Square",
      icon: "⏹️",
      isProOnly: true,
    },
  ];

  const visualStyles: VisualStyleOption[] = useMemo(
    () => [
      {
        id: "cinematic",
        category: "realistic",
        label: lang === "en" ? "Cinematic" : "Cinematográfico",
        desc:
          lang === "en"
            ? "Dramatic lighting, depth and film-like framing"
            : "Iluminación dramática, profundidad y estética de cine",
        isProOnly: false,
      },
      {
        id: "3d-render",
        category: "animation",
        label: lang === "en" ? "3D Render" : "Render 3D",
        desc:
          lang === "en"
            ? "Modern 3D depth, soft lighting and tactile volume"
            : "Volumen 3D moderno, iluminación suave y acabados limpios",
        isProOnly: false,
      },
      {
        id: "vector",
        category: "graphic",
        label: lang === "en" ? "Minimalist Vector" : "Vector Minimalista",
        desc:
          lang === "en"
            ? "Clean shapes, crisp edges and modern brand clarity"
            : "Formas limpias, bordes definidos y claridad visual",
        isProOnly: false,
      },
      {
        id: "anime",
        category: "animation",
        label: lang === "en" ? "Anime / Concept Art" : "Anime / Arte Conceptual",
        desc:
          lang === "en"
            ? "Expressive animation look and stylized concept art"
            : "Estética de animación expresiva y arte conceptual",
        isProOnly: true,
      },
      {
        id: "photorealistic",
        category: "realistic",
        label: lang === "en" ? "Photorealistic Studio" : "Estudio Fotorrealista",
        desc:
          lang === "en"
            ? "Crisp studio-grade realism and natural textures"
            : "Realismo tipo estudio con texturas naturales y detalladas",
        isProOnly: true,
      },
      {
        id: "comic",
        category: "graphic",
        label: lang === "en" ? "Comic / Graphic Novel" : "Cómic / Novela Gráfica",
        desc:
          lang === "en"
            ? "Bold ink contours and dynamic graphic storytelling"
            : "Trazos marcados y narrativa visual con fuerza gráfica",
        isProOnly: true,
      },
    ],
    [lang]
  );

  const categories: { id: StyleCategory; label: string }[] = [
    { id: "all", label: lang === "en" ? "All Styles" : "Todos" },
    { id: "realistic", label: lang === "en" ? "Film & Photo" : "Cine y Foto" },
    { id: "animation", label: lang === "en" ? "3D & Anime" : "3D y Anime" },
    { id: "graphic", label: lang === "en" ? "Vector & Comic" : "Vector y Cómic" },
  ];

  const filteredStyles = useMemo(() => {
    if (selectedCategory === "all") return visualStyles;
    return visualStyles.filter((item) => item.category === selectedCategory);
  }, [selectedCategory, visualStyles]);

  const handleSelectAspect = (ratioId: string, isProOnly: boolean) => {
    if (isProOnly && !isPro) return;
    onUpdate({ aspectRatio: ratioId });
  };

  const handleSelectStyle = (styleId: string, isProOnly: boolean) => {
    if (isProOnly && !isPro) return;
    onUpdate({ visualStyle: styleId });
  };

  return (
    <div className={styles.stepContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>{t("step3_title")}</h1>
          <p className={styles.headingSub}>{t("step3_sub")}</p>
        </div>

        {/* Selector de Formato / Aspect Ratio */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            {t("step3_orientation_label")}
          </label>
          <div className={styles.cardsGrid}>
            {aspectRatios.map((ratio) => {
              const isSelected = data.aspectRatio === ratio.id;
              const isDisabled = ratio.isProOnly && !isPro;

              return (
                <button
                  key={ratio.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectAspect(ratio.id, ratio.isProOnly)}
                  className={`${styles.selectionCard} ${
                    isSelected ? styles.selectionCardSelected : ""
                  } ${isDisabled ? styles.selectionCardDisabled : ""}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardBadgeGroup}>
                      <span className={styles.cardIcon}>{ratio.icon}</span>
                      {ratio.isProOnly && (
                        <span className={styles.proBadge}>PRO 🔒</span>
                      )}
                    </div>
                    {!isDisabled ? (
                      <span
                        className={`${styles.radioCircle} ${
                          isSelected ? styles.radioCircleSelected : ""
                        }`}
                      >
                        {isSelected && <span className={styles.radioDot} />}
                      </span>
                    ) : (
                      <span className={styles.lockIcon}>🔒</span>
                    )}
                  </div>
                  <div>
                    <p className={styles.cardTitle}>{ratio.label}</p>
                    <span className={styles.cardTag}>{ratio.tag}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector de Estilo Visual con filtro por grupo */}
        <div className={styles.inputGroup}>
          <div className={styles.sectionHeaderRow}>
            <label className={styles.inputLabel}>
              {t("step3_style_label")}
            </label>

            <div className={styles.filterPillsGroup}>
              {categories.map((cat) => {
                const active = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`${styles.filterPill} ${
                      active ? styles.filterPillActive : ""
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.cardsGrid}>
            {filteredStyles.map((style) => {
              const isSelected = data.visualStyle === style.id;
              const isDisabled = style.isProOnly && !isPro;

              return (
                <button
                  key={style.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectStyle(style.id, style.isProOnly)}
                  className={`${styles.selectionCard} ${
                    isSelected ? styles.selectionCardSelected : ""
                  } ${isDisabled ? styles.selectionCardDisabled : ""}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardBadgeGroup}>
                      <span className={styles.cardTitle}>{style.label}</span>
                      {style.isProOnly && (
                        <span className={styles.proBadge}>PRO 🔒</span>
                      )}
                    </div>
                    {!isDisabled ? (
                      <span
                        className={`${styles.radioCircle} ${
                          isSelected ? styles.radioCircleSelected : ""
                        }`}
                      >
                        {isSelected && <span className={styles.radioDot} />}
                      </span>
                    ) : (
                      <span className={styles.lockIcon}>🔒</span>
                    )}
                  </div>
                  <p className={styles.cardDesc}>{style.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sección de Subtítulos */}
        <div className={styles.subtitlesSection}>
          <div className={styles.subtitlesInfo}>
            <h4 className={styles.subtitlesTitle}>
              {lang === "en" ? "Automatic Subtitles" : "Subtítulos Automáticos"}
            </h4>
            <p className={styles.subtitlesDescription}>
              {data.subtitles
                ? lang === "en"
                  ? "Include stylized subtitles ready for social media."
                  : "Incluir subtítulos estilizados listos para redes sociales."
                : lang === "en"
                ? "The video will be generated without on-screen text."
                : "El video se generará sin texto en pantalla."}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={data.subtitles}
            onClick={() => onUpdate({ subtitles: !data.subtitles })}
            className={`${styles.toggleSwitch} ${
              data.subtitles ? styles.toggleOn : styles.toggleOff
            }`}
          >
            <span
              className={`${styles.toggleThumb} ${
                data.subtitles ? styles.thumbOn : styles.thumbOff
              }`}
            />
          </button>
        </div>
      </div>

      {/* Botones de Navegación */}
      <div className={styles.footerAction}>
        <button type="button" onClick={onPrev} className={styles.backBtn}>
          {t("step3_back_btn")}
        </button>
        <button
          type="button"
          disabled={!data.aspectRatio || !data.visualStyle}
          onClick={onNext}
          className={styles.nextBtn}
        >
          {t("step3_next_btn")}
          <svg
            className={styles.iconSvg}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
