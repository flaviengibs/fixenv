import chalk from 'chalk';
import { runAllDetectors } from '../detectors';
import type { DetectorResult } from '../detectors';
import { loadConfig } from '../core/config';
import { log } from '../core/logger';
import { createSpinner } from '../core/spinner';
import { installDeps } from '../fixers/deps';
import * as fs from 'fs';
import * as path from 'path';

function hasDrift(results: DetectorResult[]): boolean {
  return results.some((r) => r.status === 'warn' || r.status === 'error' || r.status === 'missing');
}

function nodeModulesStale(): boolean {
  const cwd = process.cwd();
  const nmPath = path.join(cwd, 'node_modules');
  const pkgPath = path.join(cwd, 'package.json');

  if (!fs.existsSync(nmPath)) return true;
  if (!fs.existsSync(pkgPath)) return false;

  try {
    const nmStat = fs.statSync(nmPath);
    const pkgStat = fs.statSync(pkgPath);
    return pkgStat.mtimeMs > nmStat.mtimeMs;
  } catch {
    return true;
  }
}

function pythonDepsStale(): boolean {
  const cwd = process.cwd();
  const reqPath = path.join(cwd, 'requirements.txt');
  const pyprojectPath = path.join(cwd, 'pyproject.toml');

  // Simple heuristic: if requirements file exists, assume potentially stale
  return fs.existsSync(reqPath) || fs.existsSync(pyprojectPath);
}

export async function syncCommand(): Promise<void> {
  log.section('Syncing Environment');

  const config = loadConfig();
  if (config) {
    log.dim('  Loaded fixenv.yaml');
  }

  // Run detectors
  const spinner = createSpinner('Checking for drift...');
  spinner.start();

  let results: DetectorResult[];
  try {
    results = await runAllDetectors();
    spinner.stop();
  } catch (err: unknown) {
    spinner.fail('Detection failed');
    const e = err as Error;
    log.error(e.message);
    return;
  }

  const drift = hasDrift(results);

  if (!drift) {
    log.success('No environment drift detected');
  } else {
    console.log('');
    console.log(`  ${chalk.bold.yellow('Drift detected:')}`);
    console.log('');

    const drifted = results.filter(
      (r) => r.status === 'warn' || r.status === 'error' || r.status === 'missing'
    );

    for (const r of drifted) {
      const icon = r.status === 'warn' ? chalk.yellow('⚠') : chalk.red('✗');
      console.log(`  ${icon}  ${chalk.bold(r.name)}: ${r.message}`);
      if (r.fix) {
        console.log(`       ${chalk.dim('→')} ${r.fix}`);
      }
    }
  }

  // Check if deps need reinstall
  console.log('');
  const nodeDepsStale = nodeModulesStale();
  const pyDepsStale = pythonDepsStale();

  if (nodeDepsStale || pyDepsStale) {
    console.log(`  ${chalk.bold('Reinstalling stale dependencies...')}`);
    console.log('');

    await installDeps({
      node: nodeDepsStale,
      python: pyDepsStale,
    });
  } else {
    log.success('Dependencies are up to date');
  }

  console.log('');
  log.info(`Run ${chalk.cyan('fixenv up')} to attempt automatic fixes for any issues.`);
  console.log('');
}
