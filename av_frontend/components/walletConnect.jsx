"use client";
import darkModeClassnamegenerator from "@/utils/darkClassGenerator";
import { useEffect, useState } from "react";
// import { useAccount } from "wagmi";
// import { useAccount, useAccountInfo, useParticleProvider ,useConnectKit} from '@particle-network/connect-react-ui';
// import Web3 from "web3";
import { useDispatch, useSelector } from "react-redux";
import { initWallet, resetWallet, changeChainId, setAssets, startLoading, stopLoading, setAllAssets } from "@/redux/features/walletSlice";
import { findNetworkConfig, findWalletConfig, formatAddress } from "@/helper/helperFunc";
// import axios from "axios";
// import { ethers } from "ethers";
import BigNumber from "bignumber.js";
// import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { netWorkConfig } from "@/config/network";
// import {fetchUserAssets} from "@/helper/fetchUserAssets";
// import { fetchAllSupportedTokens } from "@/helper/fetchAllSupportedCoins";

function WalletConnectM() {
  const dispatch = useDispatch();
  // const { open, close } = useWeb3Modal();
  // const { selectedNetworkId } = useWeb3ModalState();
  // const provider = useParticleProvider();
  // const connectKit = useConnectKit();
  // const {account,connectId,particleProvider,accountLoading,setAccountLoading} = useAccountInfo();
  // const { isConnected, isConnecting, status, connector, address } = useAccount();
  const [showAddressModal, setShowAddressModal] = useState(false);

  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const walletAddress = useSelector((state) => state.wallet.items.walletAddress);
  const chainId = useSelector((state) => state.wallet?.items?.chainId);
  const walletName = useSelector((state) => state.wallet.items.walletName);
  const allAssets = useSelector((state) => state.wallet.items.allAssets);
  const assets = useSelector((state) => state.wallet.items.assets);

  // use effect for getting wallet data after refresh
  // useEffect(() => {
  //   const configExistingWallet = async () => {
  //     if (isConnected == true && status == "connected" && selectedNetworkId != undefined && allAssets.length == 0) {
  //       configWallet(connector?.name.toLocaleLowerCase(), address, selectedNetworkId);
  //       await fetchUserAssets(address, selectedNetworkId,dispatch,setAssets,setAllAssets);
  //       await fetchAllSupportedTokens(dispatch);
  //     } else if (status == "disconnected") {
  //       dispatch(resetWallet());
  //     }
  //   };

  //   configExistingWallet();

  //   return () => { };
  // }, [isConnected, status, selectedNetworkId]);


  // useEffect(() => {
  //   if (allAssets.length != 0) {
  //     const newAssets = {...assets}
  //     dispatch(changeChainId(selectedNetworkId));
  //     const selectedChainTokensAndData=allAssets.find((chain) => chain.chainId == selectedNetworkId);
  //     newAssets.user_wallet_coins = selectedChainTokensAndData?.user_wallet_coins;
  //     newAssets.total_wallet_balance =selectedChainTokensAndData?.total_value;
  //     dispatch(setAssets(newAssets))
  //   } else {
  //       fetchUserAssets(walletAddress,selectedNetworkId,dispatch)
  //   }
  // }, [selectedNetworkId]);

  //fetching user assets when the wallet is connected

  // const fetchUserAssets = async (walletAddress, chainId) => {
  //   console.log("het")
  //   try {
  //     dispatch(startLoading());
  //     const userAssets = await axios.post(`https://backend.alphavault.io/api/wallet/tokens`, { walletAddress });
  //     let assets = userAssets.data.data;

  //     //finding tokens for selected chain
  //     const selectedChainTokens = assets.user_wallet_coins?.filter(token => Number(token.coin_chainId) == chainId) || [];
  //     console.log(selectedChainTokens)
  //     let total_wallet_balanceOnSelectedChain=0;

  //      //calculating total value for each chain
  //      selectedChainTokens.forEach(token => {
  //       total_wallet_balanceOnSelectedChain += token.coin_value
  //     })

      
  //     //calculating coin perc for selected chain
  //     if (selectedChainTokens.length > 0) {
  //       selectedChainTokens.forEach((coin) => {
  //         coin.coin_perc = new BigNumber(coin.coin_value).multipliedBy(100).dividedBy(total_wallet_balanceOnSelectedChain).toNumber();
  //       });
  //     }
  //     //setting the sorted version
  //     dispatch(
  //       setAssets({
  //         ...assets,
  //         user_wallet_coins: selectedChainTokens,
  //         total_wallet_balance:total_wallet_balanceOnSelectedChain,
  //         total_assets_balanceOnAllChains:assets.total_wallet_balance
  //       })
  //     );
  //     dispatch(stopLoading());

  //     // after fetching selected chain's data other chains data will be fetched


  //     const allAssets = [];

  //     netWorkConfig.forEach(network => {
  //       const assetsFormat = {
  //         total_value: 0,
  //         user_wallet_coins: [],
  //         chainId: network.networkId
  //       }
  //       assetsFormat.user_wallet_coins = assets.user_wallet_coins?.filter(token => Number(token.coin_chainId) == network.networkId);


  //       //calculating total value for each chain
  //       assetsFormat.user_wallet_coins.forEach(token => {
  //         assetsFormat.total_value += token.coin_value
  //       })

  //       //setting coin percentage for each chain 
  //       if (assetsFormat.user_wallet_coins.length > 0) {
  //         assetsFormat.user_wallet_coins.forEach((token,index) => {
  //           assetsFormat.user_wallet_coins[index] = {...token,coin_perc: new BigNumber(token.coin_value).multipliedBy(100).dividedBy(assetsFormat?.total_value).toNumber()}
  //         });
  //       }

  //       allAssets.push(assetsFormat);

  //     })

  //     console.log(allAssets)

  //     dispatch(setAllAssets(allAssets));
  //   } catch (e) { }
  // };





  
  //config Wallet
  // const configWallet = (walletType, walletAddress, chainId) => {
  //   let provider = new ethers.providers.Web3Provider(window.ethereum);
  //   let initWalletObj = {
  //     walletAddress: walletAddress,
  //     walletName: walletType,
  //     isWalletConnected: true,
  //     isPolicyAccepted: true,
  //     assets: null,
  //     web3Instance: provider,
  //   };
  //   dispatch(changeChainId(chainId));
  //   dispatch(initWallet(initWalletObj));
  // };

  return (
    <>
      {/* buttons group for wallet details */}
      <div className={darkModeClassnamegenerator("walletConnectM")}>
        {isWalletConnected && (
          <>
            {/* <h3>Connected Wallet</h3> */}

            <div className="buttons">
              <div
                onClick={() => {
                  // open({ view: "Networks" });
                }}
                className="chain">
                <img src={findNetworkConfig(chainId)?.networkLogo} alt="" />
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none">
                  <path
                    d="M0.194928 0.42579L0.494928 0.12579C0.53424 0.0862427 0.580983 0.054858 0.632469 0.0334416C0.683955 0.0120253 0.739166 0.001 0.794929 0.001C0.850691 0.001 0.905902 0.0120253 0.957388 0.0334416C1.00887 0.054858 1.05562 0.0862427 1.09493 0.12579L5.66493 4.70179L10.2369 0.12479C10.2762 0.0852427 10.323 0.053858 10.3745 0.0324416C10.426 0.0110253 10.4812 0 10.5369 0C10.5927 0 10.6479 0.0110253 10.6994 0.0324416C10.7509 0.053858 10.7976 0.0852427 10.8369 0.12479L11.1369 0.42479C11.1765 0.464102 11.2079 0.510845 11.2293 0.562331C11.2507 0.613816 11.2617 0.669028 11.2617 0.72479C11.2617 0.780553 11.2507 0.835765 11.2293 0.88725C11.2079 0.938736 11.1765 0.985479 11.1369 1.02479L5.96293 6.19379C5.92362 6.23334 5.87687 6.26472 5.82539 6.28614C5.7739 6.30756 5.71869 6.31858 5.66293 6.31858C5.60717 6.31858 5.55195 6.30756 5.50047 6.28614C5.44898 6.26472 5.40224 6.23334 5.36293 6.19379L5.06293 5.89379L5.05693 5.88379L0.194928 1.02179C0.15538 0.982479 0.123997 0.935736 0.10258 0.88425C0.0811634 0.832765 0.070138 0.777553 0.070138 0.72179C0.070138 0.666028 0.0811634 0.610816 0.10258 0.559331C0.123997 0.507845 0.15538 0.461102 0.194928 0.42179V0.42579Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div
                onClick={() => {
                  // open({ view: "Account" });
                }}
                className="address">
                {formatAddress(walletAddress)}
              </div>
              <div
                onClick={() => {
                  // open({ view: "All wallets" });
                }}
                className="wallet">
                <img src={findWalletConfig(walletName)?.walletLogo} alt="" />
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="7" viewBox="0 0 12 7" fill="none">
                  <path
                    d="M0.194928 0.42579L0.494928 0.12579C0.53424 0.0862427 0.580983 0.054858 0.632469 0.0334416C0.683955 0.0120253 0.739166 0.001 0.794929 0.001C0.850691 0.001 0.905902 0.0120253 0.957388 0.0334416C1.00887 0.054858 1.05562 0.0862427 1.09493 0.12579L5.66493 4.70179L10.2369 0.12479C10.2762 0.0852427 10.323 0.053858 10.3745 0.0324416C10.426 0.0110253 10.4812 0 10.5369 0C10.5927 0 10.6479 0.0110253 10.6994 0.0324416C10.7509 0.053858 10.7976 0.0852427 10.8369 0.12479L11.1369 0.42479C11.1765 0.464102 11.2079 0.510845 11.2293 0.562331C11.2507 0.613816 11.2617 0.669028 11.2617 0.72479C11.2617 0.780553 11.2507 0.835765 11.2293 0.88725C11.2079 0.938736 11.1765 0.985479 11.1369 1.02479L5.96293 6.19379C5.92362 6.23334 5.87687 6.26472 5.82539 6.28614C5.7739 6.30756 5.71869 6.31858 5.66293 6.31858C5.60717 6.31858 5.55195 6.30756 5.50047 6.28614C5.44898 6.26472 5.40224 6.23334 5.36293 6.19379L5.06293 5.89379L5.05693 5.88379L0.194928 1.02179C0.15538 0.982479 0.123997 0.935736 0.10258 0.88425C0.0811634 0.832765 0.070138 0.777553 0.070138 0.72179C0.070138 0.666028 0.0811634 0.610816 0.10258 0.559331C0.123997 0.507845 0.15538 0.461102 0.194928 0.42179V0.42579Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>

      {/* removed all the modals because there is no need to them anymore new wallet connect vfeture has been added  */}
    </>
  );
}

export default WalletConnectM;
