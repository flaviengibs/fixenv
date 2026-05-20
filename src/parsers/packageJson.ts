import * as fs from 'fs';
import * as path from 'path';

export interface PackageJsonData {
  engines?: {
    node?: string;
    npm?: string;
  };
  scripts?: Record<string, string>;
  packageManager?: string;
}

export function parsePackageJson(): PackageJsonData | null {
  const pkgPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(pkgPath, 'utf-8');
    const parsed = JSON.parse(raw) as PackageJsonData;
    return parsed;
  } catch {
    return null;
  }
}
