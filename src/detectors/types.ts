export interface DetectorResult {
  name: string;
  status: 'ok' | 'warn' | 'error' | 'missing';
  version?: string;
  required?: string;
  message: string;
  fix?: string;
}
