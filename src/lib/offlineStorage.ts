import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define database schema
interface ProdSyncDB extends DBSchema {
  trips: {
    key: string;
    value: {
      id: string;
      vehicleId: string;
      vehicleName: string;
      driverId: string;
      driverName: string;
      startTimestamp: string;
      startLocation: { latitude: number; longitude: number; timestamp: string };
      endTimestamp?: string;
      endLocation?: { latitude: number; longitude: number; timestamp: string };
      odometerStart?: number;
      odometerEnd?: number;
      gpsTrackingPoints: Array<{ latitude: number; longitude: number; timestamp: string }>;
      distanceKm?: number;
      status: 'active' | 'completed';
      syncedToServer: boolean;
    };
    indexes: { 'by-status': string; 'by-vehicle': string };
  };
  fuelEntries: {
    key: string;
    value: {
      id: string;
      tripId?: string;
      vehicleId: string;
      cost: number;
      volume: number;
      pumpPhoto: string;
      efficiency?: number;
      flaggedAsFraud: boolean;
      fraudReason?: string;
      createdAt: string;
      createdBy: string;
      syncedToServer: boolean;
      immutable: boolean;
    };
    indexes: { 'by-vehicle': string; 'by-sync': number };
  };
  cameraReports: {
    key: string;
    value: {
      id: string;
      projectName: string;
      sceneNumber: string;
      shotNumber: string;
      takeNumber: string;
      lens: string;
      filter: string;
      fps: string;
      shutterAngle: string;
      reelId: string;
      notes?: string;
      createdAt: string;
      createdBy: string;
      syncedToServer: boolean;
    };
    indexes: { 'by-project': string; 'by-sync': number };
  };
  handovers: {
    key: string;
    value: {
      id: string;
      orderId: string;
      items: Array<{
        id: string;
        name: string;
        status: 'pending' | 'received' | 'issue';
        issueDescription?: string;
      }>;
      casePhoto?: string;
      status: 'in_progress' | 'completed' | 'cancelled';
      startedAt: string;
      completedAt?: string;
      syncedToServer: boolean;
    };
    indexes: { 'by-status': string; 'by-sync': number };
  };
  photos: {
    key: string;
    value: {
      id: string;
      type: 'pump' | 'case' | 'equipment' | 'damage';
      referenceId: string;
      dataUrl: string;
      timestamp: string;
      syncedToServer: boolean;
    };
    indexes: { 'by-reference': string; 'by-sync': number };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      type: 'trip' | 'fuel' | 'report' | 'handover' | 'photo';
      action: 'create' | 'update' | 'delete';
      payload: unknown;
      timestamp: string;
      retryCount: number;
      lastError?: string;
    };
    indexes: { 'by-type': string; 'by-timestamp': string };
  };
}

const DB_NAME = 'prodsync-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<ProdSyncDB> | null = null;

// Initialize database
export async function initDB(): Promise<IDBPDatabase<ProdSyncDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ProdSyncDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Trips store
      if (!db.objectStoreNames.contains('trips')) {
        const tripsStore = db.createObjectStore('trips', { keyPath: 'id' });
        tripsStore.createIndex('by-status', 'status');
        tripsStore.createIndex('by-vehicle', 'vehicleId');
      }

      // Fuel entries store
      if (!db.objectStoreNames.contains('fuelEntries')) {
        const fuelStore = db.createObjectStore('fuelEntries', { keyPath: 'id' });
        fuelStore.createIndex('by-vehicle', 'vehicleId');
        fuelStore.createIndex('by-sync', 'syncedToServer');
      }

      // Camera reports store
      if (!db.objectStoreNames.contains('cameraReports')) {
        const reportsStore = db.createObjectStore('cameraReports', { keyPath: 'id' });
        reportsStore.createIndex('by-project', 'projectName');
        reportsStore.createIndex('by-sync', 'syncedToServer');
      }

      // Handovers store
      if (!db.objectStoreNames.contains('handovers')) {
        const handoversStore = db.createObjectStore('handovers', { keyPath: 'id' });
        handoversStore.createIndex('by-status', 'status');
        handoversStore.createIndex('by-sync', 'syncedToServer');
      }

      // Photos store
      if (!db.objectStoreNames.contains('photos')) {
        const photosStore = db.createObjectStore('photos', { keyPath: 'id' });
        photosStore.createIndex('by-reference', 'referenceId');
        photosStore.createIndex('by-sync', 'syncedToServer');
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncStore.createIndex('by-type', 'type');
        syncStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });

  return dbInstance;
}

