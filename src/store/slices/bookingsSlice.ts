import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Invoice {
  id: string;
  referenceNumber: string;
  bookingId: string;
  generatedAt: string;
  items: {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface Booking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  customerName: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  invoice?: Invoice;
  paymentStatus?: 'pending' | 'held_in_escrow' | 'released' | 'refunded';
  paymentDate?: string;
}

export interface Notification {
  id: string;
  type: 'booking_accepted' | 'booking_rejected' | 'invoice_generated' | 'payment_status';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  bookingId?: string;
  invoiceRef?: string;
}

interface BookingsState {
  bookings: Booking[];
  notifications: Notification[];
  isLoading: boolean;
  statusFilter: string;
}

const initialState: BookingsState = {
  bookings: [],
  notifications: [],
  isLoading: false,
  statusFilter: 'all',
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
    },
    updateBookingStatus: (state, action: PayloadAction<{ id: string; status: Booking['status']; invoice?: Invoice; paymentStatus?: Booking['paymentStatus'] }>) => {
      const booking = state.bookings.find(b => b.id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
        if (action.payload.invoice) {
          booking.invoice = action.payload.invoice;
        }
        if (action.payload.paymentStatus) {
          booking.paymentStatus = action.payload.paymentStatus;
          booking.paymentDate = new Date().toISOString();
        }
      }
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notif-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(notification);
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsRead: (state) => {
      state.notifications.forEach(n => n.read = true);
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { 
  setBookings, 
  updateBookingStatus, 
  setStatusFilter, 
  setLoading,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead 
} = bookingsSlice.actions;
export default bookingsSlice.reducer;