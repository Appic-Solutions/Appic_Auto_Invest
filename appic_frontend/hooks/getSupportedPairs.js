import { useCallback, useEffect, useState } from 'react';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import canistersIDs from '@/config/canistersIDs';
import { AppicIdlFactory, dip20IdleFactory, icrcIdlFactory, sonicIdlFactory } from '@/did';
import { initTokens } from '@/redux/features/supportedTokensSlice';
import { useDispatch } from 'react-redux';
import { parseResponseGetAllTokens } from '@/utils/responseParser';

import { Principal } from '@dfinity/principal';
import { waitWithTimeout } from '@/utils/timeFunctions';
import BigNumber from 'bignumber.js';
import { initPairs } from '@/redux/features/supportedPairs';

export const useSupportedPairs = (assets, supportedTokens) => {
  const dispatch = useDispatch();
  const [getSupportedPairsError, setGetSupportedPairsError] = useState(null);
  useEffect(() => {
    // Fetch all Pairs from Appic canister
    if ((supportedTokens.length == 0, supportedTokens == null)) return;
    async function setAllTokensWithtPrices() {
      try {
        const appicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_ROOT, AppicIdlFactory, true);
        const supportedPairs = await appicActor.getAllPairs();
        const parsedsupportedPairs = _parseSupportedPairs(supportedPairs, assets, supportedTokens);
        console.log(parsedsupportedPairs);
        dispatch(initPairs(parsedsupportedPairs));
        // console.log(supportedPairs);
      } catch (error) {
        console.log(error);
        setGetSupportedPairsError(error);
      }
    }
    setAllTokensWithtPrices();
    return () => {};
  }, [assets, supportedTokens]);
  return { getSupportedPairsError };
};

const _parseSupportedPairs = (supportedPairs, assets, supportedTokens) => {
  let parsedsupportedPairs = supportedPairs.map((pair) => {
    const sellTokenAddress = pair.sellToken.toString();
    const buyTokenAddress = pair.buyToken.toString();

    // Add data to sell token
    let sellToken = {};
    let assetResult = assets.find((asset) => asset.id == sellTokenAddress);
    if (assetResult) {
      sellToken = assetResult;
    } else {
      let suppoortedSellTokenResult = supportedTokens.find((token) => token.id == sellTokenAddress);
      sellToken = { ...suppoortedSellTokenResult, balance: 0 };
    }

    // Add data to buy token
    let buyToken = {};
    let suppoortedBuyTokenResult = supportedTokens.find((token) => token.id == buyTokenAddress);
    buyToken = suppoortedBuyTokenResult;
    return {
      sellToken,
      buyToken,
    };
  });
  return parsedsupportedPairs;
};

