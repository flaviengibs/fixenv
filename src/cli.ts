import { Command } from 'commander';
import { doctorCommand } from './commands/doctor';
import { upCommand } from './commands/up';
import { syncCommand } from './commands/sync';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('fixenv')
  .version('0.1.0')
  .description('Fix and standardize your local dev environment');

program
  .command('doctor')
  .description('Diagnose your local development environment')
  .action(async () => {
    await doctorCommand();
  });

program
  .command('up')
  .description('Fix issues and start your development environment')
  .action(async () => {
    await upCommand();
  });

program
  .command('sync')
  .description('Detect environment drift and reinstall only what is needed')
  .action(async () => {
    await syncCommand();
  });

program
  .command('init')
  .description('Generate a fixenv.yaml config file from your current environment')
  .action(async () => {
    await initCommand();
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  const e = err as Error;
  console.error(e.message);
  process.exit(1);
});
