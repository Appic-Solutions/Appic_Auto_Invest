import { useCallback, useEffect, useState } from 'react';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import canistersIDs from '@/config/canistersIDs';
import { AppicIdlFactory, dip20IdleFactory, icrcIdlFactory, sonicIdlFactory } from '@/did';
import { initTokens } from '@/redux/features/supportedTokensSlice';
import { useDispatch } from 'react-redux';
import { Principal } from '@dfinity/principal';

import { initPairs } from '@/redux/features/supportedPairs';
import BigNumber from 'bignumber.js';
import { initPositions } from '@/redux/features/dcaPositions';

export const useUserDcaPositions = (userPrinciplaId, supportedTokens) => {
  const dispatch = useDispatch();
  const [getUsetPositionsError, setGetUsetPositionsError] = useState(null);
  useEffect(() => {
    // Fetch all Pairs from Appic canister
    if (userPrinciplaId == null || userPrinciplaId == '') return;
    if (supportedTokens.length == 0 || supportedTokens == '') return;
    async function getAllUserPositions() {
      try {
        const appicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_ROOT, AppicIdlFactory, true);
        const activePositions = await appicActor.getPositionsFor(Principal.fromText(userPrinciplaId), [], [], [true]);
        const completedPositions = await appicActor.getPositionsFor(Principal.fromText(userPrinciplaId), [], [], [false]);

        const parsedActivePositions = _formatPositions(activePositions, supportedTokens);
        const parsedCompletedPositions = _formatPositions(completedPositions, supportedTokens);

        dispatch(initPositions({ active: parsedActivePositions, completed: parsedCompletedPositions }));
        console.log(parsedActivePositions, parsedCompletedPositions);
      } catch (error) {
        console.log(error);
        setGetUsetPositionsError(error);
      }
    }
    getAllUserPositions();
    return () => {};
  }, [userPrinciplaId]);
  return { getUsetPositionsError };
};

function _formatPositions(positions, supportedTokens) {
  return positions.map((position) => {
    // Parse swaps object
    const swaps = position.swaps.map((swap) => {
      return {
        amountBought: swap.amountBought.length == 0 ? null : BigNumber(swap.amountBought).toString(),
        sellingAmount: BigNumber(swap.sellingAmount).toString(),
        step1: swap.step1.length == 1 ? null : swap.step1,
        step2: swap.step1.length == 1 ? null : swap.step2,
        step3: swap.step1.length == 1 ? null : swap.step3,
        step4: swap.step1.length == 1 ? null : swap.step4,
        step5: swap.step1.length == 1 ? null : swap.step5,
        step6: swap.step1.length == 1 ? null : swap.step6,
        transactionId: BigNumber(swap.transactionId).toString(),
        transactionStatus: Object.keys(swap.transactionStatus)[0],
        transactionTime: BigNumber(swap.transactionTime).toString(),
      };
    });

    // Find Buy token and sell token
    const sellToken = supportedTokens.find((token) => token.id == position.tokens.sellToken.toString());
    const buyToken = supportedTokens.find((token) => token.id == position.tokens.buyToken.toString());

    // Parse Position object
    return {
      destination: position.destination.toText(),
      initialAllowance: BigNumber(position.initialAllowance).toString(),
      leftAllowance: BigNumber(position.leftAllowance).toString(),
      managerCanister: position.managerCanister.toText(),
      positionId: BigNumber(position.positionId).toString(),
      positionStatus: Object.keys(position.positionStatus)[0],
      swaps: swaps,
      sellToken,
      buyToken,
    };
  });
}

