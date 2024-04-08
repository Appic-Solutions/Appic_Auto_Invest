import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

const initialDCAPositions = { active: [], completed: [] };

const userPositionsSlice = createSlice({
  name: 'userPositions',
  initialState: initialDCAPositions,
  reducers: {
    // Action to setCoins for the first time
    initPositions: (state, action) => {
      state.active = action.payload.active;
      state.completed = action.payload.completed;
    },
    // Action to reset Coins array
    resetPositions: (state) => {
      state.active = [];
      state.completed = [];
    },
  },
});

export const userPositionsReducer = userPositionsSlice.reducer;
export const { initPositions, resetPositions } = userPositionsSlice.actions;

