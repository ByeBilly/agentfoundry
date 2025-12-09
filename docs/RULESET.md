# RULESET.md

## General Development Rules

1. **Tech Stack**: React, TypeScript, Tailwind CSS, Google Gemini SDK.
2. **State Management**: LocalStorage for MVP persistence.
3. **Styling**: Use Tailwind utility classes. Avoid custom CSS files where possible.

### Rule 1 — Mandatory Multi-Agent Continuity Logging

All agents must record information that future agents will need, including:

- Communications intended for future ChatGPT, Gemini, Cursor, Bolt, and DeepSeek sessions  
- Context that would otherwise be lost across builds or merges  
- Architectural decisions, reasoning, constraints, and technical assumptions  
- Any information required for safe continuation of development  

Continuity information must be logged in:

- docs/CONTINUITY.md  
- docs/NOTES_CHATGPT.md  
- docs/PROJECT_OVERVIEW.md  
- docs/REDTEAM.md  
- docs/USER_FEEDBACK.md  
- docs/SPEC.md  
