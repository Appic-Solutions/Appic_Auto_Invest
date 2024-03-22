"use client";
import { useEffect, useState } from "react";
import darkModeClassnamegenerator from "@/utils/darkClassGenerator";
import WalletTokens from "@/components/walletTokens";

import { useDispatch, useSelector } from "react-redux";
import LoadingComponent from "@/components/higerOrderComponents/loadingComponent";
import { changePageTitle } from "@/redux/features/pageData";
export default function Home() {
  const dispatch = useDispatch()
  const chainId = useSelector((state) => state.wallet.items.chainId);
  const [show, setShow] = useState(false);
  const [coinsPageNumber, setCoinsPageNumber] = useState(1);
  const [isClinet, setIsClient] = useState(false);

  useEffect(() => {
    dispatch(changePageTitle("Alpha Vault"))
    setIsClient(true);

  }, [])
  return (
    <main className={darkModeClassnamegenerator("mainPage")}>

      {isClinet && <>
        <WalletTokens />
      </>}

    </main>
  );
}
