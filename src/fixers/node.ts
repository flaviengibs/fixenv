import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { run, runSafe } from '../core/shell';
import { log } from '../core/logger';
import { createSpinner } from '../core/spinner';

function getNvmScript(): string | null {
  const candidates = [
    path.join(os.homedir(), '.nvm', 'nvm.sh'),
    '/usr/local/opt/nvm/nvm.sh',
    '/opt/homebrew/opt/nvm/nvm.sh',
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Attempt to fix the Node.js version using nvm.
 * @param required - The required version string (e.g. "20.11.0" or "20")
 */
export async function fixNodeVersion(required: string): Promise<void> {
  const nvmScript = getNvmScript();

  if (!nvmScript) {
    log.warn('nvm not found. Cannot auto-fix Node.js version.');
    log.info('Install nvm: https://github.com/nvm-sh/nvm#installing-and-updating');
    log.info(`Then run: nvm install ${required} && nvm use ${required}`);
    return;
  }

  const spinner = createSpinner(`Installing Node.js ${required} via nvm...`);
  spinner.start();

  try {
    // Source nvm and run install + use in a single shell invocation
    const installCmd = `bash -c 'source "${nvmScript}" && nvm install ${required} && nvm use ${required}'`;
    await run(installCmd);
    spinner.succeed(`Node.js ${required} installed and activated`);
  } catch (err: unknown) {
    spinner.fail(`Failed to install Node.js ${required} via nvm`);
    const e = err as Error;
    log.error(e.message);
    log.info(`Try manually: nvm install ${required} && nvm use ${required}`);
  }
}

/**
 * Check if nvm is available on this system.
 */
export async function isNvmAvailable(): Promise<boolean> {
  const nvmScript = getNvmScript();
  if (!nvmScript) return false;

  const result = await runSafe(`bash -c 'source "${nvmScript}" && nvm --version'`);
  return !result.error && !!result.stdout.trim();
}
