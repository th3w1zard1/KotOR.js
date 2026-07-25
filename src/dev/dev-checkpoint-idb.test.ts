import type { DevCheckpointRecord } from '@/dev/DevSessionCheckpoint';
import {
  clearDevCheckpoint,
  getLatestCheckpoint,
  isDevCheckpointDisabledByUrl,
  putLatestCheckpoint,
  setDevCheckpointIdbBackendForTests,
} from '@/dev/dev-checkpoint-idb';

jest.mock('@/apps/game/KotOR', () => ({
  GameState: {},
  EngineMode: {},
}), { virtual: false });

jest.mock('@/engine/SaveGame', () => ({
  SaveGame: { exportInstanceStateArtifacts: jest.fn() },
}));

jest.mock('@/dev/DevGameFileBackend', () => ({
  snapshotVirtualFilesForCheckpoint: () => [],
}));

const CHECKPOINT_SCHEMA_VERSION = 1;

function createMemoryBackend() {
  let latest: DevCheckpointRecord | null = null;
  return {
    async putLatest(record: DevCheckpointRecord) {
      latest = structuredCloneRecord(record);
    },
    async getLatest() {
      return latest ? structuredCloneRecord(latest) : null;
    },
    async clear() {
      latest = null;
    },
  };
}

function structuredCloneRecord(record: DevCheckpointRecord): DevCheckpointRecord {
  const instanceStateArtifacts: Record<string, Uint8Array> = {};
  for (const [name, bytes] of Object.entries(record.instanceStateArtifacts)) {
    instanceStateArtifacts[name] = new Uint8Array(bytes);
  }
  return {
    ...record,
    instanceStateArtifacts,
    devFsManifest: record.devFsManifest.map(e => ({
      path: e.path,
      bytes: new Uint8Array(e.bytes),
    })),
  };
}

function sampleRecord(): DevCheckpointRecord {
  return {
    schemaVersion: CHECKPOINT_SCHEMA_VERSION,
    capturedAt: 1_700_000_000_000,
    uiMode: 'in_module',
    captureReason: 'rolling',
    instanceStateArtifacts: {
      'SAVEGAME.sav': new Uint8Array([1, 2, 3, 4]),
    },
    devFsManifest: [{ path: 'gameinprogress/foo.sav', bytes: new Uint8Array([9, 9]) }],
  };
}

beforeEach(() => {
  setDevCheckpointIdbBackendForTests(createMemoryBackend());
  (globalThis as any).window = { location: { search: '' } };
});

afterEach(() => {
  setDevCheckpointIdbBackendForTests(null);
  delete (globalThis as any).window;
});

describe('dev-checkpoint-idb', () => {
  it('round-trips checkpoint bytes via put/get', async () => {
    const record = sampleRecord();
    await putLatestCheckpoint(record);
    const loaded = await getLatestCheckpoint();
    expect(loaded).not.toBeNull();
    expect(loaded!.capturedAt).toBe(record.capturedAt);
    expect([...loaded!.instanceStateArtifacts['SAVEGAME.sav']!]).toEqual([1, 2, 3, 4]);
    expect([...loaded!.devFsManifest[0]!.bytes]).toEqual([9, 9]);
  });

  it('clear removes checkpoint', async () => {
    await putLatestCheckpoint(sampleRecord());
    await clearDevCheckpoint();
    expect(await getLatestCheckpoint()).toBeNull();
  });

  it('isDevCheckpointDisabledByUrl respects devresume=0', () => {
    (window as any).location.search = '?devresume=0';
    expect(isDevCheckpointDisabledByUrl()).toBe(true);
  });

  it('isDevCheckpointDisabledByUrl respects devcheckpoint=0', () => {
    (window as any).location.search = '?devcheckpoint=0';
    expect(isDevCheckpointDisabledByUrl()).toBe(true);
  });
});
