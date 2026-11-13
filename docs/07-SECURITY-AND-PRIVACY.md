# Cempai.ai — Security, Data Privacy & Compliance Architecture

## 1. Data Privacy & Regulatory Compliance (US Standards)
**Cempai.ai** operates under strict data protection and consumer privacy principles aligned with United States regulations (including CCPA/CPRA guidelines for California residents):
* **Data Minimization:** We collect only essential user account metadata (email, hashed credentials or OAuth tokens, credit balance, and generated video history) stored securely in MongoDB Atlas.
* **User Ownership of AI Output:** Users retain full commercial rights to the videos generated using their prompts and credits, provided the content complies with our *AI Content Generation Policy* (strictly prohibiting illegal content, malicious deepfakes, or copyright infringement).

---

## 2. Secrets & Credential Management
* **Environment Isolation:** Sensitive API keys (`OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `MONGO_URI`, `GOOGLE_CLIENT_ID`) are isolated strictly within server-side `.env` files (`server/.env`) and are never exposed to the client-side Vite bundle.
* **Version Control Protection:** All `.env` files and local secret configurations are explicitly excluded from Git tracking via `.gitignore`.

---

## 3. Authorized Third-Party Subprocessors
To deliver end-to-end automated video production, Cempai.ai relies on the following vetted infrastructure and AI partners:

| Subprocessor | Role / Service | Data Shared |
| :--- | :--- | :--- |
| **MongoDB Atlas** | Primary Cloud Database | User profiles, encrypted auth data, credit balances, project records. |
| **OpenAI** | LLM Script & Prompt Structuring (`gpt-4o-mini`) | User raw ideas/scripts, tone preferences (no PII shared). |
| **ElevenLabs** | Text-to-Speech (TTS) Voice Synthesis | Structured scene narration text (`voiceoverText`) and voice settings. |
| **Google OAuth** | Authentication Provider | Basic profile verification (name, email) during social sign-in. |

---

## 4. Temporary Media & Storage Hygiene
* **Local Render Pipeline (`server/output/`):** Intermediate audio files (e.g., `resultado.mp3`) and video chunks are processed temporarily inside `server/output/`.
* **Cleanup & Retention:** Temporary rendering artifacts are excluded from repository commits and scheduled for automated purge once final video compilation is delivered to the user's dashboard.
