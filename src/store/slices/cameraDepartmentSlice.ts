import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Asset Handover Types
export type HandoverItemStatus = 'pending' | 'received' | 'issue';

export interface HandoverItem {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  status: HandoverItemStatus;
  issueDescription?: string;
}

export interface AssetHandover {
  id: string;
  rentalOrderId: string;
  items: HandoverItem[];
  casePhoto?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  syncedToServer: boolean;
  createdAt: string;
}

// RFQ Types
export type RFQStatus = 'pending' | 'quoted' | 'accepted' | 'rejected';

export interface RFQItem {
  id: string;
  equipmentId: string;
  equipmentName: string;
  category: string;
  quantity: number;
  dailyRate?: number;
}

export interface RFQ {
  id: string;
  customerId: string;
  customerName: string;
  items: RFQItem[];
  rentalStartDate: string;
  rentalEndDate: string;
  status: RFQStatus;
  totalCost?: number;
  vendorNotes?: string;
  createdAt: string;
  quotedAt?: string;
  syncedToServer: boolean;
}

// Digital Camera Report Types
export interface CameraReport {
  id: string;
  projectId: string;
  scene: string;
  shot: string;
  take: string;
  lens: string;
  filter: string;
  fps: number;
  shutterAngle: number;
  reelId: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
  syncedToServer: boolean;
}

// Expendables Types
export interface Expendable {
  id: string;
  name: string;
  category: string;
  currentCount: number;
  minimumThreshold: number;
  unit: string;
  lastUpdated: string;
  updatedBy: string;
}

// Scenes Master Types
export interface SceneMaster {
  id: string;
  projectName: string;
  sceneNumber: string;
  shotNumber: string;
  takeNumber: string;
  description?: string;
  createdAt: string;
}

export interface CameraDepartmentState {
  // Asset Handover
  handovers: AssetHandover[];
  activeHandover: AssetHandover | null;
  
  // RFQ System
  rfqs: RFQ[];
  rfqCart: RFQItem[];
  
  // Camera Reports
  cameraReports: CameraReport[];
  
  // Scenes Master
  scenesMaster: SceneMaster[];
  
  // Expendables
  expendables: Expendable[];
  lowStockAlerts: string[];
  
  // UI State
  isLoading: boolean;
  offlineQueue: Array<{
    type: 'handover' | 'rfq' | 'cameraReport' | 'expendable';
    action: 'create' | 'update';
    payload: unknown;
    timestamp: string;
  }>;
}

// Seed Equipment Database for RFQ
export const seedEquipmentDatabase = [
  // Camera Bodies
  { id: 'cam-1', name: 'ARRI Alexa Mini LF', category: 'Camera Bodies', dailyRate: 15000 },
  { id: 'cam-2', name: 'RED V-Raptor 8K', category: 'Camera Bodies', dailyRate: 12000 },
  { id: 'cam-3', name: 'Sony Venice 2', category: 'Camera Bodies', dailyRate: 14000 },
  { id: 'cam-4', name: 'Blackmagic URSA Mini Pro 12K', category: 'Camera Bodies', dailyRate: 8000 },
  { id: 'cam-5', name: 'Canon EOS C500 Mark II', category: 'Camera Bodies', dailyRate: 6000 },
  
  // Lenses
  { id: 'lens-1', name: 'Cooke S7/i Full Frame Plus 25mm', category: 'Lenses', dailyRate: 3500 },
  { id: 'lens-2', name: 'Cooke S7/i Full Frame Plus 50mm', category: 'Lenses', dailyRate: 3500 },
  { id: 'lens-3', name: 'ARRI Signature Prime 35mm', category: 'Lenses', dailyRate: 4000 },
  { id: 'lens-4', name: 'Zeiss Supreme Prime 85mm', category: 'Lenses', dailyRate: 3000 },
  { id: 'lens-5', name: 'Angenieux EZ-1 30-90mm', category: 'Lenses', dailyRate: 5000 },
  { id: 'lens-6', name: 'Canon CN-E 70-200mm T4.4', category: 'Lenses', dailyRate: 2500 },
  
  // Lights
  { id: 'light-1', name: 'ARRI SkyPanel S360-C', category: 'Lights', dailyRate: 8000 },
  { id: 'light-2', name: 'Aputure 600d Pro', category: 'Lights', dailyRate: 3000 },
  { id: 'light-3', name: 'Litepanels Gemini 2x1 Soft', category: 'Lights', dailyRate: 2500 },
  { id: 'light-4', name: 'ARRI M18 HMI', category: 'Lights', dailyRate: 4500 },
  { id: 'light-5', name: 'Kino Flo Celeb 450Q', category: 'Lights', dailyRate: 2000 },
];

