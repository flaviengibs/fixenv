import { runSafe } from '../core/shell';
import { parseNvmrc } from '../parsers/nvmrc';
import { parsePackageJson } from '../parsers/packageJson';
import type { DetectorResult } from './types';

/**
 * Normalize a version string to "major.minor.patch" format.
 * Strips leading "v" and handles partial versions like "20" or "20.11".
 */
function normalizeVersion(v: string): string {
  return v.replace(/^v/, '').trim();
}

/**
 * Compare two version strings. Returns true if they share the same major version.
 */
function majorMatches(a: string, b: string): boolean {
  const aMajor = normalizeVersion(a).split('.')[0];
  const bMajor = normalizeVersion(b).split('.')[0];
  return aMajor === bMajor;
}

export async function detectNode(): Promise<DetectorResult> {
  const result = await runSafe('node --version');

  if (result.error || !result.stdout.trim()) {
    return {
      name: 'node',
      status: 'error',
      message: 'not found in PATH',
      fix: 'Install Node.js from https://nodejs.org',
    };
  }

  const version = normalizeVersion(result.stdout.trim());

  // Determine required version from .nvmrc, .node-version, or package.json engines
  let required: string | undefined;
  let requiredSource = '';

  const nvmrcVersion = parseNvmrc();
  if (nvmrcVersion) {
    required = normalizeVersion(nvmrcVersion);
    requiredSource = '.nvmrc';
  } else {
    const pkg = parsePackageJson();
    if (pkg?.engines?.node) {
      // Strip semver range operators for comparison
      required = pkg.engines.node.replace(/[^0-9.]/g, '').trim();
      requiredSource = 'package.json engines';
    }
  }

  if (!required) {
    return {
      name: 'node',
      status: 'ok',
      version,
      message: 'installed (no version requirement found)',
    };
  }

  if (majorMatches(version, required)) {
    return {
      name: 'node',
      status: 'ok',
      version,
      required,
      message: `matches ${requiredSource}`,
    };
  }

  return {
    name: 'node',
    status: 'warn',
    version,
    required,
    message: `version mismatch (${requiredSource} requires ${required})`,
    fix: 'Run: nvm install && nvm use',
  };
}
