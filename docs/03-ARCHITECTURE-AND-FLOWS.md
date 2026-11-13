# Cempai.ai — System Architecture & Data Flows

## 1. Technology Stack
* **Frontend (`client/`):**
  * **Framework:** React + TypeScript (Vite).
  * **Styling:** CSS Modules (`*.module.css`) + Dark-mode SaaS UI.
  * **State & Contexts:** React Context API (`AuthContext`, `LanguageContext`) + `localStorage` persistence for unauthenticated wizard drafts (`wizardStorage.ts`).
* **Backend (`server/`):**
  * **Runtime & Framework:** Node.js (v26+) + Express.js (ES Modules `"type": "module"`).
  * **Database:** MongoDB (User profiles, authentication, credit balances, project metadata).
  * **AI & Media Integrations:**
    * **LLM Brain:** OpenAI SDK (`gpt-4o-mini` with strict JSON Object output).
    * **Voice Synthesis (TTS):** ElevenLabs API (Planned/Configured in payload).
    * **Video Rendering:** FFmpeg (Planned/Configured in payload).

---

## 2. Repository Structure
The monorepo is organized into three primary top-level directories:

```text
iavideogenerator/
├── client/                             # React + TypeScript Frontend (Vite - Port 5173)
│   ├── public/                         # Static public assets
│   └── src/
│       ├── assets/                     # Internal media & graphic assets
│       ├── components/
│       │   ├── auth/                   # AuthContext, AuthModal, TermsModal
│       │   ├── brand/                  # Brand identity & Logo components
│       │   ├── dashboard/              # User workspace & video gallery (Dashboard.tsx)
│       │   ├── landing/                # LandingPage, LanguageContext, NavBar, PricingSection, VideoShowcaseModal
│       │   ├── upgrade-modal/          # Plan upgrade & credit top-up modal (UpgradeModal.tsx)
│       │   └── wizard/                 # Studio Lite 5-step wizard (WizardContainer, WizardStep1..5, WizardProcessingStep, wizardStorage)
│       ├── styles/                     # Global styles & design-token.md
│       └── utils/
│           └── masterVideoPayload.ts   # Core factory building the MasterVideoPayload JSON
│
├── server/                             # Node.js + Express Backend (Port 3030)
│   ├── models/                         # Mongoose schemas (Users, Projects/Videos)
│   ├── output/                         # Temporary/rendered local media output directory
│   ├── routes/
│   │   └── llm.routes.js               # POST /api/llm/generate-script (+ auth/user routes)
│   ├── services/
│   │   └── llmService.js               # OpenAI integration, prompt engineering & duration guardrails
│   ├── .env                            # Server environment variables (OPENAI_API_KEY, MONGO_URI)
│   └── server.js                       # Express server entry point & route mounting
│
└── docs/                               # Project Documentation (Docs as Code)
    ├── 01-VISION-AND-SCOPE.md
    ├── 02-BUSINESS-RULES.md
    ├── 03-ARCHITECTURE-AND-FLOWS.md
    └── 04-AI-PIPELINE.md
    |__ 05-DESIGN-TOKEN.md