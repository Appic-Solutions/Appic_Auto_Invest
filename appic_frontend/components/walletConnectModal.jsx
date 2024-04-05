'use client';
import canistersIDs from '@/config/canistersIDs';
import whiteListCanisters from '@/config/whiteListCanisters';
import { AppicIdlFactory } from '@/did';
import { initWallet } from '@/redux/features/walletSlice';
import { closeConnectWalletModal } from '@/redux/features/walletsModal';
import darkModeClassnamegenerator, { darkClassGenerator } from '@/utils/darkClassGenerator';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Hooks
import { useAllTokens } from '@/hooks/getAllTokens';
import { useIcpPrice } from '@/hooks/getIcpPrice';
import { useBalances } from '@/hooks/getPrincipalBalances';
import { usePrices } from '@/hooks/getTokenPrices';
import Modal from './higerOrderComponents/modal';
import { useSupportedPairs } from '@/hooks/getSupportedPairs';

function WalletConnectM() {
  const dispatch = useDispatch();

  const isDark = useSelector((state) => state.theme.isDark);

  const connectWalletModal = useSelector((state) => state.connectWalletModal.isActive);
  const [connectWalletStatus, setConnectWalletStatus] = useState(null);
  const [selectedWalletDetails, setSelectedWalletDetails] = useState(null);

  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const principalID = useSelector((state) => state.wallet.items.principalID);
  const accoundID = useSelector((state) => state.wallet?.items?.accoundID);
  const walletName = useSelector((state) => state.wallet.items.walletName);
  const assets = useSelector((state) => state.wallet.items.assets);
  const totalBalance = useSelector((state) => state.wallet.items.totalBalance);
  const icpPrice = useSelector((state) => state.icpPrice.usdPrice);
  const allTokensList = useSelector((state) => state.allTokens.tokens);
  const supportedTokens = useSelector((state) => state.supportedTokens.tokens);
  // Custom Hooks

  // TODO: set a timer taht call all these hooks every 15 seconds to fetch new data
  // Fetch Icp price
  const { icpPriceError } = useIcpPrice();
  // Fetch IC all token from sonic
  const { allTokensError } = useAllTokens();
  // Fetch all tokens prices and remove 0$ tokens
  const { getTokensPricesError } = usePrices(allTokensList, icpPrice);
  // Fetch token balances and usd balance of each user
  const { principalAssetsError } = useBalances(isWalletConnected, principalID, accoundID, supportedTokens);
  //  Fetch Supported pairs from Appic canister
  const { getSupportedPairsError } = useSupportedPairs(assets, supportedTokens);
  // TODO: Handle errors via a notification bar
  // Events

  // Connect to selected wallet
  const handleConnect = async (selectedWallet) => {
    try {
      if (selectedWallet.adapter?.readyState == 'NotDetected') {
        let response = await artemisWalletAdapter.connect(selectedWallet.id, { whitelist: whiteListCanisters, host: 'https://icp0.io/' });
        return;
      }
      setSelectedWalletDetails(selectedWallet);
      setConnectWalletStatus('Loading');
      let response = await artemisWalletAdapter.connect(selectedWallet.id, { whitelist: whiteListCanisters, host: 'https://icp0.io/' });
      if (response) {
        let accountID = artemisWalletAdapter.accountId;
        dispatch(
          initWallet({
            principalID: response,
            accountID,
            walletName: selectedWallet.name,
            isWalletConnected: true,
            assets: [],
            totalBalance: 0,
          })
        );
        dispatch(closeConnectWalletModal());
        setConnectWalletStatus(null);
      } else {
        setConnectWalletStatus('Failed');
      }
    } catch (error) {
      console.log(error);
      setConnectWalletStatus('Failed');
    }
  };

  // Trying to connect to wallet again handler
  const handleTryAgain = async () => {
    try {
      setConnectWalletStatus('Loading');
      let response = await artemisWalletAdapter.connect(selectedWalletDetails.id, { whitelist: whiteListCanisters, host: 'https://icp0.io/' });
      if (response) {
        let accountID = artemisWalletAdapter.accountId;
        dispatch(
          initWallet({
            principalID: response,
            accountID,
            walletName: selectedWalletDetails.name,
            isWalletConnected: true,
            assets: [],
            totalBalance: 0,
          })
        );
        dispatch(closeConnectWalletModal());
        setConnectWalletStatus(null);
      }
    } catch (error) {
      console.log(error);
      setConnectWalletStatus('Failed');
    }
  };

  // Rernder
  return (
    <Modal active={connectWalletModal}>
      <div className={darkClassGenerator(isDark, 'connectWalletModalConectent')}>
        <div className="topSection">
          <button
            className="backBTN"
            onClick={() => {
              setConnectWalletStatus(null);
            }}
          >
            {(connectWalletStatus == 'Loading' || connectWalletStatus == 'Failed') && (
              <svg fill="none" viewBox="0 0 16 16">
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M11.04 1.46a1 1 0 0 1 0 1.41L5.91 8l5.13 5.13a1 1 0 1 1-1.41 1.41L3.79 8.71a1 1 0 0 1 0-1.42l5.84-5.83a1 1 0 0 1 1.41 0Z"
                  clipRule="evenodd"
                ></path>
              </svg>
            )}
          </button>
          <h3 className="title">Connect Wallet</h3>
          <button
            onClick={() => {
              dispatch(closeConnectWalletModal());
              setConnectWalletStatus(null);
            }}
            className="closeBTN"
          >
            <svg fill="none" viewBox="0 0 16 16">
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M2.54 2.54a1 1 0 0 1 1.42 0L8 6.6l4.04-4.05a1 1 0 1 1 1.42 1.42L9.4 8l4.05 4.04a1 1 0 0 1-1.42 1.42L8 9.4l-4.04 4.05a1 1 0 0 1-1.42-1.42L6.6 8 2.54 3.96a1 1 0 0 1 0-1.42Z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div className="seprator">
          <span></span>
        </div>

        <div className="walletsContainer">
          {connectWalletStatus == null && (
            <>
              {artemisWalletAdapter.wallets.map((wallet) => {
                return (
                  <div
                    key={wallet.id}
                    onClick={() => {
                      handleConnect(wallet);
                    }}
                    className={`wallet ${wallet.adapter?.readyState == 'NotDetected' && 'NotDetected'}`}
                  >
                    <img src={wallet.icon} className="walletIcon" alt="" />
                    <div className="walletDetails">
                      <h4 className="walletName">{wallet.name}</h4>
                      <p className="walletStatus">
                        {wallet.adapter?.readyState == 'NotDetected' ? 'Click here to install' : wallet.adapter?.readyState}
                      </p>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {connectWalletStatus == 'Loading' && (
            <div className="loadingContainer">
              <img className="loading" src="/Loading.svg" />
              <h3>Conitinue in {selectedWalletDetails.name}</h3>
              <p>Accept connection request in the wallet</p>
              <button onClick={handleTryAgain}>
                <svg fill="none" viewBox="0 0 14 16">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M3.94 1.04a1 1 0 0 1 .7 1.23l-.48 1.68a5.85 5.85 0 0 1 8.53 4.32 5.86 5.86 0 0 1-11.4 2.56 1 1 0 0 1 1.9-.57 3.86 3.86 0 1 0 1.83-4.5l1.87.53a1 1 0 0 1-.55 1.92l-4.1-1.15a1 1 0 0 1-.69-1.23l1.16-4.1a1 1 0 0 1 1.23-.7Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Try again
              </button>
            </div>
          )}

          {connectWalletStatus == 'Failed' && (
            <div className="failedContainer">
              <img className="failed" src="/Failed.svg" />
              <h3>Connection Failed</h3>
              <p>This might be cuased by previous open connectiosn, Please try again.</p>
              <button onClick={handleTryAgain}>
                <svg fill="none" viewBox="0 0 14 16">
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M3.94 1.04a1 1 0 0 1 .7 1.23l-.48 1.68a5.85 5.85 0 0 1 8.53 4.32 5.86 5.86 0 0 1-11.4 2.56 1 1 0 0 1 1.9-.57 3.86 3.86 0 1 0 1.83-4.5l1.87.53a1 1 0 0 1-.55 1.92l-4.1-1.15a1 1 0 0 1-.69-1.23l1.16-4.1a1 1 0 0 1 1.23-.7Z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default WalletConnectM;

