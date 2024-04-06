import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

const initialWallets = { wallets: [] };

const supportedWalletsSlice = createSlice({
  name: 'supportedWalltes',
  initialState: initialWallets,
  reducers: {
    // Action to setCoins for the first time
    intiWallets: (state, action) => {
      state.wallets = action.payload;
    },
    // Action to reset Coins array
    resetWallets: (state) => {
      state.wallets = [];
    },
  },
});

export const supportedWalletsReducer = supportedWalletsSlice.reducer;
export const { intiWallets, resetWallets } = supportedWalletsSlice.actions;

