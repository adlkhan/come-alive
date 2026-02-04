import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

// 1. Setup the Client (New SDK Style)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  // 2. Define the Tool (New Syntax: parametersJsonSchema)
  const listFilesTool = {
    name: 'list_files',
    description: 'List files in the current directory',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'The path to list files from'
        }
      },
      required: ['path'],
    }
  };

  console.log("User: What files are in the current directory?");

  // 3. Call the Model
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'What files are in the current directory?',
      config: {
        tools: [{ functionDeclarations: [listFilesTool] }],
      }
    });

    // 4. Parse Response (New SDK Structure)
    // The new SDK puts function calls in `response.functionCalls` directly
    const calls = response.functionCalls;

    if (calls && calls.length > 0) {
      console.log("\n✅ SUCCESS! The AI tried to call a function.");
      console.log("---------------------------------------------");
      console.log(`Function Name: ${calls[0].name}`);
      console.log(`Arguments:`, calls[0].args);
      console.log("---------------------------------------------");
    } else {
      console.log("\n❌ FAIL. The AI just replied with text:");
      console.log(response.text);
    }

  } catch (error) {
    console.error("\n❌ ERROR: API Call Failed.");
    console.error(error);
  }
}

run();
