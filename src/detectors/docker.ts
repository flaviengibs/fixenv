import { runSafe } from '../core/shell';
import { parseDockerCompose } from '../parsers/dockerCompose';
import type { DetectorResult } from './types';

export async function detectDocker(): Promise<DetectorResult> {
  // Check if docker binary is available
  const versionResult = await runSafe('docker --version');

  if (versionResult.error || !versionResult.stdout.trim()) {
    const composeInfo = parseDockerCompose();
    if (composeInfo?.exists) {
      return {
        name: 'docker',
        status: 'error',
        message: 'not installed (docker-compose.yml found)',
        fix: 'Install Docker Desktop: https://www.docker.com/products/docker-desktop/',
      };
    }
    return {
      name: 'docker',
      status: 'missing',
      message: 'not installed',
      fix: 'Install Docker Desktop: https://www.docker.com/products/docker-desktop/',
    };
  }

  // Extract version string
  const versionMatch = versionResult.stdout.match(/Docker version ([^\s,]+)/);
  const version = versionMatch ? versionMatch[1] : versionResult.stdout.trim();

  // Check if daemon is running
  const infoResult = await runSafe('docker info');

  if (infoResult.error) {
    const composeInfo = parseDockerCompose();
    const msg = composeInfo?.exists
      ? 'daemon not running (docker-compose.yml found)'
      : 'daemon not running';

    return {
      name: 'docker',
      status: 'error',
      version,
      message: msg,
      fix: 'Start Docker Desktop or run: sudo systemctl start docker',
    };
  }

  // Check for docker-compose.yml
  const composeInfo = parseDockerCompose();
  const serviceCount = composeInfo?.services?.length ?? 0;
  const serviceNote = composeInfo?.exists
    ? ` (${serviceCount} service${serviceCount !== 1 ? 's' : ''} in compose)`
    : '';

  return {
    name: 'docker',
    status: 'ok',
    version,
    message: `daemon running${serviceNote}`,
  };
}
