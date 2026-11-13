# Cempai.ai — AI Pipeline & Media Processing Architecture

## 1. Overview of the AI Pipeline
The Cempai.ai pipeline transforms user inputs (ideas or custom scripts) into a fully polished MP4 video through four sequential micro-services handled by the backend (`server/`).

```text
[Wizard Step 5] ──> [1. LLM Script Generation] ──> [2. Voice Synthesis (TTS)] ──> [3. Visual Generation] ──> [4. FFmpeg Render]
## 2. Detailed Pipeline Stages

### 🎬 Stage 1: LLM Script Structuring (`llmService.js`)
* **Model & Protocol:** OpenAI `gpt-4o-mini` configured with strict JSON Object response schemas.
* **Input:** The `MasterVideoPayload` containing `userInputs` (raw idea, tone, duration limits).
* **Execution & Guardrails:**
  1. The backend builds a specialized prompt instructing the LLM to act as an expert viral video director.
  2. The LLM parses the user's idea and divides it into timed scenes (4-5 scenes for `free_trial`, 8-10 scenes for paid tiers).
  3. **Strict Language Separation Rule:** `title` and `voiceoverText` are generated in the user's target language (`en` or `es`), while `visualPrompt` is **always** generated in English to maximize image/video diffusion model fidelity.
  4. **Duration Enforcement:** The backend validates that cumulative scene durations do not exceed `maxDurationSeconds` (`30s` for `free_trial`, `70s` for paid tiers).

### 🎙️ Stage 2: Voice Synthesis & TTS (`elevenlabs.service.js`)
* **Provider:** ElevenLabs API.
* **Execution:**
  * Iterates through the structured scenes generated in Stage 1.
  * Sends each scene's `voiceoverText` along with the user's chosen `voiceId` (e.g., `sofia`, commercial voices) and voice configuration settings (stability, similarity boost).
  * Outputs high-quality synchronized audio files (temporarily stored in `server/output/` alongside assets like `resultado.mp3`).

### 🎨 Stage 3: Visual Generation (Image/Video Diffusion)
* **Provider:** Integrated image/video generation models (configured via style keys such as `3d-render`, `cinematic`, etc.).
* **Execution:**
  * Uses the English `visualPrompt` generated in Stage 1 combined with the `visualConfig` style modifiers.
  * Generates visual assets precisely matched to each scene's duration.

### 🎞️ Stage 4: Video Assembly & Rendering (FFmpeg)
* **Tool:** FFmpeg (Node.js backend integration).
* **Execution:**
  * Combines visual assets, synthesized voiceover tracks, and background music (`musicStyle`).
  * Applies automatic burned-in subtitles (`subtitlesEnabled: true`).
  * Applies the platform watermark overlay exclusively for `free_trial` users.
  * Exports the final compiled MP4 file directly to the user's dashboard gallery.

---

## 3. Error Handling & Quota Management
* **API Quotas (`insufficient_quota`):** If OpenAI returns a credit balance exhaustion error, the backend catches the exception, logs the quota failure, and returns a controlled error response to the client so the UI can gracefully prompt the user or handle fallback mechanisms.
* **Temporary Storage:** Local media chunks and intermediate audio files (such as `resultado.mp3`) are managed within `server/output/` for fast assembly before final delivery.
