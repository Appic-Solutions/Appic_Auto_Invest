import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

const intialTokens = { tokens: [] };

const supportedTokensSlice = createSlice({
  name: 'supportedTokens',
  initialState: intialTokens,
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

export const supportedTokensReducer = supportedTokensSlice.reducer;
export const { initTokens, resetTokens } = supportedTokensSlice.actions;

