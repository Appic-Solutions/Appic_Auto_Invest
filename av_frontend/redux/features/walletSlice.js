import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
// import { fetchData } from "@/utils/apiHandler";

const initialWalletItems = {
  isWalletConnected: false,
  isPolicyAccepted: false,
  walletAddress: null,
  chainId: 1,
  walletName: null,
  userName: null,
  walletBalance: 0,
  assets: null,
  loader: false,
  serverResponse: null,
  error: null,
  activeWallet: null,
  web3Instance: null,
  allAssets: [],
};

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    items: initialWalletItems,
    status: "idle",
    error: null,
  },
  reducers: {
    // Action to disconnect Wallet
    initWallet: (state, action) => {
      state.items.walletAddress = action.payload.walletAddress;
      state.items.walletName = action.payload.walletName;
      state.items.isWalletConnected = action.payload.isWalletConnected;
      state.items.isPolicyAccepted = action.payload.isPolicyAccepted;
      state.items.assets = action.payload.assets;
      state.items.web3Instance = action.payload.web3Instance;
    },
    // Action to disconnect Wallet
    resetWallet: (state, action) => {
      state.items.isWalletConnected = false;
      state.items.walletAddress = null;
      state.items.chainId = 1;
      state.items.walletName = "metamask";
      state.items.assets = null;
      state.items.allAssets=[];
      state.items.web3Instance = null;
    },
    setWalletAddress: (state, action) => {
      state.items.walletAddress = action.payload;
    },
    // Action to change chainId
    changeChainId: (state, action) => {
      state.items.chainId = action.payload;
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
    setAllAssets: (state, action) => {
      state.items.allAssets = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWalletData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchWalletData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const fetchWalletData = createAsyncThunk(
  "data/fetchWalletData",
  async () => {
    const response = await fetchData();
    return response.data;
  }
);

export const walletReducer = walletSlice.reducer;

export const {
  initWallet,
  resetWallet,
  changeChainId,
  setWalletAddress,
  startLoading,
  stopLoading,
  setError,
  setAssets,
  setAllAssets,
} = walletSlice.actions;
