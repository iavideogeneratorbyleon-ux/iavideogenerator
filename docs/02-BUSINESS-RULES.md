# Cempai.ai — Business Rules, Monetization & User Tiers

## 1. Internal Credit Economy & Onboarding Psychology
* **Base Currency:** Credits.
* **Standard Generation Cost:** **30 credits per video** (applies to `Studio Lite` standard generations).
* **Free Trial Signup Endowment (Conversion Hook):**
  * Upon registration, every new `free_trial` user is granted **50 initial credits**.
  * Generating their first free video deducts **30 credits**, leaving a remaining balance of **20 credits**.
  * Because a standard generation requires 30 credits, the remaining 20 credits cannot fund a second full video on their own—creating a natural psychological incentive to upgrade or purchase a top-up/pass to utilize their leftover balance.
* **Credit Validation Flow:**
  1. Before triggering the AI pipeline, the client verifies that the user is authenticated and holds a balance of `>= 30 credits`.
  2. If the user has `< 30 credits` (such as a `free_trial` user with 20 credits remaining), generation is blocked and the **Pricing Modal** is triggered.
  3. Credits are deducted upon successful validation/execution of the generation request.
  *(Note: Legacy references to "1 credit per video" are officially deprecated).*

---

## 2. User Plans & Feature Matrix
The `MasterVideoPayload` enforces strict technical boundaries based on the user's `userPlan` attribute:

| Plan ID (`userPlan`) | Initial / Monthly Credits | Max Video Duration | Watermark | Target Scene Count (LLM) | Commercial / Advanced Features |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`free_trial`** | **50 credits** (one-time) | **30 seconds** | **Yes** (`Cempai.ai` overlay) | 4 to 5 scenes | Evaluation tier; strictly capped at 30s (leaves 20 credits after 1st video). |
| **`pay_per_video`** | +30 credits (or single pass) | **70 seconds** | **No** | 8 to 10 scenes | Single-video pass ($4.99); full resolution, no watermark. |
| **`pro`** | Monthly credit allocation | **70 seconds** | **No** | 8 to 10 scenes | Monthly subscription ($29/mo); priority processing & full access. |
| **`unlimited`** | Unlimited | **70 seconds** | **No** | 8 to 10 scenes | Enterprise/high-volume tier; unrestricted generation capacity. |

---

## 3. Hard Technical Guardrails (Enforced by Backend)
Regardless of user input length or LLM output variations, the backend (`llmService.js`) enforces two hard rules:
1. **Duration Cap:** The sum of `durationSeconds` across all generated scenes MUST NOT exceed `maxDurationSeconds` (`30s` for `free_trial`, `70s` for paid tiers). Any scene exceeding the cumulative cap is truncated before reaching the TTS/Video rendering stages.
2. **Language Separation:**
   * `voiceoverText` and `title` are strictly generated in the user's selected interface/target language (`en` or `es`).
   * `visualPrompt` is **always** generated in **English** to ensure maximum fidelity with image/video diffusion models, regardless of the user's spoken language.

---

## 4. Unauthenticated User Conversion Flow (Wizard Step 5)
To maximize user retention and minimize friction, unauthenticated visitors can complete the entire 5-step wizard before creating an account:
1. **Terms Acceptance:** The "Generate Video Now" button remains disabled until the user explicitly checks the *Terms of Service* and *AI Content Generation Policy* agreement.
2. **Draft Persistence:** If an unauthenticated user clicks "Generate Video Now", the **Conversion Modal** appears with three paths:
   * **Option 1 (Free Trial):** Saves the current wizard state to `localStorage` (`savePendingDraft`), opens the Signup Modal (granting 50 credits), and automatically resumes video generation upon successful registration (deducting 30 credits and leaving 20).
   * **Option 2 (Single Pass):** Redirects to the Pricing Modal for a one-time video purchase.
   * **Option 3 (Pro Subscription):** Redirects to the Pricing Modal for a monthly subscription.
