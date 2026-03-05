# AGENTS.md

## Cursor Cloud specific instructions

### Overview

KotOR.js is a TypeScript reimplementation of the Odyssey Game Engine (Star Wars: KotOR I & II). It has four web/Electron frontends: Launcher, Game Client, KotOR Forge (modding suite), and Debugger. All are bundled via Webpack 5 with esbuild-loader.

### Quick reference

Standard commands are documented in `DEVELOPER_QUICK_REFERENCE.md` and `README.md`. Key scripts:

- `npm run webpack:dev` — one-shot dev build of all 5 webpack bundles
- `npm run webpack:dev-watch` — watch mode (rebuilds on file changes)
- `npm start` — compiles Electron TypeScript then launches Electron
- `npx jest --verbose --no-cache` — run existing tests (see caveat below)
- `npx prettier --check "src/**/*.ts"` — check formatting

### Known issues in the dev environment

- **ESLint config is broken**: `.eslintrc.yml` has a YAML indentation error on the `varsIgnorePattern` line (line 27). ESLint 9 is installed but only supports the old config via `ESLINT_USE_FLAT_CONFIG=false`, which then hits this YAML parse error. Do not rely on `npm run lint` working until this config is fixed.
- **`npm test` path mismatch**: The `test` script in `package.json` passes `./src/tests` to Jest, but that directory does not exist. The sole test file is `src/apps/forge/helpers/ReferenceFinder.test.ts` (matched by `jest.config.js`'s `testMatch: ['**/*.test.ts']`). Run `npx jest --verbose --no-cache` without the path argument to pick it up. The test file itself is intentionally empty (exports `{}`).
- **`lint` / `format:check` scripts missing**: The README references `npm run lint` and `npm run format:check`, but these scripts are not defined in `package.json`. Use `npx eslint ...` or `npx prettier --check ...` directly.
- **Electron renders black on headless VMs**: The Launcher window (`transparent: true`, `frame: false`) shows a black rectangle because GPU/compositing is unavailable. Use the **web mode** instead: run `python3 -m http.server 8080` from `dist/` and open `http://localhost:8080/launcher/` in Chrome.
- **Game files required for full testing**: The Game Client and Forge require proprietary KotOR game data files to progress past their loading screens. The Launcher is fully interactive without game files.

### Running the web app in the Cloud VM

1. Build: `npm run webpack:dev`
2. Serve: `cd dist && python3 -m http.server 8080 &`
3. Open in Chrome: `http://localhost:8080/launcher/`

The Launcher, Community, and Need KotOR pages are fully interactive without game files.
