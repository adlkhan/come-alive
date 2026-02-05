import { useState } from 'react';
import { render, Box, Text, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { useGemini } from './useGemini.js';

// Following partially follows the Content type from Gemini's API 
type Message = {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[]
}

const App = () => {
  const { exit } = useApp();
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const { sendPrompt, isStreaming } = useGemini();

  const handleSubmit = () => {
    if (!input.trim()) return;

    if (input === 'exit') {
      exit();
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ text: input }]
    }

    // Prepare empty AI message
    // This will be populated as the AI replies
    // It will also include all the errors reported by the proceeses running in the container so the AI knows how to fix them
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      parts: [{ text: '' }]
    }

    const updatedConversation = [...conversation, userMsg, aiMsg];

    setConversation(updatedConversation);
    setInput('');

    // Send conversation to AI but strip IDs because they are only necessary for React

    const conversationForAI = updatedConversation.map(msg => ({
      role: msg.role,
      parts: msg.parts
    }));

    sendPrompt(conversationForAI, (newText) => {
      setConversation(prev => {
        return prev.map(msg => {
          if (msg.id === aiMsg.id) {
            return {
              ...msg,
              parts: [{ text: msg.parts[0].text + newText }]
            };
          }
          return msg;
        })
      });
    });
  }

  return (
    <Box flexDirection="column">
      {/* --- HEADER --- */}
      <Box borderStyle="round" borderColor="green" paddingX={1}>
        <Text bold color="green">COME ALIVE</Text>
        {isStreaming && <Text color="yellow"> (Thinking...)</Text>}
      </Box>

      {/* --- CHAT HISTORY --- */}
      <Box flexDirection="column" flexGrow={1} paddingY={1}>
        {conversation.map((msg) => (
          <Box key={msg.id} flexDirection="row" marginBottom={1}>
            <Text bold color={msg.role === 'user' ? 'blue' : 'magenta'}>
              {msg.role === 'user' ? 'You: ' : 'AI:  '}
            </Text>
            {/* We preserve newlines so code blocks render correctly */}
            <Text>{msg.parts[0].text}</Text>
          </Box>
        ))}
      </Box>

      {/* --- INPUT FOOTER --- */}
      <Box borderStyle="single" borderColor={isStreaming ? 'yellow' : 'gray'}>
        <Text color="green">❯ </Text>
        {isStreaming ? (
          <Text dimColor>Wait for AI to finish...</Text>
        ) : (
          <TextInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            placeholder="Type 'List files' to test the hands..."
          />
        )}
      </Box>
    </Box>
  );
};

render(<App />);
