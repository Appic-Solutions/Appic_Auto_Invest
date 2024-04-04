import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

const initialPairs = { pairs: [] };

const supportedPairsSlice = createSlice({
  name: 'supportedpairs',
  initialState: initialPairs,
  reducers: {
    // Action to setCoins for the first time
    initPairs: (state, action) => {
      state.pairs = action.payload;
    },
    // Action to reset Coins array
    resetPairs: (state) => {
      state.pairs = [];
    },
  },
});

export const supportedPairsReducer = supportedPairsSlice.reducer;
export const { initPairs, resetPairs } = supportedPairsSlice.actions;

