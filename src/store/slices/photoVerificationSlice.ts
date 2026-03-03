import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EquipmentPhoto {
  id: string;
  equipmentId: string;
  url: string;
  angle: string;
  capturedAt: string;
  uploadedBy: string;
  type: 'pre-rental' | 'post-rental';
  metadata: {
    width: number;
    height: number;
    fileSize: number;
    mimeType: string;
  };
}

export interface DamageReport {
  id: string;
  equipmentId: string;
  bookingId: string;
  preRentalPhotoId: string;
  postRentalPhotoId: string;
  damageDetected: boolean;
  damageScore: number;
  damageDescription: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  status: 'pending' | 'confirmed' | 'disputed' | 'resolved';
}

export interface PhotoAngleGuide {
  id: string;
  name: string;
  description: string;
  overlayImage?: string;
  requiredAngles: string[];
}

interface PhotoVerificationState {
  equipmentPhotos: EquipmentPhoto[];
  damageReports: DamageReport[];
  angleGuides: PhotoAngleGuide[];
  isCapturing: boolean;
  currentAngle: string;
  capturedAngles: string[];
  isLoading: boolean;
}

const defaultAngleGuides: PhotoAngleGuide[] = [
  {
    id: 'standard',
    name: 'Standard Equipment',
    description: 'Standard photo angles for equipment verification',
    requiredAngles: ['front', 'back', 'left', 'right', 'top', 'detail'],
  },
  {
    id: 'camera',
    name: 'Camera Equipment',
    description: 'Photo angles for camera bodies and lenses',
    requiredAngles: ['front', 'back', 'top', 'lens-mount', 'lcd-screen', 'controls'],
  },
  {
    id: 'lighting',
    name: 'Lighting Equipment',
    description: 'Photo angles for lighting gear',
    requiredAngles: ['front', 'back', 'stand', 'head', 'controls', 'cable'],
  },
];

const initialState: PhotoVerificationState = {
  equipmentPhotos: [],
  damageReports: [],
  angleGuides: defaultAngleGuides,
  isCapturing: false,
  currentAngle: '',
  capturedAngles: [],
  isLoading: false,
};

const photoVerificationSlice = createSlice({
  name: 'photoVerification',
  initialState,
  reducers: {
    addEquipmentPhoto: (state, action: PayloadAction<EquipmentPhoto>) => {
      state.equipmentPhotos.push(action.payload);
    },
    addMultiplePhotos: (state, action: PayloadAction<EquipmentPhoto[]>) => {
      state.equipmentPhotos.push(...action.payload);
    },
    removeEquipmentPhoto: (state, action: PayloadAction<string>) => {
      state.equipmentPhotos = state.equipmentPhotos.filter(p => p.id !== action.payload);
    },
    addDamageReport: (state, action: PayloadAction<DamageReport>) => {
      state.damageReports.push(action.payload);
    },
    updateDamageReport: (state, action: PayloadAction<{ id: string; updates: Partial<DamageReport> }>) => {
      const report = state.damageReports.find(r => r.id === action.payload.id);
      if (report) {
        Object.assign(report, action.payload.updates);
      }
    },
    setCapturing: (state, action: PayloadAction<boolean>) => {
      state.isCapturing = action.payload;
    },
    setCurrentAngle: (state, action: PayloadAction<string>) => {
      state.currentAngle = action.payload;
    },
    addCapturedAngle: (state, action: PayloadAction<string>) => {
      if (!state.capturedAngles.includes(action.payload)) {
        state.capturedAngles.push(action.payload);
      }
    },
    resetCapturedAngles: (state) => {
      state.capturedAngles = [];
      state.currentAngle = '';
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  addEquipmentPhoto,
  addMultiplePhotos,
  removeEquipmentPhoto,
  addDamageReport,
  updateDamageReport,
  setCapturing,
  setCurrentAngle,
  addCapturedAngle,
  resetCapturedAngles,
  setLoading,
} = photoVerificationSlice.actions;

export default photoVerificationSlice.reducer;
