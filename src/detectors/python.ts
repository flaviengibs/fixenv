import * as fs from 'fs';
import * as path from 'path';
import { runSafe } from '../core/shell';
import type { DetectorResult } from './types';

function normalizeVersion(v: string): string {
  return v.replace(/^[Pp]ython\s*/, '').trim();
}

function majorMinorMatches(a: string, b: string): boolean {
  const aParts = a.split('.').slice(0, 2).join('.');
  const bParts = b.split('.').slice(0, 2).join('.');
  return aParts === bParts;
}

function getRequiredPythonVersion(): { version: string; source: string } | null {
  // Check .python-version (pyenv)
  const pyenvFile = path.join(process.cwd(), '.python-version');
  if (fs.existsSync(pyenvFile)) {
    try {
      const content = fs.readFileSync(pyenvFile, 'utf-8').trim();
      if (content) return { version: content, source: '.python-version' };
    } catch {
      // ignore
    }
  }

  // Check pyproject.toml for requires-python
  const pyprojectFile = path.join(process.cwd(), 'pyproject.toml');
  if (fs.existsSync(pyprojectFile)) {
    try {
      const content = fs.readFileSync(pyprojectFile, 'utf-8');
      const match = content.match(/requires-python\s*=\s*["']([^"']+)["']/);
      if (match) {
        const version = match[1].replace(/[^0-9.]/g, '').trim();
        return { version, source: 'pyproject.toml' };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export async function detectPython(): Promise<DetectorResult> {
  // Try python3 first, then python
  let result = await runSafe('python3 --version');
  let cmd = 'python3';

  if (result.error || (!result.stdout.trim() && !result.stderr.trim())) {
    result = await runSafe('python --version');
    cmd = 'python';
  }

  const rawOutput = (result.stdout.trim() || result.stderr.trim());

  if (result.error || !rawOutput) {
    return {
      name: 'python',
      status: 'error',
      message: 'not found in PATH',
      fix: 'Install Python 3: https://www.python.org/downloads/',
    };
  }

  const version = normalizeVersion(rawOutput);
  const required = getRequiredPythonVersion();

  if (!required) {
    return {
      name: 'python',
      status: 'ok',
      version,
      message: `installed via ${cmd}`,
    };
  }

  if (majorMinorMatches(version, required.version)) {
    return {
      name: 'python',
      status: 'ok',
      version,
      required: required.version,
      message: `matches ${required.source}`,
    };
  }

  return {
    name: 'python',
    status: 'warn',
    version,
    required: required.version,
    message: `version mismatch (${required.source} requires ${required.version})`,
    fix: `Run: pyenv install ${required.version} && pyenv local ${required.version}`,
  };
}
