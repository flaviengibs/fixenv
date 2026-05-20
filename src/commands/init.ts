import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { detectNode } from '../detectors/node';
import { detectPython } from '../detectors/python';
import { parseDockerCompose } from '../parsers/dockerCompose';
import { loadConfig, writeConfig } from '../core/config';
import type { EnvyConfig } from '../core/config';
import { log } from '../core/logger';
import { createSpinner } from '../core/spinner';

export async function initCommand(): Promise<void> {
  log.section('Initializing fixenv');

  const configPath = path.join(process.cwd(), 'fixenv.yaml');

  // Check if already exists
  if (fs.existsSync(configPath)) {
    const existing = loadConfig();
    log.warn('fixenv.yaml already exists in this directory.');
    log.dim(`  Path: ${configPath}`);
    console.log('');
    log.info(`Edit it manually or delete it and run ${chalk.cyan('fixenv init')} again.`);
    console.log('');
    return;
  }

  // Detect current environment
  const spinner = createSpinner('Detecting current environment...');
  spinner.start();

  const [nodeResult, pythonResult] = await Promise.all([
    detectNode(),
    detectPython(),
  ]);

  const composeInfo = parseDockerCompose();
  spinner.stop();

  // Build config
  const config: EnvyConfig = {};

  // Runtime versions
  const runtime: EnvyConfig['runtime'] = {};

  if (nodeResult.version) {
    // Use major.minor.patch if available
    runtime.node = nodeResult.version;
  }

  if (pythonResult.version) {
    runtime.python = pythonResult.version;
  }

  if (Object.keys(runtime).length > 0) {
    config.runtime = runtime;
  }

  // Docker Compose services
  if (composeInfo?.exists && composeInfo.services && composeInfo.services.length > 0) {
    config.services = composeInfo.services;
  }

  // Install commands
  const install: EnvyConfig['install'] = {};
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) {
    install.node = 'pnpm install';
  } else if (fs.existsSync(path.join(cwd, 'yarn.lock'))) {
    install.node = 'yarn install';
  } else if (fs.existsSync(path.join(cwd, 'package.json'))) {
    install.node = 'npm install';
  }

  if (fs.existsSync(path.join(cwd, 'requirements.txt'))) {
    install.python = 'pip install -r requirements.txt';
  } else if (fs.existsSync(path.join(cwd, 'pyproject.toml'))) {
    install.python = 'pip install -e .';
  }

  if (Object.keys(install).length > 0) {
    config.install = install;
  }

  // Write config
  try {
    writeConfig(config);
  } catch (err: unknown) {
    const e = err as Error;
    log.error(`Failed to write fixenv.yaml: ${e.message}`);
    return;
  }

  log.success(`Created fixenv.yaml`);
  console.log('');

  // Print what was detected
  if (config.runtime?.node) {
    log.dim(`  node:   ${config.runtime.node}`);
  }
  if (config.runtime?.python) {
    log.dim(`  python: ${config.runtime.python}`);
  }
  if (config.services && config.services.length > 0) {
    log.dim(`  services: ${config.services.join(', ')}`);
  }
  if (config.install?.node) {
    log.dim(`  install (node): ${config.install.node}`);
  }
  if (config.install?.python) {
    log.dim(`  install (python): ${config.install.python}`);
  }

  console.log('');
  log.info(`Edit ${chalk.cyan('fixenv.yaml')} to customize, then run ${chalk.cyan('fixenv up')}.`);
  console.log('');
}
