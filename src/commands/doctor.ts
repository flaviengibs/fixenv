import chalk from 'chalk';
import { runAllDetectors } from '../detectors';
import type { DetectorResult } from '../detectors';
import { log } from '../core/logger';
import { createSpinner } from '../core/spinner';

function statusIcon(status: DetectorResult['status']): string {
  switch (status) {
    case 'ok':      return chalk.green('✓');
    case 'warn':    return chalk.yellow('⚠');
    case 'error':   return chalk.red('✗');
    case 'missing': return chalk.gray('-');
    default:        return ' ';
  }
}

function colorForStatus(status: DetectorResult['status']): (s: string) => string {
  switch (status) {
    case 'ok':      return chalk.green;
    case 'warn':    return chalk.yellow;
    case 'error':   return chalk.red;
    case 'missing': return chalk.gray;
    default:        return (s: string) => s;
  }
}

function printResultsTable(results: DetectorResult[]): void {
  const labelWidth = Math.max(...results.map((r) => r.name.length), 8);
  const versionWidth = 12;

  for (const r of results) {
    const icon = statusIcon(r.status);
    const color = colorForStatus(r.status);
    const label = r.name.padEnd(labelWidth);
    const version = (r.version ?? 'missing').padEnd(versionWidth);
    const message = r.message;

    console.log(`  ${icon}  ${color(label)}  ${color(version)}  ${chalk.dim(message)}`);
  }
}

export async function doctorCommand(): Promise<void> {
  log.section('System Diagnosis');

  const spinner = createSpinner('Running diagnostics...');
  spinner.start();

  let results: DetectorResult[];
  try {
    results = await runAllDetectors();
    spinner.stop();
  } catch (err: unknown) {
    spinner.fail('Diagnostics failed');
    const e = err as Error;
    log.error(e.message);
    return;
  }

  printResultsTable(results);

  // Collect issues
  const issues = results.filter(
    (r) => r.status === 'error' || r.status === 'warn' || r.status === 'missing'
  );

  if (issues.length === 0) {
    console.log('');
    log.success('All checks passed — your environment looks great!');
    console.log('');
    return;
  }

  console.log('');
  console.log(`  ${chalk.bold.yellow('Issues Found:')}`);
  console.log('');

  for (const issue of issues) {
    if (issue.fix) {
      const label = chalk.red(issue.name.padEnd(10));
      const arrow = chalk.dim('→');
      console.log(`  ${label}  ${arrow}  ${issue.fix}`);
    }
  }

  console.log('');
  log.info(`Run ${chalk.cyan('fixenv up')} to attempt automatic fixes.`);
  console.log('');
}
