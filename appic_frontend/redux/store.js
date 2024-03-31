import { configureStore } from "@reduxjs/toolkit";

import { initWallet, setAssets, startLoading, stopLoading, walletReducer } from "./features/walletSlice";
import { sidebarReducer, themeReducer } from "./features/themeSlice";
import { tokensReducer } from "./features/tokensSlice";
import { pageReducer } from "./features/pageData";
import { connectWalletModalReducer } from "./features/walletsModal";
import { icpPriceReducer } from "./features/icpPrice";

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    theme: themeReducer,
    sidebar: sidebarReducer,
    tokens: tokensReducer,
    page: pageReducer,
    connectWalletModal: connectWalletModalReducer,
    icpPrice: icpPriceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const getState = store.getState;
