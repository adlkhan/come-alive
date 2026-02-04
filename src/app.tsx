import React, { useState } from 'react';
import { render, Box, Text, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { useGemini } from './useGemini.js';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const App = () => {
  const { exit } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

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
      content: input,
    }

    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: Message = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
    }

    setMessages(prev => [...prev, userMsg, initialAiMsg]);

    setInput('');

    sendPrompt(input, (newText) => {
      setMessages(prev => {
        return prev.map(msg => {
          if (msg.id === aiMsgId) {
            return { ...msg, content: msg.content + newText };
          }
          return msg;
        })
      })
    });
  }

  return (
    <Box flexDirection="column" height={process.stdout.rows}>
      {/* Header */}
      <Box borderStyle="round" borderColor="green" paddingX={1}>
        <Text bold color="green">COME ALIVE (v0.3)</Text>
        {isStreaming && <Text color="yellow">  (Thinking...)</Text>}
      </Box>

      {/* Message History (The Chat Window) */}
      <Box flexDirection="column" flexGrow={1} paddingY={1}>
        {messages.map(msg => (
          <Box key={msg.id} flexDirection="row" marginBottom={1}>
            <Text bold color={msg.role === 'user' ? 'blue' : 'magenta'}>
              {msg.role === 'user' ? 'You: ' : 'AI: '}
            </Text>
            <Text>{msg.content}</Text>
          </Box>
        ))}
      </Box>

      {/* Input Area (The Footer) */}
      <Box borderStyle="single" borderColor={isStreaming ? 'yellow' : 'gray'}>
        <Text color="green">❯ </Text>

        {isStreaming ? (
          <Text dimColor>Wait for AI...</Text>
        ) : (
          <TextInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            placeholder="Type a message..."
          />
        )}
      </Box>
    </Box >
  );
}

render(<App />);
