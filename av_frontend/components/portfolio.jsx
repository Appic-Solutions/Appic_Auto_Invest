"use client";
import { getNetworkById, netWorkConfig } from "@/config/network";
import { formatAddress } from "@/helper/helperFunc";
import darkModeClassnamegenerator from "@/utils/darkClassGenerator";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useRouter } from "next/navigation";
import WalletNotConnected from "./walletNotConnectd";
import { formatDecimalValue, formatSignificantNumber } from "@/helper/numberFormatter";
// import { useWeb3Modal } from "@web3modal/wagmi/react";
import { setAllAssets, setAssets, startLoading, stopLoading } from "@/redux/features/walletSlice";
// import axios from "axios";
import BigNumber from "bignumber.js";
// import { useConnect } from "@particle-network/auth-core-modal";
// import { fetchUserAssets } from "@/helper/fetchUserAssets";
// import { fetchAllSupportedTokens } from "@/helper/fetchAllSupportedCoins";
import React, { PureComponent } from "react";

function Portfolio() {
  // const { open, close } = useWeb3Modal();
  const router = useRouter();
  // const { connect, disconnect, connectionStatus } = useConnect();
  // // use for evm chains
  // //handling the disconnect button
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.log(error);
    }
  };

  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  const data = [
    {
      name: "Ethereum",
      tokens: [
        { coinName: "XYZ", coin_value: 20 },
        { coinName: "PRE", coin_value: 10 },
        { coinName: "STV", coin_value: 25 },
      ],
    },
    {
      name: "Polygon",
      tokens: [
        { coinName: "MATIC", coin_value: 30 },
        { coinName: "UNI", coin_value: 5 },
      ],
    },
    {
      name: "BSC",
      tokens: [
        { coinName: "CAKE", coin_value: 15 },
        { coinName: "SAFEMOON", coin_value: 35 },
        { coinName: "BURGER", coin_value: 20 },
      ],
    },

    // {
    //   name: 'Optimism',
    //   tokens: [
    //     { coinName: 'OP1', coin_value: 50 },
    //     { coinName: 'OP2', coin_value: 25 },
    //     { coinName: 'OP3', coin_value: 30 }
    //   ]
    // },
    {
      name: "Arbitrum",
      tokens: [
        { coinName: "ARB1", coin_value: 22 },
        { coinName: "ARB2", coin_value: 44 },
      ],
    },
    {
      name: "Avax",
      tokens: [
        { coinName: "AVAX", coin_value: 40 },
        { coinName: "PEFI", coin_value: 10 },
      ],
    },
    {
      name: "Fantom",
      tokens: [
        { coinName: "FTM", coin_value: 60 },
        { coinName: "SPECTRE", coin_value: 10 },
        { coinName: "TOMB", coin_value: 5 },
      ],
    },
  ];
  const lightColorsPalette = [
    "#22092C",
    "#872341",
    "#BE3144",
    "#F05941", // Original colors
    "#A1D2CE",
    "#809BCE",
    "#95B8D1",
    "#B8E0D2", // Dummy light theme colors
    "#E8DDB5",
    "#FAE0E4",
  ];
  // const lightColorsPalette = ['#22092C', '#872341', '#BE3144', '#F05941'];
  const darkColorsPalette = [
    "#F24C3D",
    "#940B92",
    "#8E8FFA",
    "#FDEBED", // Original colors
    "#4D5061",
    "#5C80BC",
    "#112D4E",
    "#3F72AF", // Dummy dark theme colors
    "#DBE2EF",
    "#F9F7F7",
  ];

  const tokens = useSelector((state) => state.wallet.items.assets?.user_wallet_coins);
  const totalbalance = useSelector((state) => state.wallet.items.assets?.total_assets_balanceOnAllChains);
  const totalNativeBalance =
    useSelector(
      (state) => state.wallet.items.assets?.user_wallet_coins.find((token) => token.coin_address == "0x0000000000000000000000000000000000000000") || 0
    ) || 0;
  const walletAddress = useSelector((state) => state.wallet.items.walletAddress);
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const chainId = useSelector((state) => state.wallet?.items?.chainId);
  const allAssets = useSelector((state) => state.wallet?.items?.allAssets);
  const isDark = useSelector((state) => state.theme.isDark);

  const colorPalette = isDark == true ? darkColorsPalette : lightColorsPalette;
  const dispatch = useDispatch();

  // const refreshUserAssets = async () => {
  //   fetchUserAssets(walletAddress, chainId, dispatch);
  //   fetchAllSupportedTokens(dispatch);
  // };

  // const renderBars = (data, isDark) => {
  //   // Use light or dark color palette based on the theme
  //   const colorPalette = isDark == true ? darkColorsPalette : lightColorsPalette;

  //   // ... rest of the renderBars logic as before

  //   return data.map((chainData, index) => {
  //     return chainData.tokens.map((token, tokenIndex) => {
  //       // Use a modulo operator to cycle through colors if there are more tokens than colors
  //       const fillColor = colorPalette[tokenIndex % colorPalette.length];

  //       return <Bar key={`${chainData.name}`} dataKey={`tokens[${index}].coin_value`} stackId={tokenIndex} fill={fillColor} name={token.coinName} />;
  //     });
  //   });
  // };

  return (
    <div className={darkModeClassnamegenerator("portfolio")}>
      {isWalletConnected ? (
        <div className="portfolio__box">
          <img src="/assets/images/refreshButton.svg"
          //  onClick={refreshUserAssets}
            className="refreshButton" alt="" />
          <div className={`collapseContainer ${isExpanded ? "hideItem" : ""} `} onClick={() => setIsExpanded(!isExpanded)}>
            <div className="addressActions">
              <div className="avatarImage"></div>
              <div className="addressContainer">
                <h1 className="address">{formatAddress(walletAddress)}</h1>
                <div className="copyAddress">
                  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbUlEQVR4nGNgGDagxXa+d7Ptwictdgv/k4MZCFuw4DG5hrcQZQGxCskFdLeghdw4sQUF9QJPIiygKE4eEbaAzCBrwaVv1AIYGA0igmA0iAgCmpeuLYPHAlsqF3boAFTkkmnJo2b7+R4YBg5ZAADgA5UsbuklBAAAAABJRU5ErkJggg==" />
                </div>
              </div>
            </div>
            <div>
              <div className="description">
                <p>Balance (All chains)</p>
              </div>
              <div className="balance">
                <span>$</span>
                <h1>{formatSignificantNumber(totalbalance)}</h1>
              </div>
            </div>
            <div>
              <div className="description">
                <p>Balance ({getNetworkById(chainId)?.networkName})</p>
                <img className="chainIMG" src={getNetworkById(chainId)?.networkLogo} alt="" />
              </div>
              <div className="balance">
                <span>$</span>
                <h1>{formatSignificantNumber(allAssets.find((chain) => chain.chainId == chainId)?.total_value)}</h1>
              </div>
            </div>

            <div>
              <div className="description">
                <abbr
                  title="If you dont have native token, you wont be able to make transactions"
                  about="If you dont have native token, you wont be able to make transactions"
                >
                  <p>Native Tokens</p>
                </abbr>
                <img className="chainIMG" src={getNetworkById(chainId).networkLogo} alt="" />
              </div>

              <div className="balance">
                <h1>
                  {formatSignificantNumber(totalNativeBalance?.coin_quantity)} {totalNativeBalance?.coin_symbol}
                </h1>
              </div>
            </div>
            <img src="/assets/images/angle-right-icon.svg" alt="" />
          </div>
          <div className={`upperContainer ${isExpanded ? "" : "hideItem"}     `}>
            {/* first part */}
            <div className="walletActions">
              <div className="addressActions">
                <div className="avatarImage"></div>
                <div className="addressContainer">
                  <h1 className="address" >
                    {formatAddress(walletAddress)}
                  </h1>
                  <div className="copyAddress">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbUlEQVR4nGNgGDagxXa+d7Ptwictdgv/k4MZCFuw4DG5hrcQZQGxCskFdLeghdw4sQUF9QJPIiygKE4eEbaAzCBrwaVv1AIYGA0igmA0iAgCmpeuLYPHAlsqF3boAFTkkmnJo2b7+R4YBg5ZAADgA5UsbuklBAAAAABJRU5ErkJggg==" />
                  </div>
                </div>
              </div>

              <div className="actions">
                <div className="action">
                  <div className="imgContainer">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                      <path d="M403.8 34.4c12-5 25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V160H352c-10.1 0-19.6 4.7-25.6 12.8L284 229.3 244 176l31.2-41.6C293.3 110.2 321.8 96 352 96h32V64c0-12.9 7.8-24.6 19.8-29.6zM164 282.7L204 336l-31.2 41.6C154.7 401.8 126.2 416 96 416H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96c10.1 0 19.6-4.7 25.6-12.8L164 282.7zm274.6 188c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V416H352c-30.2 0-58.7-14.2-76.8-38.4L121.6 172.8c-6-8.1-15.5-12.8-25.6-12.8H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96c30.2 0 58.7 14.2 76.8 38.4L326.4 339.2c6 8.1 15.5 12.8 25.6 12.8h32V320c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64z" />
                    </svg>
                  </div>
                  <p>Swap</p>
                </div>
                <div className="action" onClick={() => router.push("/nuke-button")}>
                  <div className="imgContainer">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                      <path d="M32 96l320 0V32c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V160L32 160c-17.7 0-32-14.3-32-32s14.3-32 32-32zM480 352c17.7 0 32 14.3 32 32s-14.3 32-32 32H160v64c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-96-96c-6-6-9.4-14.1-9.4-22.6s3.4-16.6 9.4-22.6l96-96c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 64H480z" />
                    </svg>
                  </div>

                  <p>Nuke</p>
                </div>
                <div
                  className="action"
                >
                  <div className="imgContainer">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                      <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                    </svg>
                  </div>
                  <p>Buy/Sell</p>
                </div>
                <div className="action" >
                  <div className="imgContainer">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                      <path d="M304.083 405.907c4.686 4.686 4.686 12.284 0 16.971l-44.674 44.674c-59.263 59.262-155.693 59.266-214.961 0-59.264-59.265-59.264-155.696 0-214.96l44.675-44.675c4.686-4.686 12.284-4.686 16.971 0l39.598 39.598c4.686 4.686 4.686 12.284 0 16.971l-44.675 44.674c-28.072 28.073-28.072 73.75 0 101.823 28.072 28.072 73.75 28.073 101.824 0l44.674-44.674c4.686-4.686 12.284-4.686 16.971 0l39.597 39.598zm-56.568-260.216c4.686 4.686 12.284 4.686 16.971 0l44.674-44.674c28.072-28.075 73.75-28.073 101.824 0 28.072 28.073 28.072 73.75 0 101.823l-44.675 44.674c-4.686 4.686-4.686 12.284 0 16.971l39.598 39.598c4.686 4.686 12.284 4.686 16.971 0l44.675-44.675c59.265-59.265 59.265-155.695 0-214.96-59.266-59.264-155.695-59.264-214.961 0l-44.674 44.674c-4.686 4.686-4.686 12.284 0 16.971l39.597 39.598zm234.828 359.28l22.627-22.627c9.373-9.373 9.373-24.569 0-33.941L63.598 7.029c-9.373-9.373-24.569-9.373-33.941 0L7.029 29.657c-9.373 9.373-9.373 24.569 0 33.941l441.373 441.373c9.373 9.372 24.569 9.372 33.941 0z" />
                    </svg>
                  </div>
                  <p>Disconnect</p>
                </div>
                {/* <button className='action'>
                        Transfer
                    </button>
                    <button className='action'>
                        Edit Portfolio
                    </button> */}
              </div>
            </div>

            {/* second part */}
            <div className="portfolio__totalBalance">
              <div className="totalbalance__container">
                <div>
                  <div className="description">
                    <p>Balance (All chains)</p>
                  </div>
                  <div className="balance">
                    <span>$</span>
                    <h1>{formatSignificantNumber(totalbalance)}</h1>
                  </div>
                </div>
                <div>
                  <div className="description">
                    <p>Balance ({getNetworkById(chainId)?.networkName})</p>
                    <img className="chainIMG" src={getNetworkById(chainId)?.networkLogo} alt="" />
                  </div>
                  <div className="balance">
                    <span>$</span>
                    <h1>{formatSignificantNumber(allAssets.find((chain) => chain.chainId == chainId)?.total_value)}</h1>
                  </div>
                </div>
                <div>
                  <div className="description">
                    <abbr
                      title="If you dont have native token, you wont be able to make transactions"
                      about="If you dont have native token, you wont be able to make transactions"
                    >
                      <p>Native Tokens</p>
                    </abbr>
                    <img className="chainIMG" src={getNetworkById(chainId).networkLogo} alt="" />
                  </div>

                  <div className="balance">
                    <h1>
                      {formatSignificantNumber(totalNativeBalance?.coin_quantity)} {totalNativeBalance?.coin_symbol}
                    </h1>
                  </div>
                </div>
              </div>

              {/* <PieChart width={window.innerWidth >= 1024 ? 380 : window.innerWidth * 0.85} height={window.innerWidth >= 1024 ? 200 : window.innerWidth / 2}>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}

                                    // shapeRendering={renderActiveShape}
                                    data={tokens}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={window.innerWidth >= 1024 ? 50 : window.innerWidth / 10}
                                    outerRadius={window.innerWidth >= 1024 ? 70 : window.innerWidth / 10 + 10}
                                    dataKey="coin_value"
                                    paddingAngle={2}
                                    onMouseEnter={onPieEnter}
                                    stroke='none'
                                >
                                    {tokens?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={isDark ? darkColorsPalette[index % darkColorsPalette.length] : lightColorsPalette[index % lightColorsPalette.length]} />
                                    ))}
                                </Pie>
                            </PieChart> */}
              <div className="chart_container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    width={500}
                    height={300}
                    data={tokens}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="coin_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="coin_value" stackId="a" fill={isDark == true ? "#fff" : "#000"}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorPalette[index % 20]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={`chains ${isExpanded ? "" : "hideItem"}`}>
            {allAssets.length == 0 && <img className="loadingChains" src="/assets/images/loader.svg" />}
            {allAssets.length != 0 && (
              <>
                {netWorkConfig?.map((network, index) => {
                  return (
                    <div
                      key={network.networkId}
                      onClick={() => {
                      
                      }}
                      className={`chain ${network.networkId == chainId ? "active" : ""}`}
                    >
                      <div className="imageContainer">
                        <img src={network.networkLogo} alt="" />
                      </div>
                      <div className="info">
                        <h1>{network.networkName}</h1>
                      </div>
                      <div className="seprator"></div>
                      <p>{formatSignificantNumber(allAssets.find((chain) => chain.chainId == network.networkId).total_value)} $</p>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <div className={`collapseCard ${isExpanded ? "" : "hideItem"}`} onClick={() => setIsExpanded(!isExpanded)}>
            <span>Click here to collapse portfolio card</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-chevron-down"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      ) : (
        <WalletNotConnected />
      )}
    </div>
  );
}

export default Portfolio;
