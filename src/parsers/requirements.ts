import * as fs from 'fs';
import * as path from 'path';

export interface RequirementsInfo {
  file: string;
  exists: boolean;
}

/**
 * Check for requirements.txt or pyproject.toml in cwd.
 * Returns info about the first one found, or null if neither exists.
 */
export function parseRequirements(): RequirementsInfo | null {
  const candidates = ['requirements.txt', 'pyproject.toml'];

  for (const file of candidates) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      return { file, exists: true };
    }
  }

  return null;
}
