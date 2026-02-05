/*
 * Sets up a Docker container for the AI. 
 * Returns the existing container if already created
 */

import Docker from 'dockerode';

const docker = new Docker();
const CONTAINER_NAME = 'come-alive-box';

export const ensureSandboxActive = async () => {
  const container = docker.getContainer(CONTAINER_NAME);

  try {
    const info = await container.inspect();

    if (info.State.Running) {
      return container;
    } else {
      await container.start();
      return container;
    }
  } catch (error: any) {
    if (error.statusCode === 404) {
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
      return newContainer;
    }
    throw error;
  }
}

export const killSandbox = async () => {
  const container = docker.getContainer(CONTAINER_NAME);
  try {
    await container.remove({ force: true });
  } catch (error: any) {
    if (error.statusCode === 404) {
      console.log("Error: Sandbox not found.");
      return;
    }
    throw error;
  }
};
