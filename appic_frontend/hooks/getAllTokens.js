import { useCallback, useEffect, useState } from 'react';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import canistersIDs from '@/config/canistersIDs';
import { icrcIdlFactory, sonicIdlFactory } from '@/did';
import { initTokens } from '@/redux/features/allTokensSlice';
import { useDispatch } from 'react-redux';
import { parseResponseGetAllTokens } from '@/utils/responseParser';
import axios from 'axios';
import externalLinks from '@/utils/externalLinks';

export const useAllTokens = () => {
  const dispatch = useDispatch();
  const [allTokensError, setAllTokensError] = useState(null);
  useEffect(() => {
    // Fetch all tokens from sonic canister

    async function getAllSuppportedTokens() {
      try {
        const sonicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.NNS_SONIC_DAPP, sonicIdlFactory, true);
        let allTokens = await sonicActor.getSupportedTokenList();

        // Parse response and save
        dispatch(initTokens(parseResponseGetAllTokens(allTokens)));
      } catch (error) {
        console.log(error);
        setAllTokensError(error);
      }
    }
    getAllSuppportedTokens();
    return () => {};
  }, []);
  return { allTokensError };
};

