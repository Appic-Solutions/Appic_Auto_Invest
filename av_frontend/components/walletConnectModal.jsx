"use client";
import { closeConnectWalletModal } from "@/redux/features/walletsModal";
import darkModeClassnamegenerator, { darkClassGenerator } from "@/utils/darkClassGenerator";
import { artemisWalletAdapter } from "@/utils/walletConnector";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function WalletConnectM() {
  const dispatch = useDispatch();

  const isDark = useSelector((state) => state.theme.isDark);

  const connectWalletModal = useSelector((state) => state.connectWalletModal.isActive);

  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const principalID = useSelector((state) => state.wallet.items.principalID);
  const accoundID = useSelector((state) => state.wallet?.items?.accoundID);
  const walletName = useSelector((state) => state.wallet.items.walletName);
  const assets = useSelector((state) => state.wallet.items.assets);

  return (
    <>
      {connectWalletModal == true && (
        <div className={darkClassGenerator(isDark, "walletConnectModal")}>
          <div className="bg">
            <div className="container">
              <div className="topSection">
                <div></div>
                <h3 className="title">Connect Wallet</h3>
                <button
                  onClick={() => {
                    dispatch(closeConnectWalletModal());
                  }}
                  className="closeBTN"
                >
                  <svg fill="none" viewBox="0 0 16 16">
                    <path
                      fill="currentColor"
                      fill-rule="evenodd"
                      d="M2.54 2.54a1 1 0 0 1 1.42 0L8 6.6l4.04-4.05a1 1 0 1 1 1.42 1.42L9.4 8l4.05 4.04a1 1 0 0 1-1.42 1.42L8 9.4l-4.04 4.05a1 1 0 0 1-1.42-1.42L6.6 8 2.54 3.96a1 1 0 0 1 0-1.42Z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="seprator">
                <span></span>
              </div>
              <div className="walletsContainer">
                {artemisWalletAdapter.wallets.map((wallet) => {
                  return (
                    <div className="wallet">
                      <img src={wallet.icon} className="walletIcon" alt="" />
                      <div className="walletDetails">
                        <h4 className="walletName">{wallet.name}</h4>
                        <p className="walletStatus">
                          {wallet.adapter?.readyState == "NotDetected" ? "Please Install the wallet first" : wallet.adapter?.readyState}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default WalletConnectM;
