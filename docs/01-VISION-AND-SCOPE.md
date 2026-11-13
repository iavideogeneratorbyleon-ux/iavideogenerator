# Cempai.ai — Vision, Objectives, and Project Scope

## 1. Vision & Purpose
**Cempai.ai** is an AI-driven automated video production SaaS platform. Its core mission is to empower content creators, entrepreneurs, and brands to transform raw ideas or written scripts into ready-to-publish vertical or horizontal videos for social media—eliminating the need for technical video editing, voiceover recording, or graphic design skills.

---

## 2. Product Ecosystem (Roadmap)
The system architecture is designed modularly to scale across three distinct product tiers:

### 🟢 Phase 1 (Current / MVP): **Studio Lite**
* **Focus:** Rapid short-form video creation via a guided 5-step wizard interface.
* **Workflow:** Raw Idea or Custom Script → Tone & Aspect Ratio → Voice & Background Music → Visual Style & Subtitles → Automated Generation.
* **Status:** Client and Server architectures connected; currently validating the end-to-end *Free Trial* LLM pipeline.

### 🟡 Phase 2 (Planned): **Director Studio**
* **Focus:** Granular scene-by-scene creative control. Users will be able to edit the LLM-generated structured script, regenerate individual scene visuals, and manually fine-tune scene durations prior to final rendering.

### 🔵 Phase 3 (Planned): **Studio Blueprints**
* **Focus:** Niche-specific templates and batch automation workflows (e.g., historical facts, personal finance, motivation, product reviews) for high-volume content production.

---

## 3. MVP Technical Scope (Studio Lite)
The Minimum Viable Product covers the end-to-end automated pipeline:
1. **Authentication & User Management:** User registration, login, OTP verification, and internal credit balance tracking.
2. **Master JSON Orchestration:** A single source-of-truth data contract (`MasterVideoPayload`) that translates frontend wizard selections into strict directives for backend AI engines.
3. **AI Script Structuring (LLM):** Automated generation of commercial titles, timed scene-by-scene narration, and English visual prompts via OpenAI (`gpt-4o-mini`).
4. **Voice Synthesis (TTS):** Natural-sounding voiceover generation powered by ElevenLabs.
5. **Visual Generation & Rendering:** Automated visual asset generation per scene, audio/music mixing, dynamic burned-in subtitles, and final MP4 video compilation (FFmpeg).
