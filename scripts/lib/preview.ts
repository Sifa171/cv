import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.once('error', reject);
    srv.listen(0, () => {
      const { port } = srv.address() as { port: number };
      srv.close(() => resolve(port));
    });
  });
}

async function waitFor(url: string, timeoutMs: number): Promise<void> {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // Server startet noch.
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Preview nicht erreichbar: ${url}`);
}

/** Startet `astro preview` auf einem freien Port, führt fn aus und beendet den Server immer. */
export async function withPreview<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const port = await freePort();
  const child = spawn('npx', ['astro', 'preview', '--port', String(port), '--ignore-lock'], { stdio: 'ignore' });
  try {
    const baseUrl = `http://localhost:${port}`;
    await waitFor(`${baseUrl}/de/`, 30_000);
    return await fn(baseUrl);
  } finally {
    child.kill('SIGTERM');
  }
}
