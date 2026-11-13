# Cempai.ai — Developer Handbook & Engineering Standards

## 1. Local Development Setup
To run the full monorepo locally, both the backend server and the frontend client must run concurrently in separate terminal instances.

### Prerequisites
* **Node.js:** v20.x or v26+ (ES Modules `"type": "module"` enabled).
* **FFmpeg:** Installed globally on the host OS for local media rendering.
* **MongoDB Atlas:** Active cluster connection string.

### Step 1: Start the Backend Server (`server/`)
```bash
cd server
npm install
npm run dev
```
* **Default Port:** `http://localhost:3030`
* **Required `server/.env` variables:**
  * `PORT=3030`
  * `MONGO_URI=<your_mongodb_connection_string>`
  * `OPENAI_API_KEY=<your_openai_api_key>`
  * `ELEVENLABS_API_KEY=<your_elevenlabs_api_key>`
  * `GOOGLE_CLIENT_ID=<your_google_oauth_client_id>`

### Step 2: Start the Frontend Client (`client/`)
```bash
cd client
npm install
npm run dev
```
* **Default Port:** `http://localhost:5173`
* **Required `client/.env` variables:**
  * `VITE_API_URL=http://localhost:3030`
  * `VITE_GOOGLE_CLIENT_ID=<your_google_oauth_client_id>`

---

## 2. Git Workflow & Branching Strategy
We follow a structured feature-branch workflow to keep `main` stable and production-ready at all times:
* **`main`:** Protected production-ready branch. Never commit broken code or untested experimental changes directly here.
* **Feature Branches (`feat/<name>`):** Used for new product capabilities (e.g., `feat/elevenlabs-audio-sync`, `feat/ffmpeg-subtitles`).
* **Bugfix Branches (`fix/<name>`):** Used for isolated fixes (e.g., `fix/credit-deduction-race-condition`).
* **Documentation Branches (`docs/<name>`):** Used for architectural specs and documentation updates (e.g., `docs/project-architecture-and-specs`).

### Standard Commit Convention
Keep commit messages clear, descriptive, and scoped:
* `docs: add developer handbook and security architecture`
* `feat(wizard): enforce terms checkbox before video generation`
* `fix(llm): enforce 30s duration cap on free_trial tier`

---

## 3. Core Engineering Rules (Do's & Don'ts)
1. **Single Contract Principle:** Never pass loose form fields from the frontend to AI endpoints. Always construct and validate payloads through `client/src/utils/masterVideoPayload.ts`.
2. **Backend Guardrails Are Law:** Client-side checks (such as credit balances or duration caps) are for UX only. The backend (`server/`) must always re-verify user credits, plan limits (`30s` vs `70s`), and authentication tokens before executing paid AI API calls.
3. **Component Styling:** Keep styles modular using CSS Modules (`*.module.css`) paired directly with their respective `.tsx` components.
4. **Docs as Code:** Any change to business rules, credit pricing, API endpoints, or payload schemas must be updated in `/docs` within the same pull request or branch.