// Seed Expendables
const initialExpendables: Expendable[] = [
  { id: 'exp-1', name: 'Gaffer Tape (Black)', category: 'Tape', currentCount: 24, minimumThreshold: 10, unit: 'rolls', lastUpdated: new Date().toISOString(), updatedBy: 'system' },
  { id: 'exp-2', name: 'Gaffer Tape (White)', category: 'Tape', currentCount: 12, minimumThreshold: 6, unit: 'rolls', lastUpdated: new Date().toISOString(), updatedBy: 'system' },
  { id: 'exp-3', name: 'Camera Tape', category: 'Tape', currentCount: 8, minimumThreshold: 5, unit: 'rolls', lastUpdated: new Date().toISOString(), updatedBy: 'system' },
  { id: 'exp-4', name: 'AA Batteries', category: 'Batteries', currentCount: 48, minimumThreshold: 24, unit: 'pcs', lastUpdated: new Date().toISOString(), updatedBy: 'system' },
  { id: 'exp-5', name: 'AAA Batteries', category: 'Batteries', currentCount: 36, minimumThreshold: 18, unit: 'pcs', lastUpdated: new Date().toISOString(), updatedBy: 'system' },
  { id: 'exp-6', name: 'Lens Cleaning Tissue', category: 'Cleaning', currentCount: 5, minimumThreshold: 3, unit: 'boxes', lastUpdated: new Date().toISOString(), updatedBy: 'system' },
  { id: 'exp-7', name: 'Compressed Air Cans', category: 'Cleaning', currentCount: 6, minimumThreshold: 4, unit: 'cans', lastUpdated: new Date().toISOString(), updatedBy: 'system' },
  { id: 'exp-8', name: 'Black Wrap (Cinefoil)', category: 'Grip', currentCount: 4, minimumThreshold: 2, unit: 'rolls', lastUpdated: new Date().toISOString(), updatedBy: 'system' },
  { id: 'exp-9', name: 'Diffusion Gel', category: 'Grip', currentCount: 10, minimumThreshold: 5, unit: 'sheets', lastUpdated: new Date().toISOString(), updatedBy: 'system' },
  { id: 'exp-10', name: 'ND Gel Filters', category: 'Filters', currentCount: 3, minimumThreshold: 2, unit: 'sheets', lastUpdated: new Date().toISOString(), updatedBy: 'system' },
];

// Sample Rental Orders for Handover
export const sampleRentalOrders = [
  {
    id: 'RO-2024-001',
    items: [
      { id: 'item-1', name: 'ARRI Alexa Mini LF', category: 'Camera', serialNumber: 'K1.0024875' },
      { id: 'item-2', name: 'Cooke S7/i 25mm', category: 'Lens', serialNumber: 'CS7-2501' },
      { id: 'item-3', name: 'Cooke S7/i 50mm', category: 'Lens', serialNumber: 'CS7-5002' },
      { id: 'item-4', name: 'ARRI WCU-4 Wireless Follow Focus', category: 'Accessory', serialNumber: 'WCU4-8823' },
    ],
  },
  {
    id: 'RO-2024-002',
    items: [
      { id: 'item-5', name: 'RED V-Raptor 8K', category: 'Camera', serialNumber: 'RVR-99281' },
      { id: 'item-6', name: 'ARRI Signature Prime 35mm', category: 'Lens', serialNumber: 'ASP-3501' },
      { id: 'item-7', name: 'Tilta Nucleus-M', category: 'Accessory', serialNumber: 'TNM-4421' },
    ],
  },
];

