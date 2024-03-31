"use client";

import { openConnectWalletModal } from "@/redux/features/walletsModal";
import darkModeClassnamegenerator from "@/utils/darkClassGenerator";
import { artemisWalletAdapter, batchTransactionObject, connectWallet, transactions } from "@/utils/walletConnector";
import { useDispatch } from "react-redux";

// import { useConnect, useEthereum } from '@particle-network/auth-core-modal';
// import { useWeb3Modal } from "@web3modal/wagmi/react";

function WalletNotConnected() {
  const dispatch = useDispatch();

  return (
    <div className={darkModeClassnamegenerator("walletNotConnected")}>
      <div className="ic_wallets">
        {artemisWalletAdapter.wallets.map((wallet) => {
          return <img key={wallet.id} src={wallet.icon} />;
        })}
      </div>

      <h2> Wallet Not Connected</h2>

      <p>Connect your wallet to start creating Auto Invest positions!</p>
      <div className="buttonsContainer">
        <button
          onClick={() => {
            dispatch(openConnectWalletModal());
          }}
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

export default WalletNotConnected;
