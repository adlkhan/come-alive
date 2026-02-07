# Project Spec: Come Alive
## 1. Executive Summary
**Goal:** Build a secure, terminal-based AI agent capable of executing complex engineering tasks (coding, testing, debugging) autonomously via a recursive "ReAct" loop.
**Philosophy:** "The Warden Model." The AI is the engine, the Sandbox (container) is the cell, and the Node.js App is the Warden controlling the flow.
**Target Audience:** Myself (for learning) and future employers (to demonstrate AI Infrastructure, Security & Docker skills).

## 2. The Tech Stack
* **Language:** TypeScript (Node.js LTS, ESM Modules)
* **AI Provider:** Google Gemini API (Gemini 2.5 Flash)
* **Interface:** `Ink` (React for CLI)
* **Container Runtime:** Docker (via `dockerode`) - *Manages the isolated "Prison Cell".*

## 3. Architecture
### A. The Warden (Host Application)
- Uses a Recursive ReAct Loop i.e. lets the AI execute tasks in the container recursively by feeding the output from the container.
- Keeps track of the context so the AI knows about what has already happened.
- Everything is controlled by the Warden and hence the name. Warden ensures that AI only has access to the sandbox that the Warden creates.

### B. The Sandbox
The container in which AI wil perform the required tasks of the user or programmer.

## 4. Implementation Roadmap
* **Phase 1: The Brain (AI) (Completed).**
* Verified Gemini API connection using `@google/genai`.

* **Phase 2: The UI (Completed).**
* Set up `Ink` streaming interface and `useGemini` hook.

* **Phase 3: The Docker Bridge (Completed).**
* Implemented `lifecycle.ts` to manage the persistent `node:20-alpine` container.

* **Phase 4: The Execution Tool (Completed).**
* Implemented `execute.ts` with TTY/Hijack support.
* Created `execute_command` schema in `definitions.ts`.

* **Phase 5: The Agentic Loop (In Progress).**
* **Goal:** Refactor `useGemini.ts` to handle recursion.
* **Goal:** Enable the AI to "hear" the output of its own tools and react to them (Self-Correction).

* **Phase 6: The Safety Layer (Future).**
* Implement "Human-in-the-Loop" interception.
* The Warden must prompt the user (Allow/Deny) before executing dangerous commands (e.g., `rm -rf`, network calls).

## 5. Instructions for LLM (The Persona)
**Role:** Senior Staff Engineer / Mentor.
**Tone:** Critical, direct, efficient.
**Primary Directive:**

1. **No "Eyes Closed" Coding:** Explain the "why" before the "how."
2. **Security First:** Strict adherence to the Docker Sandbox model.
3. **The Learning Filter:**
* **Tier 1 (Critical):** Force explanation of complex logic (e.g., Async Iterators, Docker Streams).
* **Tier 2 (Standard):** Brief explanation, then code.
* **Tier 3 (Boilerplate):** Just implement.

## 6. Known Issues / Tech Debt
* **UI Flicker:** Ink repaints cause flickering
* **State Amnesia:** If the Node.js host app restarts, the *Chat History* is lost, even though the *Docker Container* preserves the files. The AI loses context of what it just did.
* During fast typing, some of the characters get overwritten, probably race condition input state while typing

