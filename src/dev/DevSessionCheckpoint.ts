import * as KotOR from '@/apps/game/KotOR';
import { SaveGame } from '@/engine/SaveGame';
import {
  clearDevCheckpoint,
  getLatestCheckpoint,
  isDevCheckpointDisabledByUrl,
  putLatestCheckpoint,
} from '@/dev/dev-checkpoint-idb';
import {
  restoreVirtualFilesFromCheckpoint,
  snapshotVirtualFilesForCheckpoint,
} from '@/dev/DevGameFileBackend';
import { skipIntroMovies } from '@/dev/HmrTestBridge';

export const CHECKPOINT_SCHEMA_VERSION = 1;

export type DevUiMode = 'menu' | 'in_module';

export type CaptureReason = 'rolling' | 'hmr_abort' | 'beforeunload';

export interface DevFsManifestEntry {
  path: string;
  bytes: Uint8Array;
}

/**
 * Full logical instance at a point in time — NOT a retail save slot.
 * `instanceStateArtifacts` uses Odyssey serialization internally; dev FS holds
 * virtual gameinprogress overlays.
 */
export interface DevCheckpointRecord {
  schemaVersion: number;
  capturedAt: number;
  uiMode: DevUiMode;
  captureReason: CaptureReason;
  /** Odyssey-format engine state blobs (SAVEGAME.sav, savenfo.res, …). */
  instanceStateArtifacts: Record<string, Uint8Array>;
  devFsManifest: DevFsManifestEntry[];
}

const CHECKPOINT_HEADER_KEY = 'kotor.devCheckpointHeader';
const CHECKPOINT_ROLLING_INTERVAL_MS = 2000;
const MAX_RESTORE_ATTEMPTS = 3;
const BOOTSTRAP_WAIT_MS = 180000;

interface DevCheckpointHeader {
  schemaVersion: number;
  capturedAt: number;
  uiMode: DevUiMode;
  captureReason: CaptureReason;
  attempts: number;
}

let captureInFlight: Promise<boolean> | null = null;

declare global {
  interface Window {
    __KOTOR_DEV_CHECKPOINT_INSTALLED__?: boolean;
    __KOTOR_DEV_CHECKPOINT_STATE__?: 'idle' | 'restoring' | 'restored' | 'failed' | 'disabled';
  }
}

export function parseDevCheckpointRecord(raw: unknown): DevCheckpointRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as DevCheckpointRecord & { saveFiles?: Record<string, Uint8Array> };
  if (record.schemaVersion !== CHECKPOINT_SCHEMA_VERSION) {
    console.warn(
      `[DevCheckpoint] Ignoring checkpoint with schema v${record.schemaVersion} (expected ${CHECKPOINT_SCHEMA_VERSION})`,
    );
    return null;
  }
  if (record.uiMode !== 'menu' && record.uiMode !== 'in_module') return null;
  const artifacts = record.instanceStateArtifacts ?? record.saveFiles;
  if (!artifacts || typeof artifacts !== 'object') return null;
  if (!Array.isArray(record.devFsManifest)) return null;
  return {
    schemaVersion: record.schemaVersion,
    capturedAt: record.capturedAt,
    uiMode: record.uiMode,
    captureReason: record.captureReason,
    instanceStateArtifacts: artifacts,
    devFsManifest: record.devFsManifest,
  };
}

