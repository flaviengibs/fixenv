import { runSafe } from '../core/shell';
import type { DetectorResult } from './types';

interface ToolSpec {
  name: string;
  cmd: string;
  versionRegex: RegExp;
}

const TOOLS: ToolSpec[] = [
  { name: 'npm',  cmd: 'npm --version',  versionRegex: /^(\d+\.\d+\.\d+)/ },
  { name: 'pnpm', cmd: 'pnpm --version', versionRegex: /^(\d+\.\d+\.\d+)/ },
  { name: 'yarn', cmd: 'yarn --version', versionRegex: /^(\d+\.\d+\.\d+)/ },
  { name: 'pip',  cmd: 'pip --version',  versionRegex: /pip (\d+\.\d+\.\d+)/ },
  { name: 'pip3', cmd: 'pip3 --version', versionRegex: /pip (\d+\.\d+\.\d+)/ },
];

async function detectTool(spec: ToolSpec): Promise<DetectorResult> {
  const result = await runSafe(spec.cmd);

  if (result.error || !result.stdout.trim()) {
    return {
      name: spec.name,
      status: 'missing',
      message: 'not found in PATH',
    };
  }

  const match = result.stdout.trim().match(spec.versionRegex);
  const version = match ? match[1] : result.stdout.trim().split('\n')[0];

  return {
    name: spec.name,
    status: 'ok',
    version,
    message: 'ok',
  };
}

export async function detectPackageManagers(): Promise<DetectorResult[]> {
  const results = await Promise.all(TOOLS.map(detectTool));
  return results;
}
