import {
  captureDevCheckpoint,
  deriveDevUiMode,
  parseDevCheckpointRecord,
  resetDevSessionCheckpointCaptureForTests,
  CHECKPOINT_SCHEMA_VERSION,
} from '@/dev/DevSessionCheckpoint';
import {
  setDevCheckpointIdbBackendForTests,
  getLatestCheckpoint,
} from '@/dev/dev-checkpoint-idb';

const exportMock = jest.fn<Promise<Record<string, Uint8Array> | null>, []>();

jest.mock('@/apps/game/KotOR', () => ({
  GameState: {
    Ready: false,
    loadingModule: false,
    Mode: 0,
    module: undefined as any,
  },
  EngineMode: { GUI: 0, INGAME: 1, DIALOG: 3, FREELOOK: 5 },
}));

jest.mock('@/engine/SaveGame', () => ({
  SaveGame: {
    exportInstanceStateArtifacts: () => exportMock(),
    loadFromInstanceStateArtifacts: jest.fn(),
  },
}));

jest.mock('@/dev/HmrTestBridge', () => ({
  skipIntroMovies: jest.fn(),
}));

jest.mock('@/dev/DevGameFileBackend', () => ({
  snapshotVirtualFilesForCheckpoint: () => [],
  restoreVirtualFilesFromCheckpoint: jest.fn(),
}));

import * as KotOR from '@/apps/game/KotOR';

const gameState = (KotOR as any).GameState;

function memoryBackend() {
  let latest: any = null;
  return {
    putLatest: async (r: any) => { latest = r; },
    getLatest: async () => latest,
    clear: async () => { latest = null; },
  };
}

function createLocalStorageStub() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => store.clear(),
  };
}

beforeEach(() => {
  (globalThis as any).window = {
    location: { search: '' },
    localStorage: createLocalStorageStub(),
  };
  jest.clearAllMocks();
  resetDevSessionCheckpointCaptureForTests();
  setDevCheckpointIdbBackendForTests(memoryBackend());
  gameState.Ready = false;
  gameState.loadingModule = false;
  gameState.Mode = 0;
  gameState.module = undefined;
  exportMock.mockResolvedValue({ 'SAVEGAME.sav': new Uint8Array([1]) });
});

afterEach(() => {
  setDevCheckpointIdbBackendForTests(null);
  delete (globalThis as any).window;
});

describe('parseDevCheckpointRecord', () => {
  it('rejects schema version mismatch', () => {
    expect(parseDevCheckpointRecord({
      schemaVersion: 99,
      uiMode: 'menu',
      instanceStateArtifacts: {},
      devFsManifest: [],
    })).toBeNull();
  });
});

describe('deriveDevUiMode', () => {
  it('returns menu when not in module', () => {
    expect(deriveDevUiMode()).toBe('menu');
  });

  it('returns in_module for active session', () => {
    gameState.Ready = true;
    gameState.Mode = KotOR.EngineMode.INGAME;
    gameState.module = { filename: 'end_m01aa', readyToProcessEvents: true };
    expect(deriveDevUiMode()).toBe('in_module');
  });
});

describe('captureDevCheckpoint', () => {
  it('writes checkpoint with instance state artifacts when in-module', async () => {
    gameState.Ready = true;
    gameState.Mode = KotOR.EngineMode.INGAME;
    gameState.module = { filename: 'end_m01aa', readyToProcessEvents: true };

    expect(await captureDevCheckpoint('rolling')).toBe(true);
    const stored = await getLatestCheckpoint();
    expect(stored?.uiMode).toBe('in_module');
    expect(stored?.schemaVersion).toBe(CHECKPOINT_SCHEMA_VERSION);
    expect(stored?.instanceStateArtifacts['SAVEGAME.sav']).toBeDefined();
  });

  it('captures menu uiMode without calling export', async () => {
    expect(await captureDevCheckpoint('beforeunload')).toBe(true);
    expect(exportMock).not.toHaveBeenCalled();
    const stored = await getLatestCheckpoint();
    expect(stored?.uiMode).toBe('menu');
    expect(Object.keys(stored!.instanceStateArtifacts)).toHaveLength(0);
  });

  it('skips IDB write when export fails in-module', async () => {
    gameState.Ready = true;
    gameState.Mode = KotOR.EngineMode.INGAME;
    gameState.module = { filename: 'end_m01aa', readyToProcessEvents: true };
    exportMock.mockResolvedValue(null);

    expect(await captureDevCheckpoint('hmr_abort')).toBe(false);
    expect(await getLatestCheckpoint()).toBeNull();
  });

  it('dedupes concurrent capture', async () => {
    gameState.Ready = true;
    gameState.Mode = KotOR.EngineMode.INGAME;
    gameState.module = { filename: 'end_m01aa', readyToProcessEvents: true };
    let resolveExport!: (v: Record<string, Uint8Array>) => void;
    exportMock.mockImplementation(() => new Promise(r => { resolveExport = r; }));

    const first = captureDevCheckpoint('rolling');
    const second = captureDevCheckpoint('rolling');
    resolveExport({ 'SAVEGAME.sav': new Uint8Array([2]) });
    expect(await first).toBe(true);
    expect(await second).toBe(true);
    expect(exportMock).toHaveBeenCalledTimes(1);
  });
});
