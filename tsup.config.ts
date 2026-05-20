import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['bin/fixenv.ts'],
  format: ['cjs'],
  outDir: 'dist',
  clean: true,
  shims: true,
});