// Trip operations
export async function saveTrip(trip: ProdSyncDB['trips']['value']): Promise<void> {
  const db = await initDB();
  await db.put('trips', trip);
}

export async function getTrip(id: string): Promise<ProdSyncDB['trips']['value'] | undefined> {
  const db = await initDB();
  return db.get('trips', id);
}

export async function getAllTrips(): Promise<ProdSyncDB['trips']['value'][]> {
  const db = await initDB();
  return db.getAll('trips');
}

export async function getUnsyncedTrips(): Promise<ProdSyncDB['trips']['value'][]> {
  const db = await initDB();
  const trips = await db.getAll('trips');
  return trips.filter(t => !t.syncedToServer);
}

// Fuel entry operations
export async function saveFuelEntry(entry: ProdSyncDB['fuelEntries']['value']): Promise<void> {
  const db = await initDB();
  await db.put('fuelEntries', entry);
}

export async function getAllFuelEntries(): Promise<ProdSyncDB['fuelEntries']['value'][]> {
  const db = await initDB();
  return db.getAll('fuelEntries');
}

// Camera report operations
export async function saveCameraReport(report: ProdSyncDB['cameraReports']['value']): Promise<void> {
  const db = await initDB();
  await db.put('cameraReports', report);
}

export async function getAllCameraReports(): Promise<ProdSyncDB['cameraReports']['value'][]> {
  const db = await initDB();
  return db.getAll('cameraReports');
}

// Handover operations
export async function saveHandover(handover: ProdSyncDB['handovers']['value']): Promise<void> {
  const db = await initDB();
  await db.put('handovers', handover);
}

export async function getAllHandovers(): Promise<ProdSyncDB['handovers']['value'][]> {
  const db = await initDB();
  return db.getAll('handovers');
}

// Photo operations
export async function savePhoto(photo: ProdSyncDB['photos']['value']): Promise<void> {
  const db = await initDB();
  await db.put('photos', photo);
}

export async function getPhotosByReference(referenceId: string): Promise<ProdSyncDB['photos']['value'][]> {
  const db = await initDB();
  return db.getAllFromIndex('photos', 'by-reference', referenceId);
}

// Sync queue operations
export async function addToSyncQueue(item: Omit<ProdSyncDB['syncQueue']['value'], 'retryCount'>): Promise<void> {
  const db = await initDB();
  await db.put('syncQueue', { ...item, retryCount: 0 });
}

export async function getSyncQueue(): Promise<ProdSyncDB['syncQueue']['value'][]> {
  const db = await initDB();
  return db.getAll('syncQueue');
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('syncQueue', id);
}

export async function updateSyncQueueItem(
  id: string,
  updates: Partial<ProdSyncDB['syncQueue']['value']>
): Promise<void> {
  const db = await initDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    await db.put('syncQueue', { ...item, ...updates });
  }
}

// Sync status helpers
export async function getPendingSyncCount(): Promise<number> {
  const db = await initDB();
  const queue = await db.getAll('syncQueue');
  return queue.length;
}

export async function markAsSynced(
  store: 'trips' | 'fuelEntries' | 'cameraReports' | 'handovers' | 'photos',
  id: string
): Promise<void> {
  const db = await initDB();
  const item = await db.get(store, id);
  if (item) {
    await db.put(store, { ...item, syncedToServer: true });
  }
}

// Clear all data (for testing/logout)
export async function clearAllData(): Promise<void> {
  const db = await initDB();
  await db.clear('trips');
  await db.clear('fuelEntries');
  await db.clear('cameraReports');
  await db.clear('handovers');
  await db.clear('photos');
  await db.clear('syncQueue');
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Network status listener
export function onNetworkChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
