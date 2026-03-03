import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FavoriteItem {
  id: string;
  equipmentId: string;
  name: string;
  brand: string;
  vendor: string;
  category: string;
  dailyRate: number;
  weeklyRate: number;
  rating: number;
  reviewCount: number;
  image: string;
  availability: 'available' | 'rented' | 'maintenance';
  description: string;
  addedAt: string;
}

interface FavoritesState {
  items: FavoriteItem[];
}

const initialState: FavoritesState = {
  items: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<Omit<FavoriteItem, 'id' | 'addedAt'>>) => {
      const exists = state.items.find(item => item.equipmentId === action.payload.equipmentId);
      if (!exists) {
        state.items.push({
          ...action.payload,
          id: `fav-${Date.now()}`,
          addedAt: new Date().toISOString(),
        });
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.equipmentId !== action.payload);
    },
    toggleFavorite: (state, action: PayloadAction<Omit<FavoriteItem, 'id' | 'addedAt'>>) => {
      const existingIndex = state.items.findIndex(item => item.equipmentId === action.payload.equipmentId);
      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push({
          ...action.payload,
          id: `fav-${Date.now()}`,
          addedAt: new Date().toISOString(),
        });
      }
    },
    clearFavorites: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  clearFavorites,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
