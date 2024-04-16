import { configureStore } from '@reduxjs/toolkit';

import { initWallet, setAssets, startLoading, stopLoading, walletReducer } from './features/walletSlice';
import { sidebarReducer, themeReducer } from './features/themeSlice';
import { allTokensReducer } from './features/allTokensSlice';
import { connectWalletModalReducer } from './features/walletsModal';
import { icpPriceReducer } from './features/icpPrice';
import { supportedTokensReducer } from './features/supportedTokensSlice';
import { supportedPairsReducer } from './features/supportedPairs';
import { supportedWalletsReducer } from './features/supportedWallets';
import { userPositionsReducer } from './features/dcaPositions';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    theme: themeReducer,
    sidebar: sidebarReducer,
    allTokens: allTokensReducer,
    supportedTokens: supportedTokensReducer,
    connectWalletModal: connectWalletModalReducer,
    icpPrice: icpPriceReducer,
    supportedPairs: supportedPairsReducer,
    supportedWallets: supportedWalletsReducer,
    userPositionsReducer: userPositionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const getState = store.getState;

