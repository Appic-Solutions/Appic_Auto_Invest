import { useCallback, useEffect, useState } from "react";
import { artemisWalletAdapter } from "@/utils/walletConnector";
import canistersIDs from "@/config/canistersIDs";
import { dip20IdleFactory, icrcIdlFactory, sonicIdlFactory } from "@/did";
import { initTokens } from "@/redux/features/tokensSlice";
import { useDispatch } from "react-redux";
import { parseResponseGetAllTokens } from "@/utils/responseParser";

import { Principal } from "@dfinity/principal";
import { waitWithTimeout } from "@/utils/timeFunctions";

export const useBalances = (isConnected, PrincipalId, AccountId, allTokens) => {
  const dispatch = useDispatch();
  const [principalAssets, setPrincipalAssets] = useState(null);
  const [principalAssetsError, setPrincipalAssetsError] = useState(null);
  useEffect(() => {
    if (isConnected == false) return;
    // Fetch all tokens from sonic canister
    if (PrincipalId == null) return;
    if (allTokens == null || allTokens.length == 0) return;
    async function getPrincipalAssets() {
      try {
        const principalAssets = await tokenBalances(allTokens, PrincipalId);
        console.log(principalAssets);
      } catch (error) {
        console.log(error);
      }
    }
    getPrincipalAssets();
    return () => {};
  }, [isConnected, PrincipalId, AccountId, allTokens]);
  return {};
};

const tokenBalances = (allTokens, principalId) => {
  const tokens = Promise.all(
    allTokens.map(async (token) => {
      const tokenCanisterId = token.id;
      const tokenType = token.tokenType;
      try {
        let tokenBalance = await _getTokenBalance(tokenCanisterId, tokenType, principalId);
        return { ...token, balance: tokenBalance };
      } catch (error) {
        console.log(error);
        const errorResult = { ...token, balance: BigInt(0) };
        return errorResult;
      }
    })
  );
  return tokens;
};

const _getTokenBalance = async (canisterId, tokenType, principalId) => {
  var tokenType = tokenType.toLowerCase();
  var tokenBalance = BigInt(0);
  const idleFactory = tokenType == "dip20" || tokenType == "yc" ? dip20IdleFactory : icrcIdlFactory;
  try {
    var tokenActor = await artemisWalletAdapter.getCanisterActor(canisterId, idleFactory, true);
    if (tokenType == "dip20" || tokenType == "yc") {
      tokenBalance = await Promise.race([tokenActor.balanceOf(Principal.fromText(principalId)), waitWithTimeout(10000)]);
    } else if (tokenType == "icrc1" || tokenType == "icrc2") {
      tokenBalance = await Promise.race([tokenActor.icrc1_balance_of({ owner: Principal.fromText(principalId), subaccount: [] }), waitWithTimeout(10000)]);
    }
  } catch (error) {
    console.log(error);
    tokenBalance = BigInt(0);
  }
  return tokenBalance;
};
