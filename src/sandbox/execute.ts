/**
 * Executes command in docker and reports its output.
*/

import Docker from 'dockerode';

/**
 * Helper to collect stream output.
 */

const collectOutput = (stream: NodeJS.ReadableStream): Promise<string> => {
  return new Promise((resolve, reject) => {
    let output = '';
    stream.on('data', chunk => {
      output += chunk.toString();
    });

    stream.on('end', () => resolve(output));
    stream.on('error', reject);
  });
}

export const executeCommand = async (container: Docker.Container, cmd: string) => {
  console.log(`🚀 Executing: "${cmd}"`);

  const exec = await container.exec({
    Cmd: ['sh', '-c', cmd],
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  });

  const stream = await exec.start({ hijack: true, stdin: false });

  const output = await collectOutput(stream);

  const execInfo = await exec.inspect();

  if (execInfo.ExitCode !== 0) {
    throw new Error(`Command failed (Exit Code ${execInfo.ExitCode}):\n${output}`);
  }

  return output.trim();
}
