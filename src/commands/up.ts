import chalk from 'chalk';
import { runAllDetectors } from '../detectors';
import type { DetectorResult } from '../detectors';
import { fixNodeVersion } from '../fixers/node';
import { fixPythonVersion } from '../fixers/python';
import { installDeps } from '../fixers/deps';
import { loadConfig } from '../core/config';
import { log } from '../core/logger';
import { createSpinner } from '../core/spinner';
import { parseDockerCompose } from '../parsers/dockerCompose';
import { run } from '../core/shell';

async function applyFixes(results: DetectorResult[]): Promise<void> {
  for (const result of results) {
    if (result.status === 'ok') continue;

    switch (result.name) {
      case 'node':
        if (result.required && (result.status === 'warn' || result.status === 'error')) {
          await fixNodeVersion(result.required);
        } else if (result.status === 'error') {
          log.error('Node.js is not installed. Please install it from https://nodejs.org');
        }
        break;

      case 'python':
        if (result.required && result.status === 'warn') {
          await fixPythonVersion(result.required);
        } else if (result.status === 'error') {
          log.error('Python is not installed. Please install it from https://www.python.org/downloads/');
        }
        break;

      case 'docker':
        if (result.status === 'error') {
          log.warn('Docker issue detected:');
          if (result.fix) log.info(result.fix);
        }
        break;

      default:
        // Package managers — just log
        if (result.status === 'missing' && result.fix) {
          log.dim(`  ${result.name}: ${result.fix}`);
        }
        break;
    }
  }
}

async function startDockerCompose(services?: string[]): Promise<void> {
  const serviceArgs = services && services.length > 0 ? ` ${services.join(' ')}` : '';
  const cmd = `docker compose up -d${serviceArgs}`;

  const spinner = createSpinner('Starting Docker Compose services...');
  spinner.start();

  try {
    await run(cmd);
    spinner.succeed('Docker Compose services started');
  } catch (err: unknown) {
    spinner.fail('Failed to start Docker Compose services');
    const e = err as Error;
    log.error(e.message);
  }
}

export async function upCommand(): Promise<void> {
  log.section('Starting Environment');

  // Load optional config
  const config = loadConfig();
  if (config) {
    log.dim('  Loaded fixenv.yaml');
  }

  // Run detectors
  const spinner = createSpinner('Detecting environment...');
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

  const issues = results.filter(
    (r) => r.status !== 'ok'
  );

  if (issues.length === 0) {
    log.success('Environment looks good — no fixes needed');
  } else {
    console.log('');
    console.log(`  ${chalk.bold('Fixing issues...')}`);
    console.log('');
    await applyFixes(results);
  }

  // Install dependencies
  console.log('');
  console.log(`  ${chalk.bold('Installing dependencies...')}`);
  console.log('');

  const hasPython = results.find((r) => r.name === 'python' && r.status === 'ok');
  await installDeps({
    node: true,
    python: !!hasPython,
  });

  // Start Docker Compose if present
  const composeInfo = parseDockerCompose();
  if (composeInfo?.exists) {
    console.log('');
    const configServices = config?.services;
    await startDockerCompose(configServices);
  }

  // Summary
  console.log('');
  log.section('Summary');

  const fixed = issues.filter((r) => r.fix);
  const unfixed = issues.filter((r) => !r.fix);

  if (fixed.length > 0) {
    log.success(`Attempted fixes for: ${fixed.map((r) => r.name).join(', ')}`);
  }
  if (unfixed.length > 0) {
    log.warn(`Manual action needed for: ${unfixed.map((r) => r.name).join(', ')}`);
  }
  if (issues.length === 0) {
    log.success('Environment is ready!');
  }

  console.log('');
}
