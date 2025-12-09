# REDTEAM.md — Security & Risk Analysis

## Potential Risks (MVP)
- **API Key Exposure**: Client-side API usage exposes keys in the browser environment.
- **Data Loss**: LocalStorage is not permanent; clearing browser cache wipes agent data.
- **Prompt Injection**: Agents are susceptible to standard LLM jailbreaks; `forbiddenTopics` are soft guardrails only.

## Continuity Notes
- Future backend implementation must move API calls server-side.
- Auth layer required before multi-user deployment.
