import Docker from 'dockerode';

const docker = new Docker();
const CONTAINER_NAME = 'come-alive-box';

export const ensureSandboxActive = async () => {
  console.log("📦 Checking Sandbox status...");

  const container = docker.getContainer(CONTAINER_NAME);

  try {
    const info = await container.inspect();

    if (info.State.Running) {
      console.log("✅ Sandbox is already running.");
      return container;
    } else {
      console.log("🔄 Sandbox exists but is stopped. Starting...");
      await container.start();
      return container;
    }
  } catch (error: any) {
    if (error.statusCode === 404) {
      console.log("🛠️ Creating new Sandbox...");
      const newContainer = await docker.createContainer({
        Image: 'node:20-alpine',
        name: CONTAINER_NAME,
        // Keep it alive indefinitely
        Cmd: ['tail', '-f', '/dev/null'],
        HostConfig: {
          NetworkMode: 'bridge'
        }
      });
      await newContainer.start();
      console.log("✅ Sandbox created and started.");
      return newContainer;
    }
    throw error;
  }
}

export const killSandbox = async () => {
  const container = docker.getContainer(CONTAINER_NAME);
  try {
    console.log("💀 Attempting to destroy Sandbox...");
    await container.remove({ force: true });
    console.log("🗑️ Sandbox destroyed successfully.");
  } catch (error: any) {
    if (error.statusCode === 404) {
      console.log("Error: Sandbox not found.");
      return;
    }
    throw error;
  }
};
