import { useEffect, useState } from "react";
import type { WizardData } from "./WizardStep1";
import { useLanguage } from "../landing/LanguageContext";
import { useAuth } from "../auth/AuthContext";
import styles from "./WizardStep1B.module.css";
import { SCRIPT_TEMPLATES } from "../../config/templates";

interface Step1BProps {
  data: WizardData;
  onUpdate: (fields: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
  wizardMode?: "lite" | "pro";
}

export default function WizardStep1B({
  data,
  onUpdate,
  onNext,
  onPrev,
  wizardMode = "lite",
}: Step1BProps) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const isPro = wizardMode === "pro";
  const isPaidUser =
    isPro || ["pro", "unlimited", "pay_per_video"].includes((user as any)?.plan);

  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const stopSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  };

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  const tones = [
    {
      id: "professional",
      label: lang === "en" ? "Professional" : "Profesional",
      desc:
        lang === "en"
          ? "Serious, clear, and business-focused"
          : "Serio, claro y enfocado en negocios",
    },
    {
      id: "dynamic",
      label: lang === "en" ? "Dynamic" : "Dinámico",
      desc:
        lang === "en"
          ? "Fast-paced, entertaining, and high energy"
          : "Rápido, entretenido y con ritmo alto",
    },
    {
      id: "casual",
      label: lang === "en" ? "Casual" : "Casual",
      desc:
        lang === "en"
          ? "Approachable, friendly, and conversational"
          : "Cercano, amigable y conversacional",
    },
  ];

  const hooksList = SCRIPT_TEMPLATES.filter((item) => item.type === "hook");
  const ctasList = SCRIPT_TEMPLATES.filter((item) => item.type === "cta");

  const handleSelectTemplate = (
    type: "hook" | "cta",
    templateId: string,
    isProOnly?: boolean
  ) => {
    if (isProOnly && !isPaidUser) return;
    stopSpeech();

    if (type === "hook") {
      onUpdate({ introHook: data.introHook === templateId ? "" : templateId });
    } else {
      onUpdate({ outroCta: data.outroCta === templateId ? "" : templateId });
    }
  };

  const handleListenTemplate = (tpl: any) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingId === tpl.id) {
      stopSpeech();
      return;
    }

    stopSpeech();
    const spokenText =
      tpl?.text?.[lang] || tpl?.script?.[lang] || tpl?.label?.[lang] || "";
    if (!spokenText) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = lang === "en" ? "en-US" : "es-ES";
    utterance.rate = data.tone === "dynamic" ? 1.12 : data.tone === "casual" ? 1.02 : 0.96;
    utterance.pitch = data.tone === "dynamic" ? 1.08 : 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(tpl.id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.contentSection}>
        <div>
          <h1 className={styles.headingTitle}>
            {lang === "en"
              ? "Structure, Hooks & Tone"
              : "Estructura, Ganchos y Tono"}
          </h1>
          <p className={styles.headingSub}>
            {lang === "en"
              ? "Customize your video opening, closing CTA, and communication tone."
              : "Personaliza la apertura de tu video, el cierre y el tono de comunicación."}
          </p>
        </div>

        {/* SECCIÓN DE GANCHOS Y CIERRES EN DOS COLUMNAS */}
        <div className={styles.templatesGrid}>
          {/* Columna Ganchos (Hooks) */}
          <div className={styles.templateColumn}>
            <label className={styles.templateColumnLabel}>
              🎣 {lang === "en" ? "Intro Hook" : "Gancho Inicial"}
            </label>
            <div className={styles.templateScrollList}>
              <div
                onClick={() => {
                  stopSpeech();
                  onUpdate({ introHook: "" });
                }}
                className={`${styles.templateOption} ${
                  !data.introHook ? styles.templateOptionSelected : ""
                }`}
              >
                <div className={styles.templateOptionTitle}>
                  {lang === "en" ? "✨ Auto / Default" : "✨ Automático"}
                </div>
              </div>
              {hooksList.map((tpl: any) => {
                const isSelected = data.introHook === tpl.id;
                const isLocked = tpl.isProOnly && !isPaidUser;
                const isSpeaking = speakingId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate("hook", tpl.id, tpl.isProOnly)}
                    className={`${styles.templateOption} ${
                      isSelected ? styles.templateOptionSelected : ""
                    } ${isLocked ? styles.templateOptionLocked : ""}`}
                  >
                    <div className={styles.templateOptionRow}>
                      <span className={styles.templateOptionTitle}>
                        {tpl.label[lang]}
                      </span>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleListenTemplate(tpl);
                          }}
                          aria-label={
                            isSpeaking
                              ? lang === "en"
                                ? "Stop hook preview"
                                : "Detener gancho"
                              : lang === "en"
                              ? "Listen to hook"
                              : "Escuchar gancho"
                          }
                          className={`${styles.listenBtn} ${
                            isSpeaking ? styles.listenBtnActive : ""
                          }`}
                        >
                          {isSpeaking ? "⏹" : "▶"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna Cierres (CTAs) */}
          <div className={styles.templateColumn}>
            <label className={styles.templateColumnLabel}>
              🎯 {lang === "en" ? "Outro CTA" : "Cierre / CTA"}
            </label>
            <div className={styles.templateScrollList}>
              <div
                onClick={() => {
                  stopSpeech();
                  onUpdate({ outroCta: "" });
                }}
                className={`${styles.templateOption} ${
                  !data.outroCta ? styles.templateOptionSelected : ""
                }`}
              >
                <div className={styles.templateOptionTitle}>
                  {lang === "en" ? "🚫 None / Default" : "🚫 Ninguno / Default"}
                </div>
              </div>
              {ctasList.map((tpl: any) => {
                const isSelected = data.outroCta === tpl.id;
                const isLocked = tpl.isProOnly && !isPaidUser;
                const isSpeaking = speakingId === tpl.id;

                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate("cta", tpl.id, tpl.isProOnly)}
                    className={`${styles.templateOption} ${
                      isSelected ? styles.templateOptionSelected : ""
                    } ${isLocked ? styles.templateOptionLocked : ""}`}
                  >
                    <div className={styles.templateOptionRow}>
                      <span className={styles.templateOptionTitle}>
                        {tpl.label[lang]}
                      </span>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleListenTemplate(tpl);
                          }}
                          aria-label={
                            isSpeaking
                              ? lang === "en"
                                ? "Stop CTA preview"
                                : "Detener cierre"
                              : lang === "en"
                              ? "Listen to CTA"
                              : "Escuchar cierre"
                          }
                          className={`${styles.listenBtn} ${
                            isSpeaking ? styles.listenBtnActive : ""
                          }`}
                        >
                          {isSpeaking ? "⏹" : "▶"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SELECTOR DE TONO */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>
            {t("step1_tone_label") || "Communication Tone"}
          </label>
          <div className={styles.tonesGrid}>
            {tones.map((tone) => {
              const isSelected = data.tone === tone.id;
              return (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => onUpdate({ tone: tone.id })}
                  className={`${styles.toneCard} ${
                    isSelected ? styles.toneCardSelected : ""
                  }`}
                >
                  <div className={styles.toneHeader}>
                    <span className={styles.toneTitle}>{tone.label}</span>
                    <span
                      className={`${styles.radioCircle} ${
                        isSelected ? styles.radioCircleSelected : ""
                      }`}
                    >
                      {isSelected && <span className={styles.radioDot} />}
                    </span>
                  </div>
                  <p className={styles.toneDesc}>{tone.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FOOTER ESTÁNDAR */}
      <div className={styles.footerAction}>
        <button
          type="button"
          onClick={() => {
            stopSpeech();
            onPrev();
          }}
          className={styles.backBtn}
        >
          {t("wizard_back_btn") || (lang === "en" ? "Back" : "Atrás")}
        </button>
        <button
          type="button"
          onClick={() => {
            stopSpeech();
            onNext();
          }}
          className={styles.submitBtn}
        >
          {lang === "en" ? "Next: Voice and Style" : "Siguiente: Voz y Estilo"}
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
