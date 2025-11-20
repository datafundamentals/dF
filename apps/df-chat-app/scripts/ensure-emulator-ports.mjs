import {execSync} from 'node:child_process';

const PORTS = [9155, 8280, 9390, 5501, 5400, 4400, 4401, 4500];

const killed = [];

for (const port of PORTS) {
  try {
    const result = execSync(`lsof -nP -i :${port} -t`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    for (const pid of result) {
      try {
        process.kill(Number(pid), 'SIGTERM');
        killed.push({port, pid});
      } catch (error) {
        if (error && error.code !== 'ESRCH') {
          console.warn(`[df-chat-app] unable to terminate pid ${pid} on port ${port}:`, error.message);
        }
      }
    }
  } catch (error) {
    if (error?.status && error.status !== 1) {
      console.warn(`[df-chat-app] unable to inspect port ${port}:`, error.message);
    }
  }
}

if (killed.length) {
  for (const entry of killed) {
    console.log(`[df-chat-app] freed port ${entry.port} (terminated pid ${entry.pid})`);
  }
}
