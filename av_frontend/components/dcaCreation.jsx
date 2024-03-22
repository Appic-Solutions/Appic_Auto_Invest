"use client";

import darkModeClassnamegenerator, { darkClassGenerator } from "@/utils/darkClassGenerator";
import React, { useState, useEffect } from "react";
import CenteredMainTitle from "./higerOrderComponents/centeredMainTitle";
import AlphaButton from "./higerOrderComponents/button";
import { useSelector, useDispatch } from "react-redux";
import CombinedModal from "./higerOrderComponents/combinedModals";
import { findNetworkConfig } from "@/helper/helperFunc";
import BigNumber from "bignumber.js";
import { findNearestDay, formatDecimalValue, formatSignificantNumber, getCurrentDate, getTwentyMinAheadTime, validateInput } from "@/helper/numberFormatter";
import Link from "next/link";
import { formatHugeNumbers } from "@/helper/numberFormatter";
import WalletNotConnected from "./walletNotConnectd";
import { changePageTitle } from "@/redux/features/pageData";
import { getNetworkById } from "@/config/network";
import DesktopFinalModal from "./higerOrderComponents/desktopFinalModal";
import searchByNameAndSymbol from "@/helper/serchByNameAndSymbol";

// import TemplateModal from "./higerOrderComponents/templateModal";
// import { templateTokenList } from "@/utils/templateTokens/tokensData";
// import { bucketToken } from "@/utils/templateTokens/bucketData";
export default function DcaCreation({ isExpanded, toggleScreen }) {
  const dispatch = useDispatch();
  const [dcaTimeFrame, setDcaTimeFrame] = useState('Monthly');  // Daily, Monthly , Weekly
  const [showOptions, setShowOptions] = useState(false); 
  const [selectedDay, setSelectedDay] = useState("Sunday"); // Default selected day is Sunday
  const [Hours, setHours] = useState(new Date().getHours());
  const [Minutes, setMinutes] = useState(new Date().getMinutes());
  const [creationStatus, setCreationStatus] = useState("reviewDca"); //configDca , reviewDca
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [sum, setSum] = useState(0);
  // store all input data into a state and then use it to create a dca
  const [dcaData, setDcaData] = useState({
    sellToken: {
      symbol: "",
      address: "",
      coinDecimals: 18,
      url: "",
      quantity: 0,
    },
    buyToken: [],
    sellAmount: "",
    tradeEvery: "day",
    monthDay: "", //for daily dca {MON:1,TUE:2,WED:3,THU:4,FRI:5,SAT:6,SUN:7
    noOfTrades: "",
    dcaSchedule: "01-10-2023",
    startDate: new Date(),
    startTime: Date.now(),
  });
  const [showAddTokenModal, setShowAddTokenModal] = useState(false);
  const [coinList, setCoinList] = useState([]);
  const [chainLogo, setChainLogo] = useState("");
  const [filteredCoinList, setFilteredCoinList] = useState([]);
  const [coinsLoader, setCoinsLoader] = useState(false);
  const [type, setType] = useState("buy"); //buy or sell
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionsStatus, setactionsStatus] = useState("review"); // review, transactionsModal ,tokensModal

  const [transactionProgressModal, setTransactionProgressModal] = useState(false);
  const [transactionProgress, setTransactionProgress] = useState("inProgress"); //inProgress , successful , failed
  const Web3Instance = useSelector((state) => state.wallet.items.Web3Instance);
  const chainId = useSelector((state) => state.wallet.items.chainId);
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const walletAddress = useSelector((state) => state.wallet.items.walletAddress);
  const assets = useSelector((state) => state.wallet.items.assets);
  const isDark = useSelector((state) => state.theme.isDark);
  const allSupportedCoins = useSelector((state) => state.coins.coins);

  const [filteredTokens, setfilteredTokens] = useState(coinList);
  const [sortedconfig, setsortedConfig] = useState({ sortBy: "volume", sortOrder: 0 });
  // Filter tokens based on the search query for both name and symbol
  const updateFilteredTokens = (query) => {
    setfilteredTokens(searchByNameAndSymbol(coinList, query));
  };

  //sort tokens based on speceific criterion
  function sortTokens(sortBy, sortOrder) {
    console.log(sortBy);
    let sortedTokens = [...filteredTokens];
    if (sortBy === "name") {
      sortedTokens = sortedTokens.sort((a, b) =>
        sortedconfig.sortOrder === 0 ? a.coinName.localeCompare(b.coinName) : b.coinName.localeCompare(a.coinName)
      );
    } else if (sortBy === "volume") {
      sortedTokens = sortedTokens.sort((a, b) => (sortedconfig.sortOrder === 0 ? a.volume_change_24h - b.volume_change_24h : b.volume_change_24h - a.volume_change_24h));
    } else if (sortBy === "price") {
      sortedTokens = sortedTokens.sort((a, b) => (sortedconfig.sortOrder === 0 ? a.coinPrice - b.coinPrice : b.coinPrice - a.coinPrice));
    } else if (sortBy === "quantity") {
      sortedTokens = sortedTokens.sort((a, b) =>
        sortedconfig.sortOrder === 0 ? a.coin_quantity - b.coin_quantity : b.coin_quantity - a.coin_quantity
      );
    } else {
      console.log("Invalid sorting criterion. Please choose from 'name', 'volume', or 'price'");
      sortedTokens = sortedTokens;
    }

    console.log(sortedTokens);
    setfilteredTokens(sortedTokens);
  }

  function formatDate(timestamp) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateObject = new Date(timestamp);
    const day = dateObject.getDate();
    const monthIndex = dateObject.getMonth();
    const month = months[monthIndex];
    const year = dateObject.getFullYear();

    const formattedDate = `${day} ${month} ${year}`;
    return formattedDate;
  }

  //call fetch coin list on chain id change
  useEffect(() => {
    dispatch(changePageTitle("Create AutoInvestment"));
    setCoinsLoader(true);

    const fetchCoinList = async () => {
      try {
         let coinList = [...allSupportedCoins.find((coinsGroup) => coinsGroup.chainId == chainId).coins];
        setCoinList(coinList);
        setChainLogo();
        setCoinsLoader(false);
      } catch (error) {
        console.log(error);
        setCoinsLoader(false);
      }
    };
    if (allSupportedCoins.length != 0) {
      fetchCoinList();
    }
    return ()=>{
      setCoinList([]);
    }
  }, [chainId, isWalletConnected, allSupportedCoins]);

  const createPostions = async (_sellToken, _buyToken, _totalSellAmount, _sellAmount, _tradeFrequency, _noOfTrade, _startDate) => {
    setTransactionProgressModal(true);
    setactionsStatus("transactionsModal");
    try {
      let _web3Instance = new ethers.providers.Web3Provider(window.ethereum);
      const signer = _web3Instance.getSigner();
      let chainData = findNetworkConfig(chainId);
      let buyTokenAddress = _buyToken;
      let sellTokenAddress =
        _sellToken?.address == "0x0000000000000000000000000000000000000000"
          ? "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
          : _sellToken?.address?.toLowerCase();
      let tradeFrequency = _tradeFrequency == "Daily" ? 24 * 60 * 60 : _tradeFrequency == "Weekly" ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60;
      let startTime = (_startDate / 1000).toFixed(0);
      let endTime = new BigNumber(_startDate / 1000).plus(new BigNumber(_noOfTrade * tradeFrequency)).toFixed(0);
      // const erc20abi = [
      //   {
      //     constant: true,
      //     inputs: [],
      //     name: "name",
      //     outputs: [
      //       {
      //         name: "",
      //         type: "string",
      //       },
      //     ],
      //     payable: false,
      //     stateMutability: "view",
      //     type: "function",
      //   },
      //   {
      //     constant: false,
      //     inputs: [
      //       {
      //         name: "_spender",
      //         type: "address",
      //       },
      //       {
      //         name: "_value",
      //         type: "uint256",
      //       },
      //     ],
      //     name: "approve",
      //     outputs: [
      //       {
      //         name: "",
      //         type: "bool",
      //       },
      //     ],
      //     payable: false,
      //     stateMutability: "nonpayable",
      //     type: "function",
      //   },
      //   {
      //     constant: true,
      //     inputs: [],
      //     name: "totalSupply",
      //     outputs: [
      //       {
      //         name: "",
      //         type: "uint256",
      //       },
      //     ],
      //     payable: false,
      //     stateMutability: "view",
      //     type: "function",
      //   },
      //   {
      //     constant: false,
      //     inputs: [
      //       {
      //         name: "_from",
      //         type: "address",
      //       },
      //       {
      //         name: "_to",
      //         type: "address",
      //       },
      //       {
      //         name: "_value",
      //         type: "uint256",
      //       },
      //     ],
      //     name: "transferFrom",
      //     outputs: [
      //       {
      //         name: "",
      //         type: "bool",
      //       },
      //     ],
      //     payable: false,
      //     stateMutability: "nonpayable",
      //     type: "function",
      //   },
      //   {
      //     constant: true,
      //     inputs: [],
      //     name: "decimals",
      //     outputs: [
      //       {
      //         name: "",
      //         type: "uint8",
      //       },
      //     ],
      //     payable: false,
      //     stateMutability: "view",
      //     type: "function",
      //   },
      //   {
      //     constant: true,
      //     inputs: [
      //       {
      //         name: "_owner",
      //         type: "address",
      //       },
      //     ],
      //     name: "balanceOf",
      //     outputs: [
      //       {
      //         name: "balance",
      //         type: "uint256",
      //       },
      //     ],
      //     payable: false,
      //     stateMutability: "view",
      //     type: "function",
      //   },
      //   {
      //     constant: true,
      //     inputs: [],
      //     name: "symbol",
      //     outputs: [
      //       {
      //         name: "",
      //         type: "string",
      //       },
      //     ],
      //     payable: false,
      //     stateMutability: "view",
      //     type: "function",
      //   },
      //   {
      //     constant: false,
      //     inputs: [
      //       {
      //         name: "_to",
      //         type: "address",
      //       },
      //       {
      //         name: "_value",
      //         type: "uint256",
      //       },
      //     ],
      //     name: "transfer",
      //     outputs: [
      //       {
      //         name: "",
      //         type: "bool",
      //       },
      //     ],
      //     payable: false,
      //     stateMutability: "nonpayable",
      //     type: "function",
      //   },
      //   {
      //     constant: true,
      //     inputs: [
      //       {
      //         name: "_owner",
      //         type: "address",
      //       },
      //       {
      //         name: "_spender",
      //         type: "address",
      //       },
      //     ],
      //     name: "allowance",
      //     outputs: [
      //       {
      //         name: "",
      //         type: "uint256",
      //       },
      //     ],
      //     payable: false,
      //     stateMutability: "view",
      //     type: "function",
      //   },
      //   {
      //     payable: true,
      //     stateMutability: "payable",
      //     type: "fallback",
      //   },
      //   {
      //     anonymous: false,
      //     inputs: [
      //       {
      //         indexed: true,
      //         name: "owner",
      //         type: "address",
      //       },
      //       {
      //         indexed: true,
      //         name: "spender",
      //         type: "address",
      //       },
      //       {
      //         indexed: false,
      //         name: "value",
      //         type: "uint256",
      //       },
      //     ],
      //     name: "Approval",
      //     type: "event",
      //   },
      //   {
      //     anonymous: false,
      //     inputs: [
      //       {
      //         indexed: true,
      //         name: "from",
      //         type: "address",
      //       },
      //       {
      //         indexed: true,
      //         name: "to",
      //         type: "address",
      //       },
      //       {
      //         indexed: false,
      //         name: "value",
      //         type: "uint256",
      //       },
      //     ],
      //     name: "Transfer",
      //     type: "event",
      //   },
      // ];

      const contract = new ethers.Contract(chainData.dcaContractAddress?.toLowerCase(), dcaAbi.abi, signer);
      const contractERC20 = new ethers.Contract(_sellToken?.address?.toLowerCase(), erc20abi, signer);

      if (sellTokenAddress !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
        //keep the obj value to zero if sell token is not ether
        //Check allowance and take approval from wallet
        console.log("sell token address", sellTokenAddress);
        let _allowance = await contractERC20.allowance(walletAddress.toLowerCase(), chainData.dcaContractAddress?.toLowerCase());
        console.log("allowance ", _allowance?.toString());
        if (+_allowance < +_totalSellAmount) {
          let approved = await contractERC20.approve(chainData.dcaContractAddress?.toLowerCase(), _totalSellAmount);
          await approved.wait();
        }
      }

      console.log(_sellAmount, tradeFrequency, buyTokenAddress, sellTokenAddress, startTime, endTime);
      console.log("contract", contract);
      // deposit fund from wallet to smart contract
      const ETHe = await contract.ETH();
      console.log("eth", ETHe);
      const tx = await contract.depositMultipleFunds(_sellAmount, tradeFrequency, buyTokenAddress, sellTokenAddress, startTime, endTime);
      // wait for the transaction to be mined
      await tx.wait();
      setTransactionProgress("successful");
    } catch (error) {
      console.log(error);
      setTransactionProgress("failed");
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDcaData({
      ...dcaData,
      [name]: value,
    });
  };
  // Filter tokens based on the search query for both name and symbol
  const filteredCoins = filteredCoinList.filter((token) => {
    const nameMatch = token?.coinName.toLowerCase().includes(searchQuery.toLowerCase());
    const symbolMatch = token?.coinSymbol.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || symbolMatch;
  });
  const handleSelectToken = (type = "buy") => {
    setType(type);
    if (type == "sell") {
      let _filteredCoinList = assets?.user_wallet_coins.filter(
        (e) => e.coin_symbol == "DAI" || e.coin_symbol == "USDC" || e.coin_symbol == "USDT" || e.coin_symbol == "TUSD" || e.coin_symbol == "BUSD"
      );
      setfilteredTokens(_filteredCoinList);
    } else {
      setfilteredTokens(coinList);
    }
    setShowAddTokenModal(true);
    setactionsStatus("tokensModal");
    setErrorMessage("");
  };

  //Selecting only one sell token
  const tokenSelected = (e, i) => {
    console.log("sell Token", e, i);
    if (type == "buy") {
      setDcaData({
        ...dcaData,
        buyToken: { symbol: e.coinSymbol, address: e.coinAddress, url: e.coinLogoUrl, coinDecimals: e?.coinDecimalPlaces, buyAmount: 0 },
      });
    } else {
      setDcaData({
        ...dcaData,
        sellToken: { quantity: e.coin_quantity, symbol: e.coin_symbol, address: e.coin_address, url: e.coin_Logo, coinDecimals: e?.coin_decimal },
      });
    }
    setShowAddTokenModal(false);
    setactionsStatus("review");
  };
  //Selecting multiple buy tokens
  //function to select tokens
  const tokenSelection = (e, index) => {
    let isAlreadypresent = false;
    let alreadyPresentIndex = 0;
    console.log("token selected", e);
    console.log("selected tokens", selectedTokens);
    selectedTokens.forEach((t, index) => {
      if (t.coinSymbol === e.coinSymbol) {
        isAlreadypresent = true;
        alreadyPresentIndex = index;
      }
    });
    //adding token if its not present
    if (!isAlreadypresent) {
      let obj = {
        coinSymbol: e.coinSymbol,
        coinAddress: e.coinAddress,
        coinLogoUrl: e.coinLogoUrl,
        coinDecimals: e.coinDecimalPlaces,
        buyAmount: 0,
      };
      setSelectedTokens((t) => [...t, obj]);
    }
    // removing already present token
    else {
      const newSelectedTokens = [...selectedTokens];
      newSelectedTokens.splice(alreadyPresentIndex, 1);
      setSelectedTokens(newSelectedTokens);
    }
  };
  //function to validate token is selected or not return true or false if found the same coin with the selected array
  const validateTokenSelection = (e) => {
    let isSelected = false;
    selectedTokens.map((t) => {
      if (t.coinSymbol === e.coinSymbol) {
        isSelected = true;
      }
    });
    return isSelected;
  };
  //function to handle template selection
  const handleTemplateSelection = (tokenList) => {
    let newSelectedTokens = tokenList.map((e) => {
      let obj = {
        coinSymbol: e.symbol,
        coinAddress: e.address,
        coinLogoUrl: e.logo,
        coinDecimals: e.decimals,
        buyAmount: 0,
      };
      return obj;
    });

    setSelectedTokens(newSelectedTokens);
  };
  //function to handle confirm selection button
  const handleAddTokensButton = () => {
    let percValue = (100 / selectedTokens.length).toFixed(0);
    // Update each object's buyAmount property by percValue
    const updatedTokens = selectedTokens.map((token) => ({
      ...token,
      buyAmount: percValue,
    }));
    // Calculate the total sum of buyAmount properties
    const totalSum = updatedTokens.reduce((accumulator, token) => accumulator + +token.buyAmount, 0);

    // Update the tokens state with the updated array of objects
    setDcaData({
      ...dcaData,
      buyToken: updatedTokens,
    });
    setSum(totalSum);
    
  //  toggleScreen();
  };
  //func to sum all the percentage of selected tokens
  const sumPerc = () => {
    let totalSum = 0;
    console.log("dcaData again 1", dcaData.buyToken);
    dcaData.buyToken.map((token) => {
      totalSum = totalSum + token.buyAmount;
      console.log(+token.buyAmount);
    });
    setSum(totalSum);
    //error message if sum is greater than 100
    if (totalSum > 100) {
      setErrorMessage("Total sum of percentage should not be greater than 100");
    } else {
      setErrorMessage("");
    }
    console.log("dcaData again", dcaData.buyToken);
  };
  //func to remove token from selected tokens
  const removeToken = (e) => {
    let newSelectedTokens = [...dcaData.buyToken];
    newSelectedTokens.splice(e, 1);
    setSelectedTokens(newSelectedTokens);
    setDcaData({
      ...dcaData,
      buyToken: newSelectedTokens,
    });
    console.log("dcaData after splice", dcaData.buyToken);
  };
  //func to remove all token at once
  const removeAllTokens = () => {
    setSelectedTokens([]);
    setDcaData({
      ...dcaData,
      buyToken: [],
    });
    setSum(0);
  };
  const handleDayClick = (day) => {
    setSelectedDay(day);
    setDcaData({ ...dcaData, startDate: findNearestDay(day) });
  };

  // const handleReviewDCA = (e) => {
  //   e.preventDefault();

  //   //  else if (dcaData?.sellAmount * dcaData?.noOfTrades > dcaData?.sellToken?.quantity) {
  //   //   setErrorMessage(`Insufficient balance, Please deposit funds to your wallet`);
  //   //   return;
  //   // }
  //   // add the local time to the start date

  //   setCreationStatus("reviewDca")
  // }
  const handleCreateDCA = async () => {
    if (!dcaData?.sellToken?.address) {
      setErrorMessage("Sell token is required");
      return;
      setErrorMessage("Number of trades should be greater than 1");
      return;
    }
    console.log(Web3Instance, isWalletConnected);
    let _startDate = new Date(dcaData.startDate);
    //if Hours or Minutes are zero then set it to current Hour and Minutes
    Hours == 0 && setHours();
    Hours == 0 ? _startDate.setHours(new Date().getHours()) : _startDate.setHours(Hours);
    Minutes == 0 ? _startDate.setMinutes(new Date().getMinutes()) : _startDate.setMinutes(Minutes);
    _startDate.setSeconds(0);
    _startDate.setMilliseconds(0);
    console.log("start date", _startDate);
    setDcaData({ ...dcaData, startTime: _startDate.getTime() });
    //check whether wallet and chain connected or not if connected go ahead with dca creation or first connect wallet
    if (!isWalletConnected) {
      setErrorMessage("Please Connect Your Wallet");
    }
    //find quantity of buy tokens from perc and put it into array of buyTokenAmounts
    let buyTokenAmounts = [];
    dcaData.buyToken.map((e) => {
      let buyTokenAmount = BigNumber(dcaData.sellAmount)
        .multipliedBy(BigNumber(10).exponentiatedBy(dcaData.sellToken?.coinDecimals))
        .multipliedBy(BigNumber(e?.buyAmount).dividedBy(100))
        .toString();
      buyTokenAmounts.push(buyTokenAmount);
    });
    let totalSellAmount = BigNumber(dcaData.sellAmount)
      .multipliedBy(BigNumber(10).exponentiatedBy(dcaData.sellToken?.coinDecimals))
      .multipliedBy(BigNumber(dcaData.noOfTrades))
      .toString();
    let buyTokenAddresses = dcaData.buyToken.map((e) =>
      e?.coinAddress == "0x0000000000000000000000000000000000000000" ? "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" : e?.coinAddress
    );

    try {
      await createPostions(
        dcaData.sellToken,
        buyTokenAddresses,
        totalSellAmount,
        buyTokenAmounts,
        dcaTimeFrame,
        dcaData.noOfTrades,
        dcaData.startTime
      );
      setCreationStatus("configDca");
    } catch (error) {
      console.log(error);
    }
  };
  const handleBackButton = () => {
    setErrorMessage("");
    setCreationStatus("configDca");
  };
  const toggleOptionsVisibility = () => {
    setShowOptions(!showOptions);
  };

  const setDcaTimeFrameAndUpdate = (timeFrame) => {
    setDcaTimeFrame(timeFrame);
    setShowOptions(false); // Hide options after selection
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.cycle_container')) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className={darkModeClassnamegenerator("DcaCreation")}>
      {/* <CenteredMainTitle show={creationStatus == "configDca" ? false : true} onClick={handleBackButton}>Create DCA</CenteredMainTitle> */}

      {creationStatus == "configDFca" && !isWalletConnected && <WalletNotConnected />}

      <div className="dcaBox">
        <div className="flex">
    
     

            {/* <div className="seprator"></div> */}
          <div className="creationContainer">
            {/* buying part */}
            
         <div className="tokenSelection">
        
              <div className="title">Sell</div>
            <div className="inputGroupContainer">
              <div className="inputGroup">
                {/* <p className="smallTitle">Amount</p> */}
                <div className="sellInput">
                  <input
                    type="number"
                    placeholder="Amount"
                    onChange={(e) => setDcaData({ ...dcaData, sellAmount: validateInput(e.target.value) })}
                    value={dcaData.sellAmount}
                  />
                  <div className="inputSeprator"></div>
                  <div className="sellTokenInfo" onClick={() => handleSelectToken("sell")}>
                    <img src={dcaData?.sellToken?.url} alt="" />
                    <h3>{dcaData?.sellToken?.symbol == "" ? "Token" : dcaData?.sellToken?.symbol } </h3>
                    <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0" fill="none" width="24" height="24" />
                      <g>
                        <path d="M7 10l5 5 5-5" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
              <div className="inputGroup">
                {/* <p className="smallTitle">No of Trades</p> */}
                <div className="sellInputTrade">
                  <input
                    type="number"
                    placeholder="No of Trades e.g 2"
                    onChange={(e) => setDcaData({ ...dcaData, noOfTrades: validateInput(e.target.value) })}
                    value={dcaData.noOfTrades}
                  />
                  {/* <div className='inputSeprator'></div> */}
                </div>
              </div>
         
            </div>
      <div className="buyingContainer">
       <div className="title">Buy</div>
            <div className="infoAndClearAll">
              <p>
                Left:<span>{100 - sum} %</span>/100 %
              </p>
              <button className="clearAll" onClick={() => removeAllTokens()}>
                Clear All
              </button>
            </div>
            {errorMessage && (
              <div className="error__message">
                <p>{errorMessage}</p>
              </div>
            )}

            {/* <TemplateModal isExpanded={isExpanded} toggleScreen={toggleScreen} >
              <div className={"screenContent"}>
                <h2>Recommended For You</h2>
                <ul>
                  {bucketToken[chainId]?.map((item, index) => {
                    return (
                      <li
                        key={index}
                        className="templateContainer"
                        onClick={() => {
                          console.log("clicked on template");
                          handleTemplateSelection(item?.tokens);
                          handleAddTokensButton();
                        }}
                      >
                        <strong>{item.name}</strong>
                        <ul>
                          {item.tokens.map((token, index) => (
                            <li key={token?.symbol}>
                              <div className="tokenContainer">
                                <img src={token?.logo} alt={token?.symbol} />
                                <span className="tokenName">{token?.symbol}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </TemplateModal> */}
           
              {dcaData.buyToken.length == 0 ? 
               <div className="noToken">
               <img src="/assets/images/Empty.svg" alt="No Token" />
               <p>No Buy Token Selected</p>
             </div> 
             :       
              dcaData.buyToken?.map((e, index) => {
                  return (
                    <div className="tokensContainer">
                    <div className="buyToken" key={index}>
                      <div className="token">
                        <div className="tokenInfo">
                          <img src={e?.coinLogoUrl} alt="" />
                          <h2>{e?.coinSymbol}</h2>
                        </div>
                        <div className="tokenPercentage">
                          <input
                            max={100}
                            min={0}
                            type="number"
                            placeholder="0"
                            value={e?.buyAmount}
                            onChange={(value) => {
                              setDcaData((prevDcaData) => {
                                let newDcaData = { ...prevDcaData };
                                newDcaData.buyToken[index].buyAmount = +value.target.value;
                                return newDcaData;
                              });
                              console.log("dcaData", dcaData.buyToken);
                              sumPerc();
                            }}
                          />
                        </div>
                        <p className="Percentage">%</p>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="1em"
                        viewBox="0 0 448 512"
                        onClick={() => {
                          removeToken(index);
                          sumPerc();
                        }}
                      >
                        <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                      </svg>
                    </div>
                    </div>
                  );
                })}
           

            <button className="addTokenButton" onClick={() => handleSelectToken("buy")}>
              <img src="/assets/images/addIcon.png" alt="" />
              Add Tokens
            </button>

            {/* <div className="seprator"></div> */}

         </div>
       </div>
            {/* selling part */}
          <div className="cycleContainer">
       
            <div className="title">Buying cycle</div>

{/* <p className="smallTitle">Purchase</p> */}
<div className="cycle_container">
  <div
    onClick={() => {
      setDcaTimeFrame("Daily");
    }}
    className={`cycle ${dcaTimeFrame == "Daily" && "active"}`}
  >
    Daily
  </div>
  <div
    onClick={() => {
      setDcaTimeFrame("Weekly");
    }}
    className={`cycle ${dcaTimeFrame == "Weekly" && "active"}`}
  >
    Weekly
  </div>
  <div
    onClick={() => {
      setDcaTimeFrame("Monthly");
    }}
    className={`cycle ${dcaTimeFrame == "Monthly" && "active"}`}
  >
    Monthly
  </div>
</div>
{/* <div className="cycle_container">
      <div className="selected_cycle" onClick={toggleOptionsVisibility}>
       <p> {dcaTimeFrame}  <span className="dropdown_icon">&#9660;</span></p>
      </div>
      {showOptions && (
        <div className="options_container">
          <div className="option" onClick={() => setDcaTimeFrameAndUpdate("Daily")}>Daily</div>
          <div className="option" onClick={() => setDcaTimeFrameAndUpdate("Weekly")}>Weekly</div>
          <div className="option" onClick={() => setDcaTimeFrameAndUpdate("Monthly")}>Monthly</div>
        </div>
      )}
    </div> */}

{/* Daily */}

{dcaTimeFrame == "Daily" && (
  <>
    {/* <p className="smallTitle">At my local time</p> */}
    {/* <div className="localTime">
      <h4>Local Time</h4>
      <div className="localTimeInputs">
        <input type="Number" placeholder="17" min={0} max={24} value={Hours} onChange={(input) => setHours(input.target.value)} />
        <p className="localTime_seprator">:</p>
        <input type="Number" placeholder="00" min={0} max={59} value={Minutes} onChange={(input) => setMinutes(input.target.value)} />
      </div>
    </div> */}
  </>
)}

{/* Weekly */}

{dcaTimeFrame == "Weekly" && (
  <>
    <p className="smallTitle">Repeats every</p>
    <div className="weekdays">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className={`weekday ${day === selectedDay ? "active" : ""}`} onClick={() => handleDayClick(day)}>
          {day}
        </div>
      ))}
    </div>
    {/* <p className="smallTitle">At my local time</p>
    <div className="localTime">
      <h4>Local Time</h4>
      <div className="localTimeInputs">
        <input type="Number" placeholder="17" min={0} max={24} value={Hours} onChange={(input) => setHours(input.target.value)} />
        <p className="localTime_seprator">:</p>
        <input type="Number" placeholder="00" min={0} max={59} value={Minutes} onChange={(input) => setMinutes(input.target.value)} />
      </div>
    </div> */}
  </>
)}

