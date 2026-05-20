import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ShellResult {
  stdout: string;
  stderr: string;
}

export interface ShellResultSafe extends ShellResult {
  error?: Error;
}

/**
 * Run a shell command. Throws on non-zero exit.
 */
export async function run(cmd: string): Promise<ShellResult> {
  return execAsync(cmd);
}

/**
 * Run a shell command. Never throws — returns error in result object.
 */
export async function runSafe(cmd: string): Promise<ShellResultSafe> {
  try {
    const result = await execAsync(cmd);
    return result;
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & { stdout?: string; stderr?: string };
    return {
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? '',
      error: e,
    };
  }
}
