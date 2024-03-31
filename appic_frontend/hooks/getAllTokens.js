import { useCallback, useEffect, useState } from "react";
import { artemisWalletAdapter } from "@/utils/walletConnector";
import canistersIDs from "@/config/canistersIDs";
import { icrcIdlFactory, sonicIdlFactory } from "@/did";
import { initTokens } from "@/redux/features/tokensSlice";
import { useDispatch } from "react-redux";
import { parseResponseGetAllTokens } from "@/utils/responseParser";
import axios from "axios";
import externalLinks from "@/utils/externalLinks";

export const useAllTokens = (isConnected, PrincipalId, AccountId) => {
  const dispatch = useDispatch();
  const [allTokens, setAllTokens] = useState(null);
  const [allTokensError, setAllTokensError] = useState(null);
  useEffect(() => {
    if (isConnected == false) return;

    // Fetch all tokens from sonic canister

    async function getAllSuppportedTokens() {
      try {
        const sonicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.NNS_SONIC_DAPP, sonicIdlFactory, true);
        let allTokens = await sonicActor.getSupportedTokenList();

        //Get ICP
        const ICPActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.NNS_ICP_LEDGER, icrcIdlFactory, true);
        const ICPTotalSupply = await ICPActor.icrc1_total_supply();
        const ICPFee = await ICPActor.icrc1_fee();
        const ICPPrice = await axios.get(externalLinks.icpPriceEndpoint);
        allTokens = [
          {
            id: canistersIDs.NNS_ICP_LEDGER,
            fee: ICPFee,
            decimals: 8,
            name: "Internet Computer",
            totalSupply: ICPTotalSupply,
            blockStatus: "",
            tokenType: "ICRC2",
            symbol: "ICP",
            price: Number(ICPPrice.data.price),
            logo: "https://cdn.sonic.ooo/icons/ryjl3-tyaaa-aaaaa-aaaba-cai",
          },
          ...allTokens,
        ];
        // Parse response and save
        setAllTokens(parseResponseGetAllTokens(allTokens));
        dispatch(initTokens(parseResponseGetAllTokens(allTokens)));
      } catch (error) {
        console.log(error);
        setAllTokensError(error);
      }
    }
    getAllSuppportedTokens();
    return () => {};
  }, [isConnected, PrincipalId, AccountId]);
  return { allTokensError, allTokens };
};
