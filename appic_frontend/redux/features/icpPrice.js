import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

const intialCoins = { usdPrice: 0 };

const icpPriceSlice = createSlice({
  name: "icpPrice",
  initialState: intialCoins,
  reducers: {
    // Action to setCoins for the first time
    initIcpPrice: (state, action) => {
      state.usdPrice = action.payload;
    },
    // Action to reset Coins array
    resetIcpPrice: (state) => {
      state.usdPrice = 0;
    },
  },
});

export const icpPriceReducer = icpPriceSlice.reducer;
export const { initIcpPrice, resetIcpPrice } = icpPriceSlice.actions;
