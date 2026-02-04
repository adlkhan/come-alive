import React, { useState, useEffect } from 'react';
import { render, Text, Box } from 'ink';

const App = () => {
  const [status, setStatus] = useState('Initializing');
  const [ticks, setTicks] = useState(0);

  // Simple timer to prove the Event Loop is working
  useEffect(() => {
    const timer = setInterval(() => {
      setTicks(t => t + 1);
      setStatus(prev => prev === 'Thinking...' ? 'Initializing' : 'Thinking...');
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="green">
      <Text color="cyan" bold>
        COME ALIVE (v0.1)
      </Text>

      <Box marginTop={1}>
        <Text>System Status: </Text>
        <Text color="yellow">{status}</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Uptime: {ticks}s</Text>
      </Box>

      <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
        <Text>Waiting for user input...</Text>
      </Box>
    </Box>
  );
};

// Start the UI
render(<App />);
