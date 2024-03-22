import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

const intialCoins = { coins:[] };

const coinSlice = createSlice({
  name: "coins",
  initialState: intialCoins,
  reducers: {
    // Action to setCoins for the first time
    initCoins: (state, action) => {
      state.coins = action.payload;
    },
    // Action to reset Coins array
    resetCoins: (state) => {
      state.coins = [];
    },
  },
});

export const coinReducer = coinSlice.reducer;

export const { initCoins, resetCoins } = coinSlice.actions;
