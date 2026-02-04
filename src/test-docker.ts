import { verifyDockerConnection } from './sandbox/docker.js';
import { ensureSandboxActive, killSandbox } from './sandbox/lifecycle.js';
import { executeCommand } from './sandbox/execute.js';

(async () => {
  // 1. Check Connection
  const isConnected = await verifyDockerConnection();
  if (!isConnected) process.exit(1);

  // 2. Start the Sandbox
  const container = await ensureSandboxActive();

  // 3. Run a Command inside it
  const result = await executeCommand(container, 'echo "Hello from inside the Prison Cell!"');
  console.log("\n--- OUTPUT FROM CONTAINER ---");
  console.log(result);
  console.log("-----------------------------\n");

  // 4. Run a file check
  const fileList = await executeCommand(container, 'ls -la /');
  console.log("Root Directory Content:\n", fileList);

  // Cleanup (Optional - usually we keep it running, but for test we kill it)
  // await killSandbox();

})();
