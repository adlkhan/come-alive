import { useState } from 'react';
import { Content, GoogleGenAI, Part } from '@google/genai';
import { TOOLS } from './tools/definitions.js';
import { ensureSandboxActive } from './sandbox/lifecycle.js';
import { executeCommand } from './sandbox/execute.js';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const useGemini = () => {
  const [isStreaming, setIsStreaming] = useState(false);

  const sandboxPromise = ensureSandboxActive();

  const sendPrompt = async (
    history: Content[],
    onChunk: (text: string) => void
  ) => {
    setIsStreaming(true);
    try {
      const container = await sandboxPromise;

      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: history,
        config: {
          tools: TOOLS
        }
      });

      for await (const chunk of response) {
        if (chunk.text) {
          onChunk(chunk.text);
        }

        const functionsCalls = chunk.functionCalls;
        if (functionsCalls) {
          for (const call of functionsCalls) {
            if (call.name === 'execute_command') {
              const cmd = call.args.command as string;
              onChunk(`\n\n> ⚙️ Executing: ${cmd}...\n`);

              try {
                const output = await executeCommand(container, cmd);
                onChunk(`\n> ✅ Output:\n${output}\n\n`);
              } catch (err: any) {
                onChunk(`\n> ❌ Error: ${err.message}\n`);
              }
            }
          }
        }
      }
    } catch (error) {
      onChunk(`\n[System Error]: ${error}`);
    } finally {
      setIsStreaming(false);
    }
  };

  return { sendPrompt, isStreaming };
}
