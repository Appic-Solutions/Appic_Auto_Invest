import { useCallback, useEffect, useState } from 'react';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import { dip20IdleFactory, icrcIdlFactory, sonicIdlFactory } from '@/did';
import { useDispatch } from 'react-redux';

import { Principal } from '@dfinity/principal';
import { waitWithTimeout } from '@/utils/timeFunctions';
import { setAssets, setError, setTotalBalance, startLoading, stopLoading } from '@/redux/features/walletSlice';
import BigNumber from 'bignumber.js';

export const useBalances = (isConnected, PrincipalId, AccountId, supportedTokens) => {
  const dispatch = useDispatch();
  const [principalAssetsError, setPrincipalAssetsError] = useState(null);
  useEffect(() => {
    if (isConnected == false) return;
    if (PrincipalId == null) return;
    if (supportedTokens == null || supportedTokens.length == 0) return;
    dispatch(startLoading());
    // Get use Assets
    async function getPrincipalAssets() {
      let totalBalance = 0;
      try {
        const principalAssets = await tokenBalances(supportedTokens, PrincipalId);
        const nonZeroAssests = principalAssets.filter((token) => {
          if (token.balance != '0') {
            totalBalance += Number(token.usdBalance);
            return true;
          }
        });

        dispatch(setAssets(nonZeroAssests));
        dispatch(setTotalBalance(totalBalance));
        dispatch(stopLoading());
      } catch (error) {
        console.log(error);
        setPrincipalAssetsError(error);
        setError(error);
        dispatch(stopLoading());
      }
    }
    getPrincipalAssets();
    return () => {};
  }, [isConnected, PrincipalId, AccountId, supportedTokens]);
  return { principalAssetsError };
};

const tokenBalances = (supportedTokens, principalId) => {
  const tokens = Promise.all(
    supportedTokens.map(async (token) => {
      const tokenCanisterId = token.id;
      const tokenType = token.tokenType;
      try {
        let tokenBalance = await _getTokenBalance(tokenCanisterId, tokenType, principalId);
        let usdBalance = new BigNumber(tokenBalance)
          .dividedBy(10 ** token.decimals)
          .multipliedBy(token.price)
          .toString();
        return { ...token, balance: tokenBalance.toString(), usdBalance };
      } catch (error) {
        console.log(error);
        const errorResult = { ...token, balance: '0' };
        return errorResult;
      }
    })
  );
  return tokens;
};

const _getTokenBalance = async (canisterId, tokenType, principalId) => {
  var tokenType = tokenType.toLowerCase();
  var tokenBalance = BigInt(0);
  const idleFactory = tokenType == 'dip20' || tokenType == 'yc' ? dip20IdleFactory : icrcIdlFactory;
  try {
    var tokenActor = await artemisWalletAdapter.getCanisterActor(canisterId, idleFactory, true);
    if (tokenType == 'dip20' || tokenType == 'yc') {
      tokenBalance = await Promise.race([tokenActor.balanceOf(Principal.fromText(principalId)), waitWithTimeout(10000)]);
    } else if (tokenType == 'icrc1' || tokenType == 'icrc2') {
      tokenBalance = await Promise.race([
        tokenActor.icrc1_balance_of({ owner: Principal.fromText(principalId), subaccount: [] }),
        waitWithTimeout(10000),
      ]);
    }
  } catch (error) {
    console.log(error);
    tokenBalance = BigInt(0);
  }
  return tokenBalance;
};

