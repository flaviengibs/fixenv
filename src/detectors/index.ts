export type { DetectorResult } from './types';
export { detectNode } from './node';
export { detectPython } from './python';
export { detectDocker } from './docker';
export { detectPackageManagers } from './packageManagers';

import { detectNode } from './node';
import { detectPython } from './python';
import { detectDocker } from './docker';
import { detectPackageManagers } from './packageManagers';
import type { DetectorResult } from './types';

/**
 * Run all detectors in parallel and return a flat list of results.
 */
export async function runAllDetectors(): Promise<DetectorResult[]> {
  const [node, python, docker, pkgManagers] = await Promise.all([
    detectNode(),
    detectPython(),
    detectDocker(),
    detectPackageManagers(),
  ]);

  return [node, python, docker, ...pkgManagers];
}
