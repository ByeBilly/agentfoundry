# CONTINUITY.md — Mandatory Multi-Agent Continuity Standard

This document defines the **Universal Continuity Requirement** for this project.

It is a **priority document** that MUST be read and respected by **all agents**:
- ChatGPT (Architect & Orchestrator)
- DeepSeek (Creative Strategist, PM, Red-Team Analyst)
- Gemini (Feature Generator, Code Writer)
- Cursor (Local Executor, Integrator, Debugger)
- Bolt (CI, Automation, Validation)
- Human (Project Owner)

## Universal Continuity Requirement

All agents must help maintain long-term continuity across all repositories.

Agents MUST record information that future agents will need, including:

- Communications intended for future ChatGPT, Gemini, Cursor, Bolt, and DeepSeek sessions
- Context that would otherwise be lost between builds, merges, branches, or deployments
- Architectural decisions, reasoning, constraints, and technical assumptions
- Any knowledge required for other agents or for future development
- Notes about potential ambiguity, risk, or design intent  

This requirement is global and applies across *every repo* and *every project*.

## Where to record continuity information

Agents must log continuity information in one or more of:

- `docs/NOTES_CHATGPT.md`
- `docs/REDTEAM.md`
- `docs/USER_FEEDBACK.md`
- `docs/SPEC.md`
- `docs/PROJECT_OVERVIEW.md`
- This file (`docs/CONTINUITY.md`) when defining new continuity rules

## Required Reading Order (Before Work)

Before performing work in this repo, agents must read:

1. docs/CONTINUITY.md  
2. docs/PROJECT_OVERVIEW.md  
3. docs/USER_FEEDBACK.md  
4. docs/REDTEAM.md  
5. docs/NOTES_CHATGPT.md  
6. docs/RULESET.md  
7. docs/AGENTS.md  
