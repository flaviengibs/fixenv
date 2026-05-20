# envy

> Fix and standardize your local dev environment

`envy` is a CLI tool that detects, diagnoses, and repairs common local development environment issues — mismatched Node versions, missing Python, Docker not running, and more.

## Installation

```bash
npm install -g envy
# or
npx envy
```

## Commands

### `envy doctor`

Diagnose your current environment. Checks Node.js, Python, Docker, and package managers.

```
$ envy doctor

  System Diagnosis

  ✓  node          v20.11.0   matches .nvmrc
  ✗  python        missing    not found in PATH
  ✓  docker        v24.0.5    daemon running
  ⚠  npm           v9.8.1     ok
  ✓  pnpm          v8.15.0    ok

  Issues Found:

  python  →  Install Python 3: https://www.python.org/downloads/
```

### `envy up`

Automatically fix detected issues and start your environment.

```bash
envy up
```

- Runs all detectors
- Auto-fixes version mismatches (via nvm, pyenv)
- Installs dependencies
- Starts Docker Compose services if `docker-compose.yml` is present

### `envy sync`

Check for environment drift and reinstall only what's needed.

```bash
envy sync
```

### `envy init`

Generate an `envy.yaml` config file based on your current environment.

```bash
envy init
```

## Configuration (`envy.yaml`)

```yaml
runtime:
  node: "20.11.0"
  python: "3.11.0"

services:
  - web
  - db

install:
  node: "pnpm install"
  python: "pip install -r requirements.txt"
```

## Development

```bash
npm install
npm run dev -- doctor
npm run build
```
