import * as fs from 'fs';
import * as path from 'path';
import { run } from '../core/shell';
import { log } from '../core/logger';
import { createSpinner } from '../core/spinner';

export interface InstallDepsOptions {
  node?: boolean;
  python?: boolean;
}

type NodePackageManager = 'pnpm' | 'yarn' | 'npm';

function detectNodePackageManager(): NodePackageManager {
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

async function installNodeDeps(): Promise<void> {
  const pm = detectNodePackageManager();
  const cmd = `${pm} install`;

  const spinner = createSpinner(`Installing Node.js dependencies with ${pm}...`);
  spinner.start();

  try {
    await run(cmd);
    spinner.succeed(`Node.js dependencies installed (${pm})`);
  } catch (err: unknown) {
    spinner.fail(`Failed to install Node.js dependencies`);
    const e = err as Error;
    log.error(e.message);
  }
}

async function installPythonDeps(): Promise<void> {
  const cwd = process.cwd();

  let cmd: string | null = null;
  let label = '';

  if (fs.existsSync(path.join(cwd, 'requirements.txt'))) {
    cmd = 'pip install -r requirements.txt';
    label = 'requirements.txt';
  } else if (fs.existsSync(path.join(cwd, 'pyproject.toml'))) {
    cmd = 'pip install -e .';
    label = 'pyproject.toml';
  }

  if (!cmd) {
    log.dim('  No Python dependency file found (requirements.txt or pyproject.toml)');
    return;
  }

  const spinner = createSpinner(`Installing Python dependencies from ${label}...`);
  spinner.start();

  try {
    await run(cmd);
    spinner.succeed(`Python dependencies installed from ${label}`);
  } catch (err: unknown) {
    spinner.fail(`Failed to install Python dependencies`);
    const e = err as Error;
    log.error(e.message);
  }
}

/**
 * Install project dependencies for Node.js and/or Python.
 */
export async function installDeps(options: InstallDepsOptions = {}): Promise<void> {
  const { node = true, python = false } = options;

  if (node) {
    const cwd = process.cwd();
    const hasPackageJson = fs.existsSync(path.join(cwd, 'package.json'));
    if (hasPackageJson) {
      await installNodeDeps();
    } else {
      log.dim('  No package.json found, skipping Node.js dependency install');
    }
  }

  if (python) {
    await installPythonDeps();
  }
}
