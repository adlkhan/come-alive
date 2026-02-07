import { useState } from 'react';
import { Content, GoogleGenAI, Part } from '@google/genai';
import { TOOLS } from './tools/definitions.js';
import { ensureSandboxActive } from './sandbox/lifecycle.js';
import { executeCommand } from './sandbox/execute.js';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are running inside a secure, ephemeral Docker Sandbox (Alpine Linux) and have root access.
`;

// We define specific event types so the UI knows exactly what is happening
export type GeminiEvent =
  | { type: 'text_chunk'; text: string }
  | { type: 'tool_start'; command: string }
  | { type: 'tool_end'; output: string }
  | { type: 'error'; message: string }
  | { type: 'done' };

export function useGemini() {
  const [isStreaming, setIsStreaming] = useState(false);

  async function sendPrompt(initialHistory: Content[], onEvent: (event: GeminiEvent) => void) {
    setIsStreaming(true);

    // Create a local copy so we don't mutate the UI's state directly
    let history = [...initialHistory];

    // Safety Break: Prevent infinite loop e.g AI running same command over and over
    let turnCount = 0;
    const MAX_TURNS = 10;

    try {
      const container = await ensureSandboxActive();

      // THE AGENTIC LOOP
      while (turnCount < MAX_TURNS) {
        turnCount++;

        const result = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: history,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: TOOLS
          }
        });

        let accumulatedText = '';
        let functionCalls: any[] = [];

        // 1. Stream the response
        for await (const chunk of result) {
          if (chunk.text) {
            accumulatedText += chunk.text;
            onEvent({ type: 'text_chunk', text: chunk.text });
          }

          if (chunk.functionCalls) {
            functionCalls = [...functionCalls, ...chunk.functionCalls];
          }
        }

        // 2. Add the Model's turn to history (Crucial for memory)
        const modelParts: Part[] = [];
        if (accumulatedText) modelParts.push({ text: accumulatedText });

        if (functionCalls.length > 0) {
          functionCalls.forEach(call => {
            modelParts.push({ functionCall: call });
          });
        }

        history.push({ role: 'model', parts: modelParts });

        // 3. STOP CONDITION: If the AI didn't ask to run a tool, we are done.
        if (functionCalls.length === 0) {
          break;
        }

        // 4. EXECUTION PHASE
        const functionResponses: Part[] = [];

        for (const call of functionCalls) {
          if (call.name === 'execute_command') {
            const cmd = call.args.command as string;

            // Tell UI: "I am starting this tool"
            onEvent({ type: 'tool_start', command: cmd });

            let output = '';
            try {
              output = await executeCommand(container, cmd);
            } catch (err: any) {
              output = `Error executing command: ${err.message}`;
            }

            // Tell UI: "I finished, here is the output"
            onEvent({ type: 'tool_end', output });

            // Add result to function responses for the AI to read
            functionResponses.push({
              functionResponse: {
                name: call.name,
                response: { result: output }
              }
            });
          }
        }

        // 5. Feed the tool output back to the AI
        if (functionResponses.length > 0) {
          history.push({ role: 'user', parts: functionResponses });
        }
        // The loop now restarts. The AI will see the tool output in `history` and think again.
      }

      return history;

    } catch (error: any) {
      onEvent({ type: 'error', message: error.message });
    } finally {
      setIsStreaming(false);
      onEvent({ type: 'done' });
    }
  };

  return { sendPrompt, isStreaming };
}
