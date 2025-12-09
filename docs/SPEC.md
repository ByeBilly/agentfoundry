# SPEC.md — AgentFoundry Technical Specification

## Core Architecture
- **Frontend**: React 19 + TypeScript + Tailwind.
- **AI**: Google Gemini 2.5 Flash via `@google/genai` SDK.
- **Storage**: `localStorage` (Service layer abstraction allows future swap).
- **Icons**: Lucide React.
- **Charts**: Recharts.

## Data Models
See `types.ts` for definitive schemas on `AgentConfig`, `PromptTemplate`, `RouterConfig`, and `TestSuite`.