const initialState: CameraDepartmentState = {
  handovers: [],
  activeHandover: null,
  rfqs: [
    {
      id: 'RFQ-2024-001',
      customerId: 'cust-1',
      customerName: 'Sunrise Productions',
      items: [
        { id: 'rfq-item-1', equipmentId: 'cam-1', equipmentName: 'ARRI Alexa Mini LF', category: 'Camera Bodies', quantity: 1 },
        { id: 'rfq-item-2', equipmentId: 'lens-1', equipmentName: 'Cooke S7/i Full Frame Plus 25mm', category: 'Lenses', quantity: 2 },
      ],
      rentalStartDate: '2024-02-15',
      rentalEndDate: '2024-02-25',
      status: 'pending',
      createdAt: new Date().toISOString(),
      syncedToServer: true,
    },
  ],
  rfqCart: [],
  cameraReports: [],
  scenesMaster: [],
  expendables: initialExpendables,
  lowStockAlerts: initialExpendables
    .filter(e => e.currentCount < e.minimumThreshold)
    .map(e => e.id),
  isLoading: false,
  offlineQueue: [],
};

const cameraDepartmentSlice = createSlice({
  name: 'cameraDepartment',
  initialState,
  reducers: {
    // Asset Handover Actions
    startHandover: (state, action: PayloadAction<{ rentalOrderId: string; items: Omit<HandoverItem, 'status'>[] }>) => {
      const handover: AssetHandover = {
        id: `HO-${Date.now()}`,
        rentalOrderId: action.payload.rentalOrderId,
        items: action.payload.items.map(item => ({ ...item, status: 'pending' as HandoverItemStatus })),
        syncedToServer: false,
        createdAt: new Date().toISOString(),
      };
      state.activeHandover = handover;
    },
    
    updateHandoverItemStatus: (state, action: PayloadAction<{ itemId: string; status: HandoverItemStatus; issueDescription?: string }>) => {
      if (state.activeHandover) {
        const item = state.activeHandover.items.find(i => i.id === action.payload.itemId);
        if (item) {
          item.status = action.payload.status;
          if (action.payload.issueDescription) {
            item.issueDescription = action.payload.issueDescription;
          }
        }
      }
    },
    
    setCasePhoto: (state, action: PayloadAction<string>) => {
      if (state.activeHandover) {
        state.activeHandover.casePhoto = action.payload;
      }
    },
    
    confirmHandover: (state, action: PayloadAction<{ userId: string }>) => {
      if (state.activeHandover) {
        state.activeHandover.confirmedAt = new Date().toISOString();
        state.activeHandover.confirmedBy = action.payload.userId;
        state.handovers.push(state.activeHandover);
        
        // Add to offline queue for sync
        state.offlineQueue.push({
          type: 'handover',
          action: 'create',
          payload: state.activeHandover,
          timestamp: new Date().toISOString(),
        });
        
        state.activeHandover = null;
      }
    },
    
    cancelHandover: (state) => {
      state.activeHandover = null;
    },
    
    // RFQ Cart Actions
    addToRFQCart: (state, action: PayloadAction<RFQItem>) => {
      const existingIndex = state.rfqCart.findIndex(i => i.equipmentId === action.payload.equipmentId);
      if (existingIndex >= 0) {
        state.rfqCart[existingIndex].quantity += action.payload.quantity;
      } else {
        state.rfqCart.push(action.payload);
      }
    },
    
    removeFromRFQCart: (state, action: PayloadAction<string>) => {
      state.rfqCart = state.rfqCart.filter(i => i.equipmentId !== action.payload);
    },
    
    updateRFQCartQuantity: (state, action: PayloadAction<{ equipmentId: string; quantity: number }>) => {
      const item = state.rfqCart.find(i => i.equipmentId === action.payload.equipmentId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    
    clearRFQCart: (state) => {
      state.rfqCart = [];
    },
    
    submitRFQ: (state, action: PayloadAction<{ customerId: string; customerName: string; startDate: string; endDate: string }>) => {
      const rfq: RFQ = {
        id: `RFQ-${Date.now()}`,
        customerId: action.payload.customerId,
        customerName: action.payload.customerName,
        items: [...state.rfqCart],
        rentalStartDate: action.payload.startDate,
        rentalEndDate: action.payload.endDate,
        status: 'pending',
        createdAt: new Date().toISOString(),
        syncedToServer: false,
      };
      state.rfqs.push(rfq);
      state.rfqCart = [];
      
      state.offlineQueue.push({
        type: 'rfq',
        action: 'create',
        payload: rfq,
        timestamp: new Date().toISOString(),
      });
    },
    
    // Vendor RFQ Actions
    quoteRFQ: (state, action: PayloadAction<{ rfqId: string; totalCost: number; notes?: string }>) => {
      const rfq = state.rfqs.find(r => r.id === action.payload.rfqId);
      if (rfq) {
        rfq.status = 'quoted';
        rfq.totalCost = action.payload.totalCost;
        rfq.vendorNotes = action.payload.notes;
        rfq.quotedAt = new Date().toISOString();
      }
    },
    
    updateRFQStatus: (state, action: PayloadAction<{ rfqId: string; status: RFQStatus }>) => {
      const rfq = state.rfqs.find(r => r.id === action.payload.rfqId);
      if (rfq) {
        rfq.status = action.payload.status;
      }
    },
    
    // Digital Camera Report Actions
    addCameraReport: (state, action: PayloadAction<Omit<CameraReport, 'id' | 'createdAt' | 'syncedToServer'>>) => {
      const report: CameraReport = {
        ...action.payload,
        id: `DCR-${Date.now()}`,
        createdAt: new Date().toISOString(),
        syncedToServer: false,
      };
      state.cameraReports.push(report);
      
      state.offlineQueue.push({
        type: 'cameraReport',
        action: 'create',
        payload: report,
        timestamp: new Date().toISOString(),
      });
    },
    
    // Expendables Actions
    updateExpendableCount: (state, action: PayloadAction<{ id: string; delta: number; userId: string }>) => {
      const expendable = state.expendables.find(e => e.id === action.payload.id);
      if (expendable) {
        expendable.currentCount = Math.max(0, expendable.currentCount + action.payload.delta);
        expendable.lastUpdated = new Date().toISOString();
        expendable.updatedBy = action.payload.userId;
        
        // Check for low stock
        if (expendable.currentCount < expendable.minimumThreshold) {
          if (!state.lowStockAlerts.includes(expendable.id)) {
            state.lowStockAlerts.push(expendable.id);
          }
        } else {
          state.lowStockAlerts = state.lowStockAlerts.filter(id => id !== expendable.id);
        }
      }
    },
    
    addExpendable: (state, action: PayloadAction<Omit<Expendable, 'id' | 'lastUpdated'>>) => {
      const expendable: Expendable = {
        ...action.payload,
        id: `exp-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
      };
      state.expendables.push(expendable);
    },
    
    dismissLowStockAlert: (state, action: PayloadAction<string>) => {
      state.lowStockAlerts = state.lowStockAlerts.filter(id => id !== action.payload);
    },
    
    // Scenes Master Actions
    importScenesMaster: (state, action: PayloadAction<SceneMaster[]>) => {
      state.scenesMaster = [...state.scenesMaster, ...action.payload];
    },
    
    clearScenesMaster: (state) => {
      state.scenesMaster = [];
    },
    
    // Sync Actions
    syncOfflineQueue: (state) => {
      // Simulate sync - in real app would call API
      state.offlineQueue = [];
      state.handovers.forEach(h => { h.syncedToServer = true; });
      state.rfqs.forEach(r => { r.syncedToServer = true; });
      state.cameraReports.forEach(c => { c.syncedToServer = true; });
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  startHandover,
  updateHandoverItemStatus,
  setCasePhoto,
  confirmHandover,
  cancelHandover,
  addToRFQCart,
  removeFromRFQCart,
  updateRFQCartQuantity,
  clearRFQCart,
  submitRFQ,
  quoteRFQ,
  updateRFQStatus,
  addCameraReport,
  updateExpendableCount,
  addExpendable,
  dismissLowStockAlert,
  importScenesMaster,
  clearScenesMaster,
  syncOfflineQueue,
  setLoading,
} = cameraDepartmentSlice.actions;

export default cameraDepartmentSlice.reducer;