function readCheckpointHeader(): DevCheckpointHeader | null {
  try {
    const raw = window.localStorage.getItem(CHECKPOINT_HEADER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DevCheckpointHeader;
    if (parsed?.schemaVersion !== CHECKPOINT_SCHEMA_VERSION) return null;
    if (parsed.uiMode !== 'menu' && parsed.uiMode !== 'in_module') return null;
    if (typeof parsed.attempts !== 'number' || !Number.isFinite(parsed.attempts)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCheckpointHeader(header: DevCheckpointHeader): boolean {
  try {
    window.localStorage.setItem(CHECKPOINT_HEADER_KEY, JSON.stringify(header));
    return true;
  } catch {
    return false;
  }
}

export function clearDevCheckpointHeader(): void {
  try {
    window.localStorage.removeItem(CHECKPOINT_HEADER_KEY);
  } catch {
    // ignore
  }
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

export function deriveDevUiMode(): DevUiMode {
  return isInModuleSession() ? 'in_module' : 'menu';
}

export function isDevCheckpointDisabled(): boolean {
  if (process.env.NODE_ENV === 'production') return true;
  return isDevCheckpointDisabledByUrl();
}

/** Drop stale checkpoint header when off-module (e.g. main menu before reload). */
export function discardDevCheckpointUnlessInModule(): void {
  if (!isInModuleSession()) {
    clearDevCheckpointHeader();
  }
}

/**
 * Captures rolling dev instance checkpoint to IndexedDB. Skips when disabled,
 * off-module menu sessions (empty artifacts), or while a prior capture runs.
 */
export async function captureDevCheckpoint(reason: CaptureReason): Promise<boolean> {
  if (isDevCheckpointDisabled()) return false;
  if (captureInFlight) return captureInFlight;

  captureInFlight = (async () => {
    try {
      const uiMode = deriveDevUiMode();
      let instanceStateArtifacts: Record<string, Uint8Array> = {};

      if (uiMode === 'in_module') {
        const exported = await SaveGame.exportInstanceStateArtifacts();
        if (!exported || Object.keys(exported).length === 0) {
          return false;
        }
        instanceStateArtifacts = exported;
      }

      const record: DevCheckpointRecord = {
        schemaVersion: CHECKPOINT_SCHEMA_VERSION,
        capturedAt: Date.now(),
        uiMode,
        captureReason: reason,
        instanceStateArtifacts,
        devFsManifest: snapshotVirtualFilesForCheckpoint(),
      };
      await putLatestCheckpoint(record);

      const existingHeader = readCheckpointHeader();
      writeCheckpointHeader({
        schemaVersion: CHECKPOINT_SCHEMA_VERSION,
        capturedAt: record.capturedAt,
        uiMode: record.uiMode,
        captureReason: reason,
        attempts: existingHeader?.attempts ?? 0,
      });
      return true;
    } catch (e) {
      console.error('[DevCheckpoint] Capture failed', e);
      return false;
    } finally {
      captureInFlight = null;
    }
  })();

  return captureInFlight;
}

export async function readLatestDevCheckpoint(): Promise<DevCheckpointRecord | null> {
  if (isDevCheckpointDisabled()) return null;
  const raw = await getLatestCheckpoint();
  if (!raw) return null;
  return parseDevCheckpointRecord(raw);
}

export async function clearLatestDevCheckpoint(): Promise<void> {
  await clearDevCheckpoint();
  clearDevCheckpointHeader();
}

function waitForBootstrapReady(timeoutMs: number): Promise<void> {
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
        reject(new Error(`Dev checkpoint: bootstrap not ready after ${timeoutMs}ms`));
        return;
      }
      setTimeout(tick, 500);
    };
    tick();
  });
}

/**
 * Boot-time restore: hydrate dev virtual FS + in-module engine state from the
 * latest instance checkpoint. Only code changes on HMR reload — not retail saves.
 */
export async function tryRestoreDevCheckpoint(): Promise<boolean> {
  if (isDevCheckpointDisabled()) {
    window.__KOTOR_DEV_CHECKPOINT_STATE__ = 'disabled';
    return false;
  }
  if (window.__KOTOR_DEV_CHECKPOINT_STATE__ === 'restoring') return false;

  const header = readCheckpointHeader();
  if (!header) {
    window.__KOTOR_DEV_CHECKPOINT_STATE__ = 'idle';
    return false;
  }

  if (header.attempts >= MAX_RESTORE_ATTEMPTS) {
    console.warn(`[DevCheckpoint] Giving up after ${header.attempts} failed attempts — clearing checkpoint`);
    await clearLatestDevCheckpoint();
    window.__KOTOR_DEV_CHECKPOINT_STATE__ = 'failed';
    return false;
  }

  const checkpoint = await readLatestDevCheckpoint();
  if (!checkpoint) {
    window.__KOTOR_DEV_CHECKPOINT_STATE__ = 'idle';
    return false;
  }

  window.__KOTOR_DEV_CHECKPOINT_STATE__ = 'restoring';
  if (!writeCheckpointHeader({ ...header, attempts: header.attempts + 1 })) {
    console.error('[DevCheckpoint] Cannot persist attempt counter — localStorage unavailable');
    window.__KOTOR_DEV_CHECKPOINT_STATE__ = 'failed';
    return false;
  }

  restoreVirtualFilesFromCheckpoint(checkpoint.devFsManifest);

  if (checkpoint.uiMode === 'menu') {
    writeCheckpointHeader({ ...header, capturedAt: Date.now(), attempts: 0 });
    window.__KOTOR_DEV_CHECKPOINT_STATE__ = 'restored';
    console.log('[DevCheckpoint] Restored menu session (dev virtual FS only)');
    return true;
  }

  const artifactKeys = Object.keys(checkpoint.instanceStateArtifacts);
  if (artifactKeys.length === 0) {
    window.__KOTOR_DEV_CHECKPOINT_STATE__ = 'failed';
    return false;
  }

  const moviePump = window.setInterval(() => {
    try {
      skipIntroMovies();
    } catch {
      // Engine not far enough along yet.
    }
  }, 1000);

  try {
    await waitForBootstrapReady(BOOTSTRAP_WAIT_MS);
    const loaded = await SaveGame.loadFromInstanceStateArtifacts(checkpoint.instanceStateArtifacts);
    if (!loaded) {
      throw new Error('Dev checkpoint: loadFromInstanceStateArtifacts returned false');
    }
    writeCheckpointHeader({ ...header, capturedAt: Date.now(), attempts: 0 });
    window.__KOTOR_DEV_CHECKPOINT_STATE__ = 'restored';
    console.log('[DevCheckpoint] Restored in-module instance from checkpoint');
    return true;
  } catch (e) {
    console.error('[DevCheckpoint] Restore failed — next boot will retry, then fall back', e);
    window.__KOTOR_DEV_CHECKPOINT_STATE__ = 'failed';
    return false;
  } finally {
    window.clearInterval(moviePump);
  }
}

/** Rolling capture loop — idempotent across HMR re-executions. */
export function installDevSessionCheckpoint(): void {
  if (process.env.NODE_ENV === 'production') return;
  if (window.__KOTOR_DEV_CHECKPOINT_INSTALLED__) return;
  window.__KOTOR_DEV_CHECKPOINT_INSTALLED__ = true;

  window.addEventListener('beforeunload', () => {
    discardDevCheckpointUnlessInModule();
    void captureDevCheckpoint('beforeunload');
  });

  window.setInterval(() => {
    void captureDevCheckpoint('rolling');
  }, CHECKPOINT_ROLLING_INTERVAL_MS);
}

export function resetDevSessionCheckpointCaptureForTests(): void {
  captureInFlight = null;
  if (typeof window !== 'undefined') {
    clearDevCheckpointHeader();
    window.__KOTOR_DEV_CHECKPOINT_STATE__ = undefined;
  }
}
