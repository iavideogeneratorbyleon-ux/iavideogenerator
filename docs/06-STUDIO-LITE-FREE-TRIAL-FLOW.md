# Cempai.ai — Studio Lite Free Trial & End-to-End User Journey

## 1. Overview of the Studio Lite Free Trial Journey
The `Studio Lite` product tier is designed to deliver a high-conversion, frictionless onboarding experience. It allows visitors to configure and preview a complete automated video generation before creating an account, leveraging an engagement-driven credit endowment model.

---

## 2. Step-by-Step User Flow & Alternatives

### Phase 1: Frictionless Wizard Setup (Steps 1 to 4)
1. **Initial Access:** The user arrives at the platform and enters the `Studio Lite` wizard without requiring prior authentication.
2. **Wizard Configuration:**
   * **Step 1:** Defines the core concept (`userInputs.mode`: raw idea or custom script).
   * **Step 2:** Selects the tone (dynamic, professional, casual, etc.) and aspect ratio (`9:16` vertical or `16:9` horizontal).
   * **Step 3:** Chooses the ElevenLabs voice profile (e.g., `sofia`) and background music style.
   * **Step 4:** Selects the visual diffusion style (e.g., `3d-render`, `cinematic`) and toggles burned-in subtitles.

### Phase 2: Wizard Completion & Conversion Trigger (Step 5)
1. **Terms Enforcement:** The "Generate Video Now" button remains locked until the user explicitly accepts the *Terms of Service* and *AI Content Generation Policy*.
2. **Authentication Check:** Upon clicking generate, the frontend detects an unauthenticated session and opens the **Conversion Modal**, offering three distinct paths:
   * **Path A (Free Trial — Primary Hook):** The user registers a new account. The system immediately endows the profile with **50 initial credits** and sets the plan to `free_trial`.
   * **Path B (Pay Per Video):** Redirects to the pricing modal for a single-pass purchase ($4.99) for longer, watermark-free videos.
   * **Path C (Pro Subscription):** Redirects to the monthly subscription tier ($29/mo) for full access.

### Phase 3: Free Trial Execution & Credit Economy
If the user selects **Path A (Free Trial)**:
1. **Draft Persistence:** The wizard state stored in `localStorage` (`wizardStorage.ts`) is automatically retrieved so no configuration is lost.
2. **Credit Validation:** The backend verifies that the user holds `>= 30 credits` (possessing 50 fresh onboarding credits).
3. **Backend Pipeline Processing (`llmService.js`):**
   * **Duration Guardrail:** Automatically capped at a maximum of **30 seconds** total (divided into 4 to 5 scenes).
   * **Language Separation:** Titles and voiceovers match the user's language (`en` or `es`), while visual prompts are structured strictly in English.
4. **Credit Deduction:** Exactly **30 credits** are deducted for the generation, leaving a remaining balance of **20 credits**.

### Phase 4: Rendering and the Retention Loop
1. **Media Compilation:** The backend coordinates ElevenLabs voice synthesis, visual asset generation, and final FFmpeg video rendering (including the platform watermark overlay required for `free_trial`).
2. **The Endowed Progress Retention Effect:**
   * The final video appears in the user's dashboard gallery.
   * The user checks their balance and notices **20 remaining credits**.
   * When attempting to generate a second video, the system prompts that 30 credits are required—blocking the action and opening the **Upgrade Modal**. This leverages their existing balance to encourage conversion to a paid tier.
