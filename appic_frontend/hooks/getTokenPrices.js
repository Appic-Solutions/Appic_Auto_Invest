import { useCallback, useEffect, useState } from 'react';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import canistersIDs from '@/config/canistersIDs';
import { dip20IdleFactory, icrcIdlFactory, sonicIdlFactory } from '@/did';
import { initTokens } from '@/redux/features/supportedTokensSlice';
import { useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';

export const usePrices = (allTokens, icpPrice) => {
  const dispatch = useDispatch();
  const [getTokensPricesError, setGetTokensPricesError] = useState(null);
  useEffect(() => {
    // Fetch all tokens from sonic canister
    if (allTokens == null || allTokens.length == 0) return;
    async function setAllTokensWithtPrices() {
      try {
        const allPairs = await _getAllPais();
        const calculatedTokensWithPrices = calculatePrice(allTokens, allPairs, icpPrice);
        dispatch(initTokens(calculatedTokensWithPrices));
      } catch (error) {
        console.log(error);
        setGetTokensPricesError(error);
      }
    }
    setAllTokensWithtPrices();
    return () => {};
  }, [allTokens, icpPrice]);
  return { getTokensPricesError };
};

const _getAllPais = async () => {
  const sonicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.NNS_SONIC_DAPP, sonicIdlFactory, true);
  const allPairs = await sonicActor.getAllPairs();
  return allPairs;
};

const calculatePrice = (allTokens, allPairs, icpPrice) => {
  //   Maping over all tokens to set thier price
  const allTokensWithPrices = [];
  allTokens.forEach((token) => {
    // Check if token is ICP or WICP
    if (token.id === canistersIDs.WICP || token.id === canistersIDs.NNS_ICP_LEDGER) {
      allTokensWithPrices.push({ ...token, price: icpPrice });
    }

    // Find the pair for ICP and Target token
    let pair = allPairs.find(
      (pair) => pair.id == `${token.id}:${canistersIDs.NNS_ICP_LEDGER}` || pair.id == `${canistersIDs.NNS_ICP_LEDGER}:${token.id}`
    );
    // if there is no ICP pair, Check for WICP pairs
    if (pair == undefined || !pair) {
      pair = allPairs.find((pair) => pair.id == `${token.id}:${canistersIDs.WICP}` || pair.id == `${canistersIDs.WICP}:${token.id}`);
    }

    //  If there is no Pairs between ICP or WICP and the token
    if (pair == undefined || !pair) {
      return;
    }

    // Set Base Reserve(ICP) from Pair
    const baseReserve =
      pair.token0 === canistersIDs.WICP || pair.token0 === canistersIDs.NNS_ICP_LEDGER
        ? { value: pair.reserve0, decimmals: 8 }
        : { value: pair.reserve1, decimmals: 8 };
    // Set Token Reserve(Token) from pair
    const tokenReserve =
      pair.token0 === canistersIDs.WICP || pair.token0 === canistersIDs.NNS_ICP_LEDGER
        ? { value: pair.reserve1, decimmals: token.decimals }
        : { value: pair.reserve0, decimmals: token.decimals };

    const price = new BigNumber(new BigNumber(baseReserve.value).dividedBy(10 ** baseReserve.decimmals))
      .multipliedBy(icpPrice)
      .dividedBy(new BigNumber(tokenReserve.value).dividedBy(10 ** tokenReserve.decimmals))
      .toString();
    allTokensWithPrices.push({ ...token, price });
  });

  return allTokensWithPrices;
};

