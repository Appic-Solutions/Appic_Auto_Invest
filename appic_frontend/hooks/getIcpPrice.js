import { useCallback, useEffect, useState } from "react";
import { artemisWalletAdapter } from "@/utils/walletConnector";
import canistersIDs from "@/config/canistersIDs";
import { sonicIdlFactory } from "@/did";
import { initTokens } from "@/redux/features/tokensSlice";
import { useDispatch } from "react-redux";
import { parseResponseGetAllTokens } from "@/utils/responseParser";
import externalLinks from "@/utils/externalLinks";
import axios from "axios";
import { initIcpPrice } from "@/redux/features/icpPrice";

export const useIcpPrice = (isConnected, PrincipalId, AccountId) => {
  const dispatch = useDispatch();
  const [icpPrice, setIcpPrice] = useState(null);
  const [icpPriceError, setIcpPrcieError] = useState(null);
  useEffect(() => {
    if (isConnected == false) return;

    // Fetch all tokens from sonic canister

    async function getIcpPrice() {
      try {
        const response = await axios.get(externalLinks.icpPriceEndpoint);
        // Save to App's stroe
        setIcpPrice(response.data.price);
        dispatch(initIcpPrice(response.data.price));
      } catch (error) {
        console.log(error);
        setIcpPrcieError(error);
      }
    }
    getIcpPrice();
    return () => {};
  }, [isConnected, PrincipalId, AccountId]);
  return { icpPriceError, icpPrice };
};
