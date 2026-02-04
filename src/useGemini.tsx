import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const useGemini = () => {
  const [isStreaming, setIsStreaming] = useState(false);

  const sendPrompt = async (
    prompt: string,
    onChunk: (text: string) => void
  ) => {
    setIsStreaming(true);
    try {
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      for await (const chunk of response) {
        if (chunk.text) {
          onChunk(chunk.text);
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
