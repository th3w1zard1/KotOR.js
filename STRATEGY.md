---
title: KotOR.js — product strategy (bootstrap)
last_updated: 2026-06-12
---

# Strategy

Bootstrap from HMR dev planning session. Revisit with `/ce-strategy` for full interview and pushback.

## Target problem

Developers iterating on KotOR.js engine and module behavior lose minutes per cycle when any refresh sends them through main menu, loading screens, and a partial session restore. HMR dev should feel like pausing the running game, swapping code, and continuing — not like starting a new play session.

## Our approach

**Branch-only HMR dev infrastructure** on top of the Odyssey engine monolith (`GameState` singletons, SaveGame persistence, Three.js scene derived from module data):

1. **True in-place hot swap** only where webpack can safely accept modules (React UI shell, dev probe).
2. **Dev checkpoint / restore** for everything else: serialize **logical game state** (module save artifacts, `gameinprogress`, dev virtual FS) on a rolling cadence and on code-reload triggers; restore on boot with a dev-fast path that skips main menu and loading UI where possible.
3. **Separate game persistence**: F4 quicksave and F5 quickload are **SaveGame** operations (QUICKSAVE slot), not browser refresh. Browser F5 is blocked in dev.

We do **not** attempt Three.js/WebGL scene dumps or in-place engine module hot-swap — documented structural blockers (`#private`, static singletons, `instanceof`).

## Who it's for

- Engine and module contributors on `feat/forge-explorer-progress` / PR #101 using real KOTOR assets (`KOTOR_DEV_GAME_DIR`, port 8130).
- CI and agents verifying HMR dev parity via unit + e2e ladders (synthetic and real-asset).

## Key metrics

| Metric | Where observed |
|--------|----------------|
| Time from engine edit → back in-module with prior state | Manual dev + `scripts/hmr-session.e2e.cjs` |
| Reload-resume fidelity | Module + party/globals/inventory vs position-only |
| False main-menu hijacks after off-module reload | Dev resume/checkpoint tests |
| CI HMR e2e green | `npm run test:hmr-e2e` |

## Tracks

| Track | Status |
|-------|--------|
| HMR dev play + dev FS | Landed (branch) |
| Snapshot-reload-resume (position-only) | Landed; superseded by checkpoint track |
| **Dev checkpoint + F4/F5 semantics** | Active — see `docs/plans/2026-06-12-001-feat-dev-checkpoint-restore-plan.md` |
| Forge explorer progress | Parallel (PR #101) |

## Not working on

- Upstream parity: KobaltBlu master has no HMR stack.
- Production save format changes for retail players.
- Full NWScript mid-tick restore (dialog/combat in flight) in v1 — research spike only.
