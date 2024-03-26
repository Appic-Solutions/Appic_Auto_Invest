import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialModal = {
  isActive: false,
};

const connectWalletModalSlice = createSlice({
  name: "connectWalletModal",
  initialState: initialModal,
  reducers: {
    closeConnectWalletModal: (state) => {
      state.isActive = false;
    },
    openConnectWalletModal: (state) => {
      state.isActive = true;
    },
  },
});

export const connectWalletModalReducer = connectWalletModalSlice.reducer;
export const { closeConnectWalletModal, openConnectWalletModal } = connectWalletModalSlice.actions;
