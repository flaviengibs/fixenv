import ora, { Ora } from 'ora';

export interface Spinner {
  start(): void;
  succeed(text?: string): void;
  fail(text?: string): void;
  warn(text?: string): void;
  update(text: string): void;
  stop(): void;
}

export function createSpinner(text: string): Spinner {
  let instance: Ora | null = null;

  return {
    start(): void {
      instance = ora({ text, color: 'cyan' }).start();
    },

    succeed(msg?: string): void {
      if (instance) {
        instance.succeed(msg ?? text);
        instance = null;
      }
    },

    fail(msg?: string): void {
      if (instance) {
        instance.fail(msg ?? text);
        instance = null;
      }
    },

    warn(msg?: string): void {
      if (instance) {
        instance.warn(msg ?? text);
        instance = null;
      }
    },

    update(msg: string): void {
      if (instance) {
        instance.text = msg;
      }
    },

    stop(): void {
      if (instance) {
        instance.stop();
        instance = null;
      }
    },
  };
}
