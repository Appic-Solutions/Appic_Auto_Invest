import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
// import { fetchData } from "@/utils/apiHandler";

const initialWalletItems = {
  isWalletConnected: false,
  principalID: null,
  accountID: 1,
  walletName: null,
  walletBalance: 0,
  loader: false,
  error: null,
  assets: [],
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    items: initialWalletItems,
    status: 'idle',
    error: null,
  },
  reducers: {
    // Action to disconnect Wallet
    initWallet: (state, action) => {
      state.items.principalID = action.payload.principalID;
      state.items.accountID = action.payload.accountID;
      state.items.walletName = action.payload.walletName;
      state.items.isWalletConnected = action.payload.isWalletConnected;
      state.items.assets = action.payload.assets;
    },
    // Action to disconnect Wallet
    resetWallet: (state, action) => {
      state.items.isWalletConnected = false;
      state.items.principalID = null;
      state.items.accountID = 1;
      state.items.walletName = null;
      state.items.assets = [];
    },
    setPrincipalID: (state, action) => {
      state.items.principalID = action.payload;
    },
    // Action to change accountID
    changeAccountID: (state, action) => {
      state.items.accountID = action.payload;
    },
    // Action to start loading
    startLoading: (state) => {
      state.items.loader = true;
    },
    // Action to stop loading
    stopLoading: (state) => {
      state.items.loader = false;
    },
    // Action to set an error
    setError: (state, action) => {
      state.items.error = action.payload;
    },
    setAssets: (state, action) => {
      state.items.assets = action.payload;
    },
  },
});

export const walletReducer = walletSlice.reducer;

export const { initWallet, resetWallet, changeAccountID, setprincipalID, startLoading, stopLoading, setError, setAssets } = walletSlice.actions;

