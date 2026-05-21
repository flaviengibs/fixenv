import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface fixenvConfig {
  runtime?: {
    node?: string | number;
    python?: string | number;
  };
  services?: string[];
  install?: {
    node?: string;
    python?: string;
  };
}

export function loadConfig(): fixenvConfig | null {
  const configPath = path.join(process.cwd(), 'fixenv.yaml');

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = yaml.load(raw) as fixenvConfig;
    return parsed ?? null;
  } catch {
    return null;
  }
}

export function writeConfig(config: fixenvConfig): void {
  const configPath = path.join(process.cwd(), 'fixenv.yaml');
  const content = yaml.dump(config, { lineWidth: 80, noRefs: true });
  fs.writeFileSync(configPath, content, 'utf-8');
}
