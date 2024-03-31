import { configureStore } from '@reduxjs/toolkit';

import { initWallet, setAssets, startLoading, stopLoading, walletReducer } from './features/walletSlice';
import { sidebarReducer, themeReducer } from './features/themeSlice';
import { allTokensReducer } from './features/allTokensSlice';
import { pageReducer } from './features/pageData';
import { connectWalletModalReducer } from './features/walletsModal';
import { icpPriceReducer } from './features/icpPrice';
import { supportedTokensReducer } from './features/supportedTokensSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    theme: themeReducer,
    sidebar: sidebarReducer,
    allTokens: allTokensReducer,
    supportedTokens: supportedTokensReducer,
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

