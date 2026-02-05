import { Type, FunctionDeclaration, Tool } from '@google/genai';

const executeCommandDeclaration: FunctionDeclaration = {
  name: "execute_command",
  description: "Executes a shell command in the secure sandbox environment. Use this for ANY file system, coding, or testing operations.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      command: {
        type: Type.STRING,
        description: "The shell command to run (e.g., 'npm install', 'ls -la', 'cat file.ts')."
      }
    },
    required: ["command"]
  }
}

export const TOOLS: Tool[] = [
  {
    functionDeclarations: [executeCommandDeclaration]
  }
];
