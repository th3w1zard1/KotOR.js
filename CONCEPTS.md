# Concepts

Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core HMR/dev vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## HMR dev workflow

### Three-tier HMR
The branch-only hot-reload model: (1) in-place accept for React UI shell and probe only, (2) engine edits trigger **instance checkpoint** + full reload + boot restore, (3) manual **Ctrl+R** dev refresh uses the same checkpoint path as tier 2. **Not F5** — F5 is retail quickload.

### Instance checkpoint (dev)
Dev-only capture of the **entire logical running instance** at a point in time: Odyssey-format engine state artifacts, dev virtual filesystem overlays, and UI mode (in-module vs main menu). Stored in IndexedDB with a small localStorage header. This is **not** a retail save, not quicksave, and not exposed through the save/load GUI. Only **code** changes on HMR reload; the checkpoint rehydrates everything else the engine can serialize.

**Honest v1 boundary:** browser reload cannot freeze JS heap, DevTools scopes, WebGL GPU state, or static singleton identities. v1 restores save-export-grade logical state plus dev FS — not a literal process snapshot.

### Dev session resume (legacy fallback)
Degraded position-only fallback (module + player transform in localStorage) used when full instance checkpoint capture fails. Being retired once checkpoint restore is proven in manual and e2e parity.

### Dev refresh
Reloading browser **code** (HMR abort, Ctrl+R) while restoring from the latest instance checkpoint. Distinct from F4/F5 and from retail SaveGame persistence.

### Quicksave / Quickload (F4 / F5)
Retail SaveGame persistence to/from the QUICKSAVE slot via the game's save system. In dev, browser F5 is blocked so F5 remains quickload in-game.

### Quick-play (dev)
A dev bootstrap shortcut that loads a module without walking the full main-menu flow — used by HMR e2e, the test bridge, and legacy position-only resume.

### Dev game filesystem
The localhost HTTP middleware that serves files from a real KOTOR install during HMR dev when `KOTOR_DEV_GAME_DIR` is set, replacing File System Access API reads for that workflow.

## Relationships

**Instance checkpoint** is the primary dev refresh mechanism for tier 2 and tier 3 HMR. Dev session resume is a degraded fallback only. Quicksave/quickload are independent retail SaveGame operations. Dev game filesystem is orthogonal but required for real-asset HMR dev on Linux/local installs.
