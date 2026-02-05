/**
 * Verifies whether Docker is functional
 *
*/

import Docker from 'dockerode';

const docker = new Docker();

export const verifyDockerConnection = async () => {
  try {
    console.log("🔌 Attempting to talk to Docker Daemon...");

    // 2. Simple Ping
    await docker.ping();
    console.log("✅ Docker Daemon is alive and listening.");

    // 3. List info to prove we have permissions
    const info = await docker.info();
    console.log(`🐳 Connected to: ${info.Name} (Containers: ${info.Containers})`);

    return true;
  } catch (error) {
    console.error("❌ FAILED to connect to Docker.");
    console.error("1. Is Docker Desktop running?");
    console.error("2. Do you have permission to access /var/run/docker.sock?");
    console.error(error);
    return false;
  }
};
