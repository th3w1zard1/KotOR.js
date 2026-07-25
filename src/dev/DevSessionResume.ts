import * as KotOR from '@/apps/game/KotOR';
import {
  getPlayerCreature,
  skipIntroMovies,
  startQuickPlayToModule,
} from '@/dev/HmrTestBridge';

declare global {
  interface Window {
    __KOTOR_DEV_RESUME_INSTALLED__?: boolean;
    __KOTOR_DEV_RESUME_STATE__?: 'idle' | 'resuming' | 'resumed' | 'failed' | 'disabled';
    __KOTOR_HMR_RELOAD_PENDING__?: boolean;
    __KOTOR_DEV_RESUME_CAPTURE_WARNED__?: boolean;
  }
}

const STORAGE_KEY = 'kotor.devResumeSnapshot';
const SNAPSHOT_VERSION = 1;
const MAX_RESUME_ATTEMPTS = 3;
const BOOTSTRAP_WAIT_MS = 180000;

interface DevResumeSnapshot {
  v: number;
  ts: number;
  module: string;
  position: { x: number; y: number; z: number };
  facing: number;
  attempts: number;
}

function isInModuleSession(): boolean {
  const gs = KotOR.GameState;
  const mode = gs.Mode;
  const inModuleMode = mode === KotOR.EngineMode.INGAME
    || mode === KotOR.EngineMode.DIALOG
    || mode === KotOR.EngineMode.FREELOOK;
  return !!gs.Ready
    && !gs.loadingModule
    && inModuleMode
    && !!gs.module?.filename
    && !!gs.module?.readyToProcessEvents;
}

function readSnapshot(): DevResumeSnapshot | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DevResumeSnapshot;
    if (
      parsed?.v !== SNAPSHOT_VERSION
      || !parsed.module
      || !parsed.position
      || typeof parsed.attempts !== 'number'
      || !Number.isFinite(parsed.attempts)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSnapshot(snapshot: DevResumeSnapshot): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function clearDevResumeSnapshot(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Drop stale position-only fallback when not in an in-module session (e.g. main menu). */
export function discardDevResumeSnapshotUnlessInModule(): void {
  if (!isInModuleSession()) {
    clearDevResumeSnapshot();
  }
}

/**
 * Synchronously writes a tiny position-only fallback to localStorage when full
 * instance checkpoint capture fails (HMR abort degraded path). Not a retail save.
 */
export function captureDevResumeSnapshot(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  if (window.__KOTOR_DEV_RESUME_STATE__ === 'resuming') return false;
  if (!isInModuleSession()) return false;
  const player = getPlayerCreature();
  if (!player?.position) return false;
  const existing = readSnapshot();
  const ok = writeSnapshot({
    v: SNAPSHOT_VERSION,
    ts: Date.now(),
    module: KotOR.GameState.module.filename,
    position: {
      x: player.position.x,
      y: player.position.y,
      z: player.position.z,
    },
    facing: typeof player.rotation?.z === 'number' ? player.rotation.z : 0,
    attempts: existing?.attempts ?? 0,
  });
  if (!ok && !window.__KOTOR_DEV_RESUME_CAPTURE_WARNED__) {
    window.__KOTOR_DEV_RESUME_CAPTURE_WARNED__ = true;
    console.warn('[DevResume] Snapshot capture failed — localStorage unavailable; reload will not resume');
  }
  return ok;
}

function playerTransformMatches(snapshot: DevResumeSnapshot): boolean {
  const player = getPlayerCreature();
  if (!player?.position) return false;
  const eps = 0.01;
  return Math.abs(player.position.x - snapshot.position.x) <= eps
    && Math.abs(player.position.y - snapshot.position.y) <= eps
    && Math.abs(player.position.z - snapshot.position.z) <= eps;
}

function isResumeDisabledByUrl(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('devresume') === '0';
  } catch {
    return false;
  }
}

function waitForQuickPlayReady(timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const tick = () => {
      const heads = KotOR.GameState.TwoDAManager?.datatables?.get('heads');
      const tablesReady = !!heads && (heads.RowCount ?? 0) > 0;
      const menuManager = KotOR.GameState.MenuManager;
      const menusReady = !!menuManager?.LoadScreen && !!menuManager?.MenuToolTip;
      const engineReady = !!KotOR.GameState.Ready;
      if (tablesReady && engineReady && menusReady) {
        resolve();
        return;
      }
      if (performance.now() - started > timeoutMs) {
        reject(new Error(`Dev resume: game bootstrap not ready after ${timeoutMs}ms`));
        return;
      }
      setTimeout(tick, 500);
    };
    tick();
  });
}

