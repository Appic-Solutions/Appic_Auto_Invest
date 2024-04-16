import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

const intialCoins = { tokens: [] };

const allTokensSlice = createSlice({
  name: 'tokens',
  initialState: intialCoins,
  reducers: {
    // Action to setCoins for the first time
    initTokens: (state, action) => {
      state.tokens = action.payload;
    },
    // Action to reset Coins array
    resetTokens: (state) => {
      state.tokens = [];
    },
  },
});

export const allTokensReducer = allTokensSlice.reducer;
export const { initTokens, resetTokens } = allTokensSlice.actions;

