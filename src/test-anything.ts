import { ensureSandboxActive, killSandbox } from './sandbox/lifecycle.js';
import { executeCommand } from './sandbox/execute.js';

(async () => {
  const container = await ensureSandboxActive();

  // Run a Command inside container
  const result = await executeCommand(container, 'echo "Hello from inside the Prison Cell!"');
  console.log("\n--- OUTPUT FROM CONTAINER ---");
  console.log(result);
  console.log("-----------------------------\n");

  // Run a file check
  const fileList = await executeCommand(container, 'ls -la /');
  console.log("Root Directory Content:\n", fileList);

  // Cleanup (Optional - usually we keep it running, but for test we kill it)
  await killSandbox();

})();