function applySnapshotTransform(snapshot: DevResumeSnapshot): void {
  const player = getPlayerCreature();
  if (!player?.position) return;
  player.position.set
    ? player.position.set(snapshot.position.x, snapshot.position.y, snapshot.position.z)
    : Object.assign(player.position, snapshot.position);
  if (player.container?.position) {
    player.container.position.set(snapshot.position.x, snapshot.position.y, snapshot.position.z);
  }
  if (typeof player.setFacing === 'function') {
    player.setFacing(snapshot.facing, true);
  }
}

/**
 * Boot-time position-only fallback when dev instance checkpoint restore fails.
 * Superseded by tryRestoreDevCheckpoint(); retained for degraded HMR path.
 */
export async function tryResumeDevSession(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') return false;
  if (window.__KOTOR_DEV_RESUME_STATE__ === 'resuming') return false;

  if (isResumeDisabledByUrl()) {
    window.__KOTOR_DEV_RESUME_STATE__ = 'disabled';
    return false;
  }

  const snapshot = readSnapshot();
  if (!snapshot) {
    window.__KOTOR_DEV_RESUME_STATE__ = 'idle';
    return false;
  }

  if (snapshot.attempts >= MAX_RESUME_ATTEMPTS) {
    console.warn(`[DevResume] Giving up after ${snapshot.attempts} failed attempts — clearing snapshot`);
    clearDevResumeSnapshot();
    window.__KOTOR_DEV_RESUME_STATE__ = 'failed';
    return false;
  }

  window.__KOTOR_DEV_RESUME_STATE__ = 'resuming';

  // Persist the attempt before doing anything risky so a crash loop self-heals.
  if (!writeSnapshot({ ...snapshot, attempts: snapshot.attempts + 1 })) {
    console.error('[DevResume] Cannot persist attempt counter — localStorage unavailable');
    window.__KOTOR_DEV_RESUME_STATE__ = 'failed';
    return false;
  }

  console.log(`[DevResume] Resuming session: ${snapshot.module} @ (${snapshot.position.x.toFixed(2)}, ${snapshot.position.y.toFixed(2)}, ${snapshot.position.z.toFixed(2)})`);

  const moviePump = window.setInterval(() => {
    try {
      skipIntroMovies();
    } catch {
      // Engine not far enough along yet — keep pumping.
    }
  }, 1000);

  try {
    await waitForQuickPlayReady(BOOTSTRAP_WAIT_MS);
    await startQuickPlayToModule(snapshot.module);
    applySnapshotTransform(snapshot);
    if (!playerTransformMatches(snapshot)) {
      throw new Error('Dev resume: player transform not applied after quick-play');
    }
    if (!writeSnapshot({ ...snapshot, ts: Date.now(), attempts: 0 })) {
      throw new Error('Dev resume: cannot persist success snapshot');
    }
    window.__KOTOR_DEV_RESUME_STATE__ = 'resumed';
    console.log(`[DevResume] Session resumed into ${snapshot.module}`);
    return true;
  } catch (e) {
    console.error('[DevResume] Resume failed — next boot will retry once, then fall back to main menu', e);
    window.__KOTOR_DEV_RESUME_STATE__ = 'failed';
    return false;
  } finally {
    window.clearInterval(moviePump);
  }
}

/**
 * Legacy position-only capture for beforeunload fallback. Rolling capture is
 * owned by DevSessionCheckpoint; this module only handles degraded resume.
 */
export function installDevSessionResume(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (window.__KOTOR_DEV_RESUME_INSTALLED__) return;
  window.__KOTOR_DEV_RESUME_INSTALLED__ = true;

  window.addEventListener('beforeunload', () => {
    discardDevResumeSnapshotUnlessInModule();
    captureDevResumeSnapshot();
  });
}
