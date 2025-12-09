# PROJECT_OVERVIEW.md — Session Starter / Continuation Brief

This document is the high-level, always-up-to-date summary of the project.

The human will copy/paste this file at the beginning of new sessions with
ChatGPT, Gemini, Cursor, Bolt, or DeepSeek to provide immediate context.

All agents must keep this file accurate and current.

## 1. Project Name
AgentFoundry

## 2. Current Vision / Purpose
AgentFoundry is a "Zero to One" Agent Operations Platform. It allows non-technical business owners to build, test, and manage AI agents. It differentiates itself by offering "Agent Genomes" (clonable templates), a "Neural Router" for multi-agent architectures, and an automated "Test & Drift" center that can auto-correct agent behavior using AI.

## 3. Key Features / Modules
- **Agent Builder Wizard**: Step-by-step creation with Template cloning (Genomes).
- **Prompt Library**: Modular prompt management allowing reusability across agents.
- **Neural Router**: AI-driven routing layer to dispatch queries to specific agents based on intent.
- **Test Center**: Automated testing suites with Drift Detection and AI Auto-Fix capabilities.
- **Deployment**: Widget and API stub generation.
- **Dashboard**: Real-time analytics on agent performance and drift.

## 4. Current Status
MVP Complete. The application is fully functional as a client-side React application using LocalStorage for persistence and Google Gemini API for intelligence. All core "Zero to One" features (Routing, Drift Auto-Fix, Templates) are implemented.

## 5. Active Branches / Environments
- **main**: Production-ready MVP code.
- **deployment**: Client-side only (localStorage).

## 6. Most Recent Work
- Implemented `AgentChatModal` for real-time preview.
- Connected `PromptLibrary` to `AgentConfig` (Prompt Modules).
- Built `TestCenter` with `suggestDriftFixes` (Auto-correction).
- Created `RouterBuilder` for multi-agent intent routing.
- Polished UI with Tailwind and added Deployment modal.

## 7. Known Issues / Risks
- **Persistence**: Currently uses `localStorage`. Data is local to the browser.
- **API Security**: API Key is exposed in frontend env (MVP limitation).
- **CORS**: URL knowledge source scraping is simulated due to browser restrictions.

## 8. Next Intended Actions
- Implement real backend (Node/Firebase) for cross-device persistence.
- Add User Authentication.
- Implement real "Website Widget" script hosting.

## 9. User Feedback Highlights
(Awaiting user feedback on MVP launch)

## 10. Last Updated
- Date: 2023-10-27
- By: Gemini
- Summary of change: Finalized MVP features, added multi-agent continuity documentation.
