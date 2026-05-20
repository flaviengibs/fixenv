import * as fs from 'fs';
import * as path from 'path';

/**
 * Read .nvmrc or .node-version from cwd.
 * Returns the version string (e.g. "20.11.0" or "lts/iron") or null.
 */
export function parseNvmrc(): string | null {
  const candidates = ['.nvmrc', '.node-version'];

  for (const file of candidates) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8').trim();
        return content || null;
      } catch {
        return null;
      }
    }
  }

  return null;
}
