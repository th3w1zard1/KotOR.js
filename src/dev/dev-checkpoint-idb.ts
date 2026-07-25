import type {
  DevCheckpointRecord,
  DevFsManifestEntry,
} from '@/dev/DevSessionCheckpoint';

export const DEV_CHECKPOINT_DB_NAME = 'kotor-dev-checkpoint';
export const DEV_CHECKPOINT_DB_VERSION = 1;
export const CHECKPOINT_STORE = 'checkpoint';
export const DEV_FS_STORE = 'devFs';
export const LATEST_CHECKPOINT_KEY = 'latest';

export interface DevCheckpointIdbBackend {
  putLatest(record: DevCheckpointRecord): Promise<void>;
  getLatest(): Promise<DevCheckpointRecord | null>;
  clear(): Promise<void>;
}

let testBackend: DevCheckpointIdbBackend | null = null;

/** Inject an in-memory backend for unit tests. */
export function setDevCheckpointIdbBackendForTests(
  backend: DevCheckpointIdbBackend | null,
): void {
  testBackend = backend;
}

function openBrowserDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DEV_CHECKPOINT_DB_NAME, DEV_CHECKPOINT_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CHECKPOINT_STORE)) {
        db.createObjectStore(CHECKPOINT_STORE);
      }
      if (!db.objectStoreNames.contains(DEV_FS_STORE)) {
        db.createObjectStore(DEV_FS_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'));
  });
}

function createBrowserBackend(): DevCheckpointIdbBackend {
  return {
    async putLatest(record) {
      const db = await openBrowserDb();
      const tx = db.transaction([CHECKPOINT_STORE, DEV_FS_STORE], 'readwrite');
      tx.objectStore(CHECKPOINT_STORE).put(record, LATEST_CHECKPOINT_KEY);
      tx.objectStore(DEV_FS_STORE).clear();
      for (const entry of record.devFsManifest) {
        tx.objectStore(DEV_FS_STORE).put(entry.bytes, entry.path);
      }
      await txDone(tx);
      db.close();
    },
    async getLatest() {
      const db = await openBrowserDb();
      const tx = db.transaction([CHECKPOINT_STORE], 'readonly');
      const checkpoint = await new Promise<DevCheckpointRecord | undefined>((resolve, reject) => {
        const req = tx.objectStore(CHECKPOINT_STORE).get(LATEST_CHECKPOINT_KEY);
        req.onsuccess = () => resolve(req.result as DevCheckpointRecord | undefined);
        req.onerror = () => reject(req.error);
      });
      await txDone(tx);
      db.close();
      return checkpoint ?? null;
    },
    async clear() {
      const db = await openBrowserDb();
      const tx = db.transaction([CHECKPOINT_STORE, DEV_FS_STORE], 'readwrite');
      tx.objectStore(CHECKPOINT_STORE).delete(LATEST_CHECKPOINT_KEY);
      tx.objectStore(DEV_FS_STORE).clear();
      await txDone(tx);
      db.close();
    },
  };
}

async function backend(): Promise<DevCheckpointIdbBackend> {
  if (testBackend) return testBackend;
  return createBrowserBackend();
}

export async function putLatestCheckpoint(record: DevCheckpointRecord): Promise<void> {
  await (await backend()).putLatest(record);
}

export async function getLatestCheckpoint(): Promise<DevCheckpointRecord | null> {
  return (await backend()).getLatest();
}

export async function clearDevCheckpoint(): Promise<void> {
  await (await backend()).clear();
}

export function isDevCheckpointDisabledByUrl(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('devresume') === '0' || params.get('devcheckpoint') === '0';
  } catch {
    return false;
  }
}
