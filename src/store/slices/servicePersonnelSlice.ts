import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ServicePersonnel {
  id: string;
  vendorId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  idProofType: 'aadhaar' | 'pan' | 'driving_license' | 'passport';
  idProofNumber: string;
  idProofDocument?: string;
  profilePhoto?: string;
  dailyRate: number;
  hourlyRate: number;
  specializations: string[];
  experience: string;
  availability: 'available' | 'booked' | 'unavailable';
  rating: number;
  totalJobs: number;
  createdAt: string;
  updatedAt: string;
}

export interface PersonnelBooking {
  id: string;
  personnelId: string;
  bookingId: string;
  startDate: string;
  endDate: string;
  hoursWorked?: number;
  dailyRate: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

interface ServicePersonnelState {
  personnel: ServicePersonnel[];
  personnelBookings: PersonnelBooking[];
  isLoading: boolean;
  searchTerm: string;
  roleFilter: string;
}

const initialState: ServicePersonnelState = {
  personnel: [
    {
      id: 'sp-1',
      vendorId: 'vendor-1',
      name: 'Rajesh Kumar',
      role: 'Chief Technician',
      email: 'rajesh@example.com',
      phone: '+91 98765 43210',
      idProofType: 'aadhaar',
      idProofNumber: 'XXXX-XXXX-1234',
      dailyRate: 2500,
      hourlyRate: 350,
      specializations: ['Camera Setup', 'Lighting', 'Audio'],
      experience: '8 years',
      availability: 'available',
      rating: 4.8,
      totalJobs: 156,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sp-2',
      vendorId: 'vendor-1',
      name: 'Amit Sharma',
      role: 'Lightman',
      email: 'amit@example.com',
      phone: '+91 98765 43211',
      idProofType: 'pan',
      idProofNumber: 'ABCDE1234F',
      dailyRate: 1800,
      hourlyRate: 250,
      specializations: ['Studio Lighting', 'Outdoor Lighting', 'LED Setup'],
      experience: '5 years',
      availability: 'available',
      rating: 4.5,
      totalJobs: 98,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'sp-3',
      vendorId: 'vendor-1',
      name: 'Priya Patel',
      role: 'Camera Assistant',
      email: 'priya@example.com',
      phone: '+91 98765 43212',
      idProofType: 'driving_license',
      idProofNumber: 'MH01-2020-123456',
      dailyRate: 2000,
      hourlyRate: 280,
      specializations: ['Focus Pulling', 'Camera Movement', 'Gimbal Operation'],
      experience: '4 years',
      availability: 'booked',
      rating: 4.7,
      totalJobs: 72,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  personnelBookings: [],
  isLoading: false,
  searchTerm: '',
  roleFilter: 'all',
};

const servicePersonnelSlice = createSlice({
  name: 'servicePersonnel',
  initialState,
  reducers: {
    addPersonnel: (state, action: PayloadAction<ServicePersonnel>) => {
      state.personnel.push(action.payload);
    },
    updatePersonnel: (state, action: PayloadAction<ServicePersonnel>) => {
      const index = state.personnel.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.personnel[index] = action.payload;
      }
    },
    deletePersonnel: (state, action: PayloadAction<string>) => {
      state.personnel = state.personnel.filter(p => p.id !== action.payload);
    },
    addPersonnelBooking: (state, action: PayloadAction<PersonnelBooking>) => {
      state.personnelBookings.push(action.payload);
      // Update personnel availability
      const personnel = state.personnel.find(p => p.id === action.payload.personnelId);
      if (personnel) {
        personnel.availability = 'booked';
      }
    },
    updatePersonnelBooking: (state, action: PayloadAction<{ id: string; updates: Partial<PersonnelBooking> }>) => {
      const booking = state.personnelBookings.find(b => b.id === action.payload.id);
      if (booking) {
        Object.assign(booking, action.payload.updates);
      }
    },
    completePersonnelBooking: (state, action: PayloadAction<string>) => {
      const booking = state.personnelBookings.find(b => b.id === action.payload);
      if (booking) {
        booking.status = 'completed';
        const personnel = state.personnel.find(p => p.id === booking.personnelId);
        if (personnel) {
          personnel.availability = 'available';
          personnel.totalJobs += 1;
        }
      }
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setRoleFilter: (state, action: PayloadAction<string>) => {
      state.roleFilter = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  addPersonnel,
  updatePersonnel,
  deletePersonnel,
  addPersonnelBooking,
  updatePersonnelBooking,
  completePersonnelBooking,
  setSearchTerm,
  setRoleFilter,
  setLoading,
} = servicePersonnelSlice.actions;

export default servicePersonnelSlice.reducer;
