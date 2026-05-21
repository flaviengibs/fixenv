# fixenv

> Fix and standardize your local dev environment

`fixenv` is a CLI tool that detects, diagnoses, and repairs common local development environment issues — mismatched Node versions, missing Python, Docker not running, stale dependencies, and more.

## Installation

```bash
npm install -g @flaviengibs/fixenv
# or run without installing
npx @flaviengibs/fixenv
```

Requires Node.js ≥ 18.

## Usage

`fixenv` is meant to be run from the root of a project you want to diagnose or fix — not from its own directory.

```bash
cd my-project/    # the project you want to repair
fixenv doctor     # inspect that project's environment
fixenv up         # fix and start it
```

Detectors look for files like `.nvmrc`, `package.json`, `requirements.txt`, and `docker-compose.yml` in the current working directory.

## Commands

### `fixenv doctor`

Diagnose your current environment. Checks Node.js, Python, Docker, and package managers (npm, pnpm, yarn).

```
$ fixenv doctor

  System Diagnosis

  ✓  node          v20.11.0   matches .nvmrc
  ✗  python        missing    not found in PATH
  ✓  docker        v24.0.5    daemon running
  ⚠  npm           v9.8.1     ok
  ✓  pnpm          v8.15.0    ok

  Issues Found:

  python  →  Install Python 3: https://www.python.org/downloads/
```

When issues are found, each one is listed with a suggested fix. Run `fixenv up` to attempt automatic remediation.

### `fixenv up`

Fix detected issues and start your environment end-to-end.

```bash
fixenv up
```

What it does:

- Runs all detectors in parallel
- Auto-fixes Node.js version mismatches via **nvm** (if available)
- Auto-fixes Python version mismatches via **pyenv** (if available)
- Installs Node and Python dependencies
- Starts Docker Compose services if a `docker-compose.yml` is present

If a version manager isn't installed, `fixenv up` prints the manual steps needed instead of failing silently.

### `fixenv sync`

Check for environment drift and reinstall only what's needed.

```bash
fixenv sync
```

- Runs all detectors and reports any drift (version mismatches, missing tools)
- Reinstalls Node modules if `package.json` is newer than `node_modules`
- Reinstalls Python deps if `requirements.txt` or `pyproject.toml` is present

### `fixenv init`

Generate a `fixenv.yaml` config file based on your current environment.

```bash
fixenv init
```

Detects your current Node and Python versions, Docker Compose services, and the right install command for your package manager (npm / yarn / pnpm). Writes the result to `fixenv.yaml` in the current directory.

## Configuration (`fixenv.yaml`)

All fields are optional. `fixenv` works without a config file, but having one lets you pin versions and customize install commands.

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

| Field | Description |
|---|---|
| `runtime.node` | Required Node.js version. Matched against `.nvmrc` if present. |
| `runtime.python` | Required Python version. |
| `services` | Docker Compose services to start with `fixenv up`. Defaults to all services. |
| `install.node` | Command used to install Node dependencies. |
| `install.python` | Command used to install Python dependencies. |

## Auto-fix support

| Tool | Version fix | How |
|---|---|---|
| Node.js | ✓ | `nvm install` + `nvm use` |
| Python | ✓ | `pyenv install` + `pyenv local` |
| Docker | — | Prints manual instructions |
| Package managers | — | Prints manual instructions |

## Development

```bash
npm install
npm run dev -- doctor   # run a command locally via tsx
npm run build           # compile to dist/
npm run typecheck       # type-check without emitting
```

## License

MIT
