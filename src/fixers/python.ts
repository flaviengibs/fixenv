import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { run, runSafe } from '../core/shell';
import { log } from '../core/logger';
import { createSpinner } from '../core/spinner';

function getPyenvRoot(): string | null {
  const candidates = [
    process.env['PYENV_ROOT'],
    path.join(os.homedir(), '.pyenv'),
    '/usr/local/opt/pyenv',
    '/opt/homebrew/opt/pyenv',
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (fs.existsSync(path.join(p, 'bin', 'pyenv'))) return p;
  }
  return null;
}

/**
 * Attempt to fix the Python version using pyenv.
 * @param required - The required version string (e.g. "3.11.0")
 */
export async function fixPythonVersion(required: string): Promise<void> {
  const pyenvRoot = getPyenvRoot();

  if (!pyenvRoot) {
    log.warn('pyenv not found. Cannot auto-fix Python version.');
    log.info('Install pyenv: https://github.com/pyenv/pyenv#installation');
    log.info(`Then run: pyenv install ${required} && pyenv local ${required}`);
    return;
  }

  const pyenvBin = path.join(pyenvRoot, 'bin', 'pyenv');
  const spinner = createSpinner(`Installing Python ${required} via pyenv...`);
  spinner.start();

  try {
    await run(`"${pyenvBin}" install --skip-existing ${required}`);
    await run(`"${pyenvBin}" local ${required}`);
    spinner.succeed(`Python ${required} installed and set as local version`);
  } catch (err: unknown) {
    spinner.fail(`Failed to install Python ${required} via pyenv`);
    const e = err as Error;
    log.error(e.message);
    log.info(`Try manually: pyenv install ${required} && pyenv local ${required}`);
  }
}

/**
 * Check if pyenv is available on this system.
 */
export async function isPyenvAvailable(): Promise<boolean> {
  const pyenvRoot = getPyenvRoot();
  if (!pyenvRoot) return false;

  const pyenvBin = path.join(pyenvRoot, 'bin', 'pyenv');
  const result = await runSafe(`"${pyenvBin}" --version`);
  return !result.error && !!result.stdout.trim();
}
