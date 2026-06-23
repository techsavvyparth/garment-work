import { openDB } from 'idb';

const DB_NAME = 'ladies-work-offline';
const DB_VERSION = 1;

let dbInstance = null;

const getDB = async () => {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('pendingSync')) {
        const store = db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type');
        store.createIndex('status', 'status');
      }
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    },
  });
  return dbInstance;
};

export const offlineDB = {
  // Queue an action for sync when back online
  queueAction: async (type, method, endpoint, data) => {
    const db = await getDB();
    return db.add('pendingSync', {
      type, method, endpoint, data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  },

  // Get all pending actions
  getPendingActions: async () => {
    const db = await getDB();
    return db.getAllFromIndex('pendingSync', 'status', 'pending');
  },

  // Mark action as synced
  markSynced: async (id) => {
    const db = await getDB();
    const item = await db.get('pendingSync', id);
    if (item) {
      item.status = 'synced';
      item.syncedAt = new Date().toISOString();
      await db.put('pendingSync', item);
    }
  },

  // Cache data locally
  setCache: async (key, data, ttl = 3600000) => {
    const db = await getDB();
    await db.put('cache', { key, data, expiresAt: Date.now() + ttl });
  },

  // Get cached data
  getCache: async (key) => {
    const db = await getDB();
    const item = await db.get('cache', key);
    if (!item || Date.now() > item.expiresAt) return null;
    return item.data;
  },

  // Clear all pending
  clearSynced: async () => {
    const db = await getDB();
    const synced = await db.getAllFromIndex('pendingSync', 'status', 'synced');
    const tx = db.transaction('pendingSync', 'readwrite');
    await Promise.all(synced.map(item => tx.store.delete(item.id)));
    await tx.done;
  },
};

export const syncPendingActions = async (apiClient) => {
  const pending = await offlineDB.getPendingActions();
  if (!pending.length) return 0;

  let synced = 0;
  for (const action of pending) {
    try {
      await apiClient({ method: action.method, url: action.endpoint, data: action.data });
      await offlineDB.markSynced(action.id);
      synced++;
    } catch (err) {
      console.error('Sync failed for action:', action.id, err.message);
    }
  }
  return synced;
};
