import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface DockerComposeInfo {
  exists: boolean;
  services?: string[];
}

interface DockerComposeFile {
  services?: Record<string, unknown>;
}

/**
 * Parse docker-compose.yml (or docker-compose.yaml) from cwd.
 * Returns service names if found, or null if no compose file exists.
 */
export function parseDockerCompose(): DockerComposeInfo | null {
  const candidates = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml'];

  for (const file of candidates) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = yaml.load(raw) as DockerComposeFile;
        const services = parsed?.services ? Object.keys(parsed.services) : [];
        return { exists: true, services };
      } catch {
        return { exists: true, services: [] };
      }
    }
  }

  return null;
}