{/* Monthly  */}
{dcaTimeFrame == "Monthly" && (
  <>
    {/* <p className="smallTitle">Repeats On</p> */}
    <div className="monthDate">
      <h4>Date of the month</h4>
      <div className="localTimeInputs">
        <input
          type="number"
          placeholder="1-28"
          min={1}
          max={28}
          value={dcaData.monthDay}
          onChange={(val) => setDcaData({ ...dcaData, monthDay: Math.min(28, Math.max(1, validateInput(val.target.value)))})}
        />
      </div>
    </div>
  
   
  </>
)}
{/* Local time  */}
<div className="localTime">
      <h4>Local Time</h4>
      <div className="localTimeInputs">
        <input type="Number" placeholder="17" min={0} max={24} value={Hours} onChange={(input) => setHours(validateInput(input.target.value))} />
        <p className="localTime_seprator">:</p>
        <input type="Number" placeholder="00" min={0} max={59} value={Minutes} onChange={(input) => setMinutes(validateInput(input.target.value))} />
      </div>
</div>
{
  <p className="smallTimeLine">
    The 1st purchase will begin on {formatDate(dcaData.startDate)} at {Hours?.toString().length < 2 ? "0" + Hours : Hours}:
    {Minutes?.toString().length < 2 ? "0" + Minutes : Minutes}
  </p>
}

              <div className="reviewDca">
                <h3 className="title">Your Scheduled Details</h3>
                <div className="logoContainer">
                  {/* <div className="sellToken">
                  <img src={dcaData?.sellToken?.url} alt="" />
                  <p>{dcaData?.sellToken?.symbol}</p>
                  </div>
                <img src= "/assets/images/arrow-right.svg" alt="arrow" />
                <div className="buyTokens">
                {dcaData.buyToken.map((e, index) => {
                    return (
                      <div className="tokenItem">
                      <img key={index} src={e?.coinLogoUrl} alt="" />
                      <p>{e?.coinSymbol}</p>
                      </div>
                    );
                  })
                }
                </div> */}
               

             
                  {/* <div className='bulletContainer'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">

                                    <path fillRule="evenodd" clip-rule="evenodd" d="M3 6C3.79565 6 4.55871 5.68393 5.12132 5.12132C5.68393 4.55871 6 3.79565 6 3C6 2.20435 5.68393 1.44129 5.12132 0.87868C4.55871 0.31607 3.79565 0 3 0C2.20435 0 1.44129 0.31607 0.87868 0.87868C0.31607 1.44129 0 2.20435 0 3C0 3.79565 0.31607 4.55871 0.87868 5.12132C1.44129 5.68393 2.20435 6 3 6ZM4.9575 3C4.9575 3.51916 4.75126 4.01706 4.38416 4.38416C4.01706 4.75126 3.51916 4.9575 3 4.9575C2.48084 4.9575 1.98294 4.75126 1.61584 4.38416C1.24874 4.01706 1.0425 3.51916 1.0425 3C1.0425 2.48084 1.24874 1.98294 1.61584 1.61584C1.98294 1.24874 2.48084 1.0425 3 1.0425C3.51916 1.0425 4.01706 1.24874 4.38416 1.61584C4.75126 1.98294 4.9575 2.48084 4.9575 3Z" fill="#843EA1" />
                                </svg>
                            </div> */}

                  <p>
                    You are depositing{" "}
                    <span>
                      {" "}
                      {dcaData.sellAmount * dcaData?.noOfTrades} { dcaData.sellToken?.symbol || "token"}
                    </span>{" "}
                    to our secure smart contract. Over the next{" "}
                    <span>
                      {dcaData.noOfTrades} {dcaTimeFrame == "Daily" ? "day" : dcaTimeFrame == "Weekly" ? "week" : "month"}
                      {dcaData.noOfTrades > 1 ? "s" : ""}
                    </span>{" "}
                    from <span>{formatDate(dcaData.startTime)}</span>, We will purchase <span> {dcaData.buyToken?.symbol}</span> worth{" "}
                    <span>
                      {dcaData.sellAmount} {dcaData.sellToken?.symbol || "token"} {dcaTimeFrame.toLowerCase()}
                    </span>{" "}
                    on your behalf and instant transfer into your wallet.{" "}
                  </p>
                </div>

                {/* <div className="text">
                  <div className="bulletContainer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                      <path
                        fillRule="evenodd"
                        clip-rule="evenodd"
                        d="M3 6C3.79565 6 4.55871 5.68393 5.12132 5.12132C5.68393 4.55871 6 3.79565 6 3C6 2.20435 5.68393 1.44129 5.12132 0.87868C4.55871 0.31607 3.79565 0 3 0C2.20435 0 1.44129 0.31607 0.87868 0.87868C0.31607 1.44129 0 2.20435 0 3C0 3.79565 0.31607 4.55871 0.87868 5.12132C1.44129 5.68393 2.20435 6 3 6ZM4.9575 3C4.9575 3.51916 4.75126 4.01706 4.38416 4.38416C4.01706 4.75126 3.51916 4.9575 3 4.9575C2.48084 4.9575 1.98294 4.75126 1.61584 4.38416C1.24874 4.01706 1.0425 3.51916 1.0425 3C1.0425 2.48084 1.24874 1.98294 1.61584 1.61584C1.98294 1.24874 2.48084 1.0425 3 1.0425C3.51916 1.0425 4.01706 1.24874 4.38416 1.61584C4.75126 1.98294 4.9575 2.48084 4.9575 3Z"
                        fill="#843EA1"
                      />
                    </svg>
                  </div>
                  <p>
                    Amount Per Swap :{" "}
                  </p>
                  <p>{" "}
                      {dcaData.sellAmount} {dcaData.sellToken?.symbol == "Select" ? "" : dcaData.sellToken?.symbol}</p>
                </div>
                <h3 className="title"></h3>
                <div className="text">
                  <div className="bulletContainer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                      <path
                        fillRule="evenodd"
                        clip-rule="evenodd"
                        d="M3 6C3.79565 6 4.55871 5.68393 5.12132 5.12132C5.68393 4.55871 6 3.79565 6 3C6 2.20435 5.68393 1.44129 5.12132 0.87868C4.55871 0.31607 3.79565 0 3 0C2.20435 0 1.44129 0.31607 0.87868 0.87868C0.31607 1.44129 0 2.20435 0 3C0 3.79565 0.31607 4.55871 0.87868 5.12132C1.44129 5.68393 2.20435 6 3 6ZM4.9575 3C4.9575 3.51916 4.75126 4.01706 4.38416 4.38416C4.01706 4.75126 3.51916 4.9575 3 4.9575C2.48084 4.9575 1.98294 4.75126 1.61584 4.38416C1.24874 4.01706 1.0425 3.51916 1.0425 3C1.0425 2.48084 1.24874 1.98294 1.61584 1.61584C1.98294 1.24874 2.48084 1.0425 3 1.0425C3.51916 1.0425 4.01706 1.24874 4.38416 1.61584C4.75126 1.98294 4.9575 2.48084 4.9575 3Z"
                        fill="#843EA1"
                      />
                    </svg>
                  </div>
                  <p>
                    No. of Trades : 
                  </p>
                 <p>{dcaData?.noOfTrades}</p>
                </div>
                <div className="text">
                  <div className="bulletContainer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 6 6" fill="none">
                      <path
                        fillRule="evenodd"
                        clip-rule="evenodd"
                        d="M3 6C3.79565 6 4.55871 5.68393 5.12132 5.12132C5.68393 4.55871 6 3.79565 6 3C6 2.20435 5.68393 1.44129 5.12132 0.87868C4.55871 0.31607 3.79565 0 3 0C2.20435 0 1.44129 0.31607 0.87868 0.87868C0.31607 1.44129 0 2.20435 0 3C0 3.79565 0.31607 4.55871 0.87868 5.12132C1.44129 5.68393 2.20435 6 3 6ZM4.9575 3C4.9575 3.51916 4.75126 4.01706 4.38416 4.38416C4.01706 4.75126 3.51916 4.9575 3 4.9575C2.48084 4.9575 1.98294 4.75126 1.61584 4.38416C1.24874 4.01706 1.0425 3.51916 1.0425 3C1.0425 2.48084 1.24874 1.98294 1.61584 1.61584C1.98294 1.24874 2.48084 1.0425 3 1.0425C3.51916 1.0425 4.01706 1.24874 4.38416 1.61584C4.75126 1.98294 4.9575 2.48084 4.9575 3Z"
                        fill="#843EA1"
                      />
                    </svg>
                  </div>
                  <p>
                    <b>Total Investment :</b>{" "}
                   
                  </p>
                  <p>
                      {dcaData.sellAmount * dcaData?.noOfTrades} {dcaData.sellToken?.symbol == "Select" ? "" : dcaData.sellToken?.symbol }
                    </p>{" "}
                </div> */}

                {errorMessage && (
                  <div className="error__message">
                    <p>{errorMessage}</p>
                  </div>
                )}

                <div className="revieweDcaBTNContinaer">
                  {/* <button className="edit" onClick={() => setCreationStatus("configDca")}>
                    Edit Details
                  </button> */}
                  <button className="confirm" onClick={() => handleCreateDCA()}>
                    Confirm
                  </button>
                </div>
              </div>
         

            {/* <div className="seprator"></div> */}

