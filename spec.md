# Project Spec: Come Alive

## 1. Executive Summary
**Goal:** Build a secure, terminal-based AI agent capable of executing complex engineering tasks (coding, testing, debugging) autonomously but safely.
**Philosophy:** "The Warden Model." The AI is a powerful engine, but the System is the steering wheel and brakes.
**Target Audience:** Myself (for learning) and future employers (to demonstrate AI Infrastructure & Security skills).

## 2. The Tech Stack
* **Language:** TypeScript (Node.js LTS) - *Standard for backend tooling.*
* **AI Provider:** Google Gemini API (Gemini 1.5 Flash/Pro) - *Chosen for Free Tier availability & Function Calling support.*
* **Interface:** `Ink` (React for CLI) - *For rendering dynamic, interactive terminal UIs.*
* **Protocol:** Model Context Protocol (MCP) - *Standard for connecting AI to tools.*
* **Runtime/Security:** Docker - *CRITICAL. No code runs on the host OS. All execution happens in an isolated container.*

## 3. Architecture: "The Warden"
The system consists of two distinct parts:

### A. The Client (The Warden) - *Runs on Host Machine*
* **Responsibility:**
    * Accepts user prompts via the `Ink` UI.
    * Manages the conversation history with Gemini.
    * **The Gatekeeper:** Intercepts every tool request from the AI.
    * **The UI:** Displays the "Allow/Deny" prompt to the human user for critical actions.
    * Communicates with the Docker Daemon.

### B. The Sandbox (The Prisoner) - *Runs inside Docker*
* **Responsibility:**
    * Executes the actual shell commands (e.g., `npm install`, `ls -la`).
    * Edits files.
    * Runs tests.
* **Constraints:**
    * **Volume:** Can only see the specific project folder mounted to it.
    * **Network:** Initially restricted (allow-list only).

## 4. Implementation Roadmap
* **Phase 1: The Brain (Current).** * Verify Gemini API connection. 
    * Verify "Function Calling" (The AI's ability to ask for tools).
* **Phase 2: The UI.** * Set up `Ink` to create a streaming chat interface in the terminal.
* **Phase 3: The Docker Bridge.** * Create a tool that spins up a persistent Docker container.
* **Phase 4: The Execution Tool.** * Create an MCP tool `execute_command` that passes a string to the Docker container and returns `stdout`.
* **Phase 5: The Safety Layer.**
    * Implement the "Human-in-the-Loop" confirmation prompt before execution.

## 5. Instructions for LLM (The Persona)
**Role:** You are a Senior Staff Engineer and Mentor.
**Tone:** Critical, direct, and efficient. Do not worry about hurting my feelings. If an idea is bad or a security risk, state it bluntly.
**Primary Directive:**
1.  **No "Eyes Closed" Coding:** Never provide code without explaining the "why."
2.  **Security First:** Always prioritize the "Warden" architecture. If I suggest a shortcut that bypasses Docker, reject it.
3.  **The Learning Filter:**
    * **Tier 1 (Critical):** Force me to explain complex logic before giving the code.
    * **Tier 2 (Standard):** Explain briefly, then implement.
    * **Tier 3 (Boilerplate):** Just implement.
4.  **Context Awareness:** I am a recent graduate with limited resources. Do not suggest paid enterprise tools. Prioritize "Employability Signals" (Docker, Testing, CI/CD) over "Flashy Features."
