"use client";

import darkModeClassnamegenerator from "@/utils/darkClassGenerator";
import Title from "./higerOrderComponents/titlesAndHeaders";
import AlphaButton from './higerOrderComponents/button';
import WalletNotConnected from "./walletNotConnectd"
import { useSelector } from "react-redux";
import { usePathname, useRouter } from 'next/navigation'
import { formatSignificantNumber, formatDecimalValue } from "@/helper/numberFormatter";
import { useEffect, useState } from "react";
// import { useWeb3Modal } from "@web3modal/wagmi/react";
// import { useConnectModal } from "@particle-network/connect-react-ui";
import LoadingComponent from "./higerOrderComponents/loadingComponent"
import { netWorkConfig } from "@/config/network";
import { findNetworkConfig } from "@/helper/helperFunc";
function WalletTokens({ setEditMode }) {
  const [isClient, setIsClient] = useState(false)
  const [showLowValueAssets, setShowLowValueAssets] = useState(false);
  useEffect(() => {
    setIsClient(true)
  }, [])
  // const { open, close } = useWeb3Modal()
  // const {openConnectModal} = useConnectModal()

  const assets = useSelector((state) => state.wallet.items.assets)
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const loader = useSelector((state) => state.wallet.items.loader);
  const router = useRouter();
  const chainId = useSelector((state) => state.wallet?.items?.chainId);
  const lowValueAssets = assets?.user_wallet_coins.filter(coin => coin?.coin_value < 1) || [];
  const highValueAssets = assets?.user_wallet_coins.filter(coin => coin?.coin_value >= 1) || [];



  return (


    <div className={darkModeClassnamegenerator("walletTokens")} >




      {isClient &&
        <Title title={`Tokens on ${findNetworkConfig(chainId).networkName}`}>
          {isWalletConnected && <div className="wallet__totlaBalance">
            {/* <p className="balance__title">Balance on {findNetworkConfig(chainId).networkName}:</p> */}
            {/* <p className="balance__dolarAmount">∼${formatSignificantNumber(assets?.total_wallet_balance)}</p> */}
          </div>}

        </Title>}



      {/* assets card */}

      {isClient && <>
        {!isWalletConnected && <WalletNotConnected></WalletNotConnected>}
        {isWalletConnected &&
          <div className="wallet__tokens">
            {loader && <LoadingComponent></LoadingComponent>}
            {!loader && <>
              <div className="header">
                <h3 className="header__title">Token</h3>
                <h3 className="header__title">Amount</h3>
                <h3 className="header__title hiddenForMobile">24h %</h3>
                <h3 className="header__title hiddenForMobile">Price</h3>
                <h3 className="header__title">Value</h3>
                <h3 className="header__title hiddenForMobile">%</h3>
              </div>
              {/* High-Value Assets */}
              {assets?.user_wallet_coins?.map(coin => {
                return (
                 coin?.coin_value >= 1 &&
                 <div key={coin?.coin_address} className="token">
                 <div className="token__info">
                   <img
                     src={coin.coin_Logo}
                     className="logo"
                     alt={coin.coin_name}
                   />
                   <div className="nameAndPrice">
                     <h4>{coin.coin_name}</h4>
                     <p className="hideForDesktop">${formatSignificantNumber(coin.coin_price)}</p>
                   </div>
                 </div>

                 <div className="token__amount">
                   <h3>{formatSignificantNumber(coin.coin_quantity)}</h3>
                   <p>{coin.coin_symbol}</p>
                 </div>

                 <div className={`token__24change ${coin.percent_change_24h > 0 ? "up" : "down"}`}>
                   <h3>{formatSignificantNumber(coin.percent_change_24h)}</h3>
                 </div>


                 <div className="token__price">
                   <h3>${formatDecimalValue(coin.coin_price,2)}</h3>
                 </div>

                 <div className="token__value">
                   <h3>${formatDecimalValue(coin.coin_value, 2)}</h3>
                
                 </div>
                 <div className="token__perc">
                   <h3>{coin?.coin_perc == 0 ?  coin?.coin_perc : `${formatDecimalValue(coin?.coin_perc,0)}%`}</h3>
                 </div>


               </div>

                )
              })
              }
                {/* Collapsible Button for Low-Value Assets */}
             
                <div className="lowValueAssets__header">
                  <h3 className="header__title">Low Value Assets</h3>
                  <div className="lowValueAssets__button">
                    <button
                      onClick={() => setShowLowValueAssets(!showLowValueAssets)}
                      className="lowValueAssets__button"
                      text={showLowValueAssets ? "Hide" : "Show"}
                    >
                        <img src= {showLowValueAssets ? "/assets/images/angle-bottom-icon.svg" : "/assets/images/angle-right-icon.svg"} alt="" />
                    </button>
                  </div>
                </div>
                 { showLowValueAssets && assets?.user_wallet_coins?.map(coin => {
                  return (
                   coin?.coin_value < 1 &&
                   <div key={coin?.coin_address} className="token">
                   <div className="token__info">
                     <img
                       src={coin.coin_Logo}
                       className="logo"
                       alt={coin.coin_name}
                     />
                     <div className="nameAndPrice">
                       <h4>{coin.coin_name}</h4>
                       <p className="hideForDesktop">${formatSignificantNumber(coin.coin_price)}</p>
                     </div>
                   </div>
  
                   <div className="token__amount">
                     <h3>{formatSignificantNumber(coin.coin_quantity)}</h3>
                     <p>{coin.coin_symbol}</p>
                   </div>
  
                   <div className={`token__24change ${coin.percent_change_24h > 0 ? "up" : "down"}`}>
                     <h3>{formatSignificantNumber(coin.percent_change_24h)}</h3>
                   </div>
  
  
                   <div className="token__price">
                     <h3>${formatDecimalValue(coin.coin_price,2)}</h3>
                   </div>
  
                   <div className="token__value">
                     <h3>${formatDecimalValue(coin.coin_value, 2)}</h3>
                  
                   </div>
                   <div className="token__perc">
                     <h3>{coin?.coin_perc == 0 ?  "--" : `${formatDecimalValue(coin?.coin_perc,0)}%`}</h3>
                   </div>
  
  
                 </div>
  
                  )
                })
                }
             
            </>}

          </div>

        }
      </>}





    </div>


  );
}

export default WalletTokens;