</div>
            {/* Interval  */}
        
            {/* <button className='reviewBTN' onClick={(e) => handleReviewDCA(e)}>Review Dca</button> */}
         </div>
          
          {/* <div className="seprator"></div> */}
          <div className="actions">
            {/* review part */}
          
            {/* add token modals */}
            <CombinedModal show={showAddTokenModal} overflow={false} setShow={setShowAddTokenModal} headerTitle={"Add Token"}>
              <DesktopFinalModal>
                <div className={darkModeClassnamegenerator("addTokenModal")}>
                  {type == "buy" && (
                    <button className="selectM" onClick={handleAddTokensButton}>
                      Select ({selectedTokens.length})
                    </button>
                  )}
                  <div className="tokens">
                    <div className="header">
                      {/* <h2>Tokens</h2>
                      <h2>{type == "sell" ? "Quantity" : "Price"}</h2> */}

                      <h2
                        onClick={() => {
                          sortTokens("name");
                          setsortedConfig({ sortBy: "name", sortOrder: sortedconfig.sortOrder == 1 ? 0 : 1 });
                        }}
                        className={sortedconfig.sortBy == "name" ? (sortedconfig.sortOrder == 1 ? "active up" : "active down") : ""}
                      >
                        Tokens{" "}
                        <img
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABiUlEQVR4nO3Y20rDQBCA4UVfKzOBIh6giqj1RkVUvBHfoZDZPkdnctnn8oBeiCIeWquVbS2taaL1QLoL88HelKTsn2mgiTFKKaWUpyw0Nwn5hlCuE+Q1EyoLcmlRem4RyJkJlf2IGC4TKqshntGJ+EYn4hudiG90Ir7RifhGJ+IbnYhvvJ8IxbJHILcW+SqJeOuvIe473GMxIV8kkVRNGVq11rxFvhs9i3PXhf02ZHBRuDt23LkpQ93U59ybkfEN9mNA9n8a4s7JRPRKC3EayNs5G3ilmA+mDXHHunOyFyRB2SgtpL/JOK1Z4JdPG0F+sygn34VYlMO8iEbEu2YW3E1KKJ2imLwQgvQoL4KguTOTiFGMVAnkeSIG+DQbQrEcT0SgdEr/ORVJonTdIrdzJtP7+jNuu3ONTyzyigV5ym6+eHkYMURxc3m6GG57/1LbgiwR8mNRxOB+SldNCAh4MS/GRZT2F+S/EDBa4PuxkAeKZcGEiCCtuIB+BKQVEzKCtBJ8hFJKKVPgHZtXXkIwRrXFAAAAAElFTkSuQmCC"
                          alt=""
                        />
                      </h2>

                      {/* price and quantity selector for buy and sell modals */}
                      {type == "sell" ? (
                        <h2
                          onClick={() => {
                            sortTokens("quantity");
                            setsortedConfig({ sortBy: "quantity", sortOrder: sortedconfig.sortOrder == 1 ? 0 : 1 });
                          }}
                          className={sortedconfig.sortBy == "quantity" ? (sortedconfig.sortOrder == 1 ? "active up" : "active down") : ""}
                        >
                          Quantity{" "}
                          <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABiUlEQVR4nO3Y20rDQBCA4UVfKzOBIh6giqj1RkVUvBHfoZDZPkdnctnn8oBeiCIeWquVbS2taaL1QLoL88HelKTsn2mgiTFKKaWUpyw0Nwn5hlCuE+Q1EyoLcmlRem4RyJkJlf2IGC4TKqshntGJ+EYn4hudiG90Ir7RifhGJ+IbnYhvvJ8IxbJHILcW+SqJeOuvIe473GMxIV8kkVRNGVq11rxFvhs9i3PXhf02ZHBRuDt23LkpQ93U59ybkfEN9mNA9n8a4s7JRPRKC3EayNs5G3ilmA+mDXHHunOyFyRB2SgtpL/JOK1Z4JdPG0F+sygn34VYlMO8iEbEu2YW3E1KKJ2imLwQgvQoL4KguTOTiFGMVAnkeSIG+DQbQrEcT0SgdEr/ORVJonTdIrdzJtP7+jNuu3ONTyzyigV5ym6+eHkYMURxc3m6GG57/1LbgiwR8mNRxOB+SldNCAh4MS/GRZT2F+S/EDBa4PuxkAeKZcGEiCCtuIB+BKQVEzKCtBJ8hFJKKVPgHZtXXkIwRrXFAAAAAElFTkSuQmCC"
                            alt=""
                          />
                        </h2>
                      ) : (
                        <h2
                          onClick={() => {
                            sortTokens("price");
                            setsortedConfig({ sortBy: "price", sortOrder: sortedconfig.sortOrder == 1 ? 0 : 1 });
                          }}
                          className={sortedconfig.sortBy == "price" ? (sortedconfig.sortOrder == 1 ? "active up" : "active down") : ""}
                        >
                          Price{" "}
                          <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABiUlEQVR4nO3Y20rDQBCA4UVfKzOBIh6giqj1RkVUvBHfoZDZPkdnctnn8oBeiCIeWquVbS2taaL1QLoL88HelKTsn2mgiTFKKaWUpyw0Nwn5hlCuE+Q1EyoLcmlRem4RyJkJlf2IGC4TKqshntGJ+EYn4hudiG90Ir7RifhGJ+IbnYhvvJ8IxbJHILcW+SqJeOuvIe473GMxIV8kkVRNGVq11rxFvhs9i3PXhf02ZHBRuDt23LkpQ93U59ybkfEN9mNA9n8a4s7JRPRKC3EayNs5G3ilmA+mDXHHunOyFyRB2SgtpL/JOK1Z4JdPG0F+sygn34VYlMO8iEbEu2YW3E1KKJ2imLwQgvQoL4KguTOTiFGMVAnkeSIG+DQbQrEcT0SgdEr/ORVJonTdIrdzJtP7+jNuu3ONTyzyigV5ym6+eHkYMURxc3m6GG57/1LbgiwR8mNRxOB+SldNCAh4MS/GRZT2F+S/EDBa4PuxkAeKZcGEiCCtuIB+BKQVEzKCtBJ8hFJKKVPgHZtXXkIwRrXFAAAAAElFTkSuQmCC"
                            alt=""
                          />
                        </h2>
                      )}

                      {/* price and volume selector for buy and sell modals */}
                      {type == "sell" ? (
                        <h2
                          onClick={() => {
                            sortTokens("price");
                            setsortedConfig({ sortBy: "price", sortOrder: sortedconfig.sortOrder == 1 ? 0 : 1 });
                          }}
                          className={sortedconfig.sortBy == "price" ? (sortedconfig.sortOrder == 1 ? "active up" : "active down") : ""}
                        >
                          Price{" "}
                          <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABiUlEQVR4nO3Y20rDQBCA4UVfKzOBIh6giqj1RkVUvBHfoZDZPkdnctnn8oBeiCIeWquVbS2taaL1QLoL88HelKTsn2mgiTFKKaWUpyw0Nwn5hlCuE+Q1EyoLcmlRem4RyJkJlf2IGC4TKqshntGJ+EYn4hudiG90Ir7RifhGJ+IbnYhvvJ8IxbJHILcW+SqJeOuvIe473GMxIV8kkVRNGVq11rxFvhs9i3PXhf02ZHBRuDt23LkpQ93U59ybkfEN9mNA9n8a4s7JRPRKC3EayNs5G3ilmA+mDXHHunOyFyRB2SgtpL/JOK1Z4JdPG0F+sygn34VYlMO8iEbEu2YW3E1KKJ2imLwQgvQoL4KguTOTiFGMVAnkeSIG+DQbQrEcT0SgdEr/ORVJonTdIrdzJtP7+jNuu3ONTyzyigV5ym6+eHkYMURxc3m6GG57/1LbgiwR8mNRxOB+SldNCAh4MS/GRZT2F+S/EDBa4PuxkAeKZcGEiCCtuIB+BKQVEzKCtBJ8hFJKKVPgHZtXXkIwRrXFAAAAAElFTkSuQmCC"
                            alt=""
                          />
                        </h2>
                      ) : (
                        <h2
                          onClick={() => {
                            sortTokens("volume");
                            setsortedConfig({ sortBy: "volume", sortOrder: sortedconfig.sortOrder == 1 ? 0 : 1 });
                          }}
                          className={sortedconfig.sortBy == "volume" ? (sortedconfig.sortOrder == 1 ? "active up" : "active down") : ""}
                        >
                          Volume{" "}
                          <img
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABiUlEQVR4nO3Y20rDQBCA4UVfKzOBIh6giqj1RkVUvBHfoZDZPkdnctnn8oBeiCIeWquVbS2taaL1QLoL88HelKTsn2mgiTFKKaWUpyw0Nwn5hlCuE+Q1EyoLcmlRem4RyJkJlf2IGC4TKqshntGJ+EYn4hudiG90Ir7RifhGJ+IbnYhvvJ8IxbJHILcW+SqJeOuvIe473GMxIV8kkVRNGVq11rxFvhs9i3PXhf02ZHBRuDt23LkpQ93U59ybkfEN9mNA9n8a4s7JRPRKC3EayNs5G3ilmA+mDXHHunOyFyRB2SgtpL/JOK1Z4JdPG0F+sygn34VYlMO8iEbEu2YW3E1KKJ2imLwQgvQoL4KguTOTiFGMVAnkeSIG+DQbQrEcT0SgdEr/ORVJonTdIrdzJtP7+jNuu3ONTyzyigV5ym6+eHkYMURxc3m6GG57/1LbgiwR8mNRxOB+SldNCAh4MS/GRZT2F+S/EDBa4PuxkAeKZcGEiCCtuIB+BKQVEzKCtBJ8hFJKKVPgHZtXXkIwRrXFAAAAAElFTkSuQmCC"
                            alt=""
                          />
                        </h2>
                      )}
                    </div>
                    <div className="tokensContainer">
                      {filteredTokens?.length &&
                        filteredTokens.map((e, i) => {
                          return (
                            <div
                              key={i}
                              onClick={() => (type == "buy" ? tokenSelection(e, i) : tokenSelected(e, i))}
                              className={`token ${validateTokenSelection(e) ? "active" : ""} ${selectedTokens.length == 12 ? "disabled" : ""} ${
                                e.isAlreadyPresent == true ? "present" : ""
                              } `}
                            >
                              <div className="token__info">
                                <div className="logos">
                                  <img src={e?.coinLogoUrl || e?.coin_Logo} className="coinLogo" alt="" />
                                  <img src={getNetworkById(e?.coinChainID)?.networkLogo || getNetworkById(chainLogo)} className="chainLogo" alt="" />
                                </div>
                                {/* <img src={e?.coinLogoUrl || e?.coin_Logo} alt="" /> */}
                                <div className="nameAndSymbol">
                                  <h3>{e?.coinName || e?.coin_name}</h3>
                                  <p>{e?.coinSymbol?.toUpperCase() || e?.coin_symbol?.toUpperCase()}</p>
                                </div>
                              </div>

                              <div className="priceAndSelected">
                                <h3 className="price">
                                  {type == "buy" ? "$" : ""}
                                  {formatDecimalValue(e?.coinPrice || e?.coin_quantity)}
                                </h3>
                              </div>

                              <div className="priceAndSelected">
                                <h3 className="price">${formatDecimalValue(e?.volume_change_24h || e?.coin_price)}</h3>

                                {type == "buy" && (
                                  <svg
                                    className="isSelected"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="#B4B4B4"
                                  >
                                    <circle cx="10.3568" cy="10.1497" r="9.47786" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  {type == "buy" && (
                    <div className="searchBox">
                      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
                        <path
                          d="M17.8109 16.884L13.719 12.792C14.9047 11.3682 15.4959 9.54208 15.3696 7.69351C15.2433 5.84494 14.4091 4.11623 13.0407 2.86698C11.6723 1.61772 9.87502 0.944104 8.02262 0.986239C6.17021 1.02837 4.40536 1.78299 3.09517 3.09317C1.78499 4.40336 1.03033 6.1682 0.988192 8.0206C0.946057 9.873 1.61969 11.6704 2.86894 13.0388C4.1182 14.4072 5.84693 15.2413 7.6955 15.3676C9.54407 15.494 11.3702 14.9028 12.7939 13.717L16.886 17.8089C17.0086 17.9316 17.175 18.0006 17.3485 18.0006C17.5219 18.0006 17.6883 17.9316 17.8109 17.8089C17.9336 17.6863 18.0025 17.52 18.0025 17.3465C18.0025 17.1731 17.9336 17.0067 17.8109 16.884ZM2.31096 8.19297C2.31096 7.02902 2.6561 5.89122 3.30275 4.92343C3.9494 3.95565 4.86851 3.20138 5.94385 2.75595C7.01919 2.31053 8.20248 2.19398 9.34406 2.42105C10.4856 2.64813 11.5342 3.20862 12.3573 4.03165C13.1803 4.85468 13.7408 5.90332 13.9679 7.04489C14.1949 8.18647 14.0784 9.3697 13.633 10.445C13.1876 11.5204 12.4333 12.4395 11.4655 13.0862C10.4977 13.7328 9.3599 14.078 8.19596 14.078C6.63547 14.0767 5.13926 13.4562 4.03574 12.3529C2.93221 11.2495 2.31154 9.75345 2.30995 8.19297H2.31096Z"
                          fill="#707070"
                        />
                      </svg>
                      <input type="text" placeholder="Search by Name or Symbol" onChange={(e) => updateFilteredTokens(e.target.value)} />
                    </div>
                  )}

                  {type == "buy" && (
                    <div className="tokensmodalButtonContainer">
                      {/* <button className="selectD" onClick={handleAddTokensButton}>Select ({selectedTokens.length} of 8)</button> */}
                      <button onClick={handleAddTokensButton}>Select ({selectedTokens.length} of 8)</button>
                      <button
                        className="close"
                        onClick={() => {
                          setShowAddTokenModal(false);
                          setactionsStatus("review");
                        }}
                      >
                        Close
                      </button>
                    </div>
                  )}
                  {type == "sell" && (
                    <div className="tokensmodalButtonContainer">
                      {/* <button className="selectD" onClick={handleAddTokensButton}>Select ({selectedTokens.length} of 8)</button> */}
                      <button
                        className="close"
                        onClick={() => {
                          setShowAddTokenModal(false);
                          setactionsStatus("review");
                        }}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </DesktopFinalModal>
            </CombinedModal>

            {/* transaction progress modal */}

            {
              <CombinedModal show={transactionProgressModal} overflow={true} setShow={setTransactionProgressModal} headerTitle="Transaction Details">
                <div className={darkClassGenerator(isDark, "transActionProgressModal")}>
                  <h2
                    className={`transactionStatus ${transactionProgress == "successful" && "successful"}  ${
                      transactionProgress == "failed" && "failed"
                    }`}
                  >
                    {transactionProgress == "inProgress" && "Transaction in Progress"}
                    {transactionProgress == "successful" && "Transaction Successful"}
                    {transactionProgress == "failed" && "Transaction Failed"}
                  </h2>

                  {transactionProgress == "failed" && (
                    <button
                      className="goWalletBTN"
                      onClick={() => {
                        setactionsStatus("review");
                        setTransactionProgressModal(false);
                        setTransactionProgress("inProgress");
                      }}
                    >
                      Try Again
                    </button>
                  )}

                  <p className="transactionMessage">
                    {transactionProgress == "inProgress" && ""}
                    {transactionProgress == "successful" && "You have successfully created DCA positions"}
                    {transactionProgress == "failed" && "Your dca creation has failed"}
                  </p>
                </div>
              </CombinedModal>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
