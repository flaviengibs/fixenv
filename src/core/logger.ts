import chalk from 'chalk';

export interface TableRow {
  label: string;
  value: string;
  status?: 'ok' | 'warn' | 'error';
}

const statusIcon = {
  ok: chalk.green('✓'),
  warn: chalk.yellow('⚠'),
  error: chalk.red('✗'),
  missing: chalk.red('✗'),
};

export const log = {
  success(msg: string): void {
    console.log(`${chalk.green('✓')}  ${msg}`);
  },

  error(msg: string): void {
    console.log(`${chalk.red('✗')}  ${msg}`);
  },

  warn(msg: string): void {
    console.log(`${chalk.yellow('⚠')}  ${msg}`);
  },

  info(msg: string): void {
    console.log(`${chalk.blue('ℹ')}  ${msg}`);
  },

  dim(msg: string): void {
    console.log(chalk.gray(msg));
  },

  section(title: string): void {
    console.log('');
    console.log(`  ${chalk.bold(title)}`);
    console.log('');
  },

  table(rows: TableRow[]): void {
    // Calculate column widths
    const labelWidth = Math.max(...rows.map((r) => r.label.length), 8);
    const valueWidth = Math.max(...rows.map((r) => r.value.length), 10);

    for (const row of rows) {
      const icon = row.status ? statusIcon[row.status] : ' ';
      const label = row.label.padEnd(labelWidth);
      const value = row.value.padEnd(valueWidth);

      let coloredLabel: string;
      let coloredValue: string;

      switch (row.status) {
        case 'ok':
          coloredLabel = chalk.green(label);
          coloredValue = chalk.green(value);
          break;
        case 'warn':
          coloredLabel = chalk.yellow(label);
          coloredValue = chalk.yellow(value);
          break;
        case 'error':
          coloredLabel = chalk.red(label);
          coloredValue = chalk.red(value);
          break;
        default:
          coloredLabel = label;
          coloredValue = value;
      }

      console.log(`  ${icon}  ${coloredLabel}  ${coloredValue}`);
    }
  },
};

export { statusIcon };
