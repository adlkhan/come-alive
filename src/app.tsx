import { useState, useRef } from 'react';
import { render, Box, Text, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { useGemini, GeminiEvent } from './useGemini.js';
import { Content } from '@google/genai';

// --- Types for UI State ---

type ToolLog = {
  command: string;
  output: string | null; // null means "Running..."
}

type UIContentPart =
  | { type: 'text', content: string }
  | { type: 'tool', log: ToolLog }

type UIMessage = {
  id: string;
  role: 'user' | 'model';
  parts: UIContentPart[];
}

const App = () => {
  const { exit } = useApp();
  const [input, setInput] = useState('');

  // UI State: This is what YOU see (Text + Tool Boxes)
  const [conversation, setConversation] = useState<UIMessage[]>([]);

  // AI Memory: This is the strict format the AI needs (JSON)
  // We use a Ref because we don't need re-renders when this changes, 
  // only when we call sendPrompt.
  const geminiHistory = useRef<Content[]>([]);

  const { sendPrompt, isStreaming } = useGemini();

  const handleSubmit = async () => {
    if (!input.trim()) return;
    if (input === 'exit') {
      exit();
      return;
    }

    const userText = input;
    setInput('');

    // 1. Add User Message to UI
    const userMsg: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ type: 'text', content: userText }]
    };

    // 2. Prepare Placeholder AI Message (We will fill this incrementally)
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: UIMessage = {
      id: aiMsgId,
      role: 'model',
      parts: []
    };

    setConversation(prev => [...prev, userMsg, aiMsg]);

    // 3. Update Strict History for API with the User's Input
    geminiHistory.current.push({ role: 'user', parts: [{ text: userText }] });

    // 4. Start the Loop
    // We pass the current history. sendPrompt will return the *new* history 
    // including all the tool executions and intermediate thoughts.
    const finalHistory = await sendPrompt(geminiHistory.current, (event: GeminiEvent) => {
      setConversation(prev => {
        // Find the AI message to update
        const newConv = [...prev];
        const msgIndex = newConv.findIndex(m => m.id === aiMsgId);
        if (msgIndex === -1) return prev;

        const msg = { ...newConv[msgIndex] };
        const parts = [...msg.parts];

        switch (event.type) {
          case 'text_chunk': {
            // Append to last text part or create new one if the last part was a tool
            const lastPart = parts[parts.length - 1];
            if (lastPart && lastPart.type === 'text') {
              parts[parts.length - 1] = {
                ...lastPart,
                content: lastPart.content + event.text
              };
            } else {
              parts.push({ type: 'text', content: event.text });
            }
            break;
          }
          case 'tool_start': {
            // Insert a new Tool Box
            parts.push({
              type: 'tool',
              log: { command: event.command, output: null }
            });
            break;
          }
          case 'tool_end': {
            // Find the running tool and finish it
            // We search backwards because it is almost always the last item
            for (let i = parts.length - 1; i >= 0; i--) {
              const p = parts[i];
              if (p.type === 'tool' && p.log.output === null) {
                parts[i] = {
                  ...p,
                  log: { ...p.log, output: event.output }
                };
                break;
              }
            }
            break;
          }
          case 'error': {
            parts.push({ type: 'text', content: `\n❌ Error: ${event.message}` });
            break;
          }
        }

        msg.parts = parts;
        newConv[msgIndex] = msg;
        return newConv;
      });
    });

    // 5. MEMORY SYNC: Update the persistent memory with what actually happened
    if (finalHistory) {
      geminiHistory.current = finalHistory;
    }
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* --- HEADER --- */}
      <Box borderStyle="round" borderColor="green" paddingX={1} marginBottom={1}>
        <Text bold color="green">COME ALIVE: THE WARDEN</Text>
        {isStreaming && <Text color="yellow"> (Thinking...)</Text>}
      </Box>

      {/* --- CHAT STREAM --- */}
      <Box flexDirection="column" marginBottom={1}>
        {conversation.map((msg) => (
          <Box key={msg.id} flexDirection="column" marginBottom={1}>
            {/* Message Header */}
            <Text bold color={msg.role === 'user' ? 'blue' : 'magenta'}>
              {msg.role === 'user' ? 'You' : 'AI'}:
            </Text>

            {/* Message Content Parts */}
            <Box flexDirection="column" paddingLeft={2}>
              {msg.parts.map((part, index) => {
                if (part.type === 'text') {
                  // Render standard text
                  return <Text key={index}>{part.content}</Text>;
                }

                if (part.type === 'tool') {
                  // --- RENDER VISIBLE LOG BOX ---
                  return (
                    <Box key={index} flexDirection="column" borderStyle="single" borderColor="yellow" marginY={1}>
                      <Box>
                        <Text color="yellow">Executing: </Text>
                        <Text bold>{part.log.command}</Text>
                      </Box>
                      <Box borderStyle="single" borderTop={true} borderBottom={false} borderLeft={false} borderRight={false} borderColor="gray">
                        {part.log.output === null ? (
                          <Text italic dimColor>Running...</Text>
                        ) : (
                          <Text dimColor>{part.log.output.trim() || "(No output)"}</Text>
                        )}
                      </Box>
                    </Box>
                  )
                }
                return null;
              })}
            </Box>
          </Box>
        ))}
      </Box>

      {/* --- INPUT --- */}
      <Box borderStyle="classic" borderColor={isStreaming ? 'yellow' : 'gray'}>
        <Text color="green">❯ </Text>
        {isStreaming ? (
          <Text dimColor>Wait for AI to finish...</Text>
        ) : (
          <TextInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            placeholder="Type 'Create a file named hello.ts'..."
          />
        )}
      </Box>
    </Box>
  );
};

render(<App />);
