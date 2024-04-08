'use client';

import darkModeClassnamegenerator, { darkClassGenerator } from '@/utils/darkClassGenerator';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import WalletNotConnected from './walletNotConnectd';
import Modal from './higerOrderComponents/modal';
import { applyDecimals, formatDecimalValue } from '@/helper/number_formatter';
import { getPositionNumber } from '@/helper/helperFunc';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import { AppicIdlFactory, icrcIdlFactory } from '@/did';
import { Principal } from '@dfinity/principal';
import canistersIDs from '@/config/canistersIDs';
import { BatchTransact } from '@/artemis-web3-adapter';

export default function DcaCreation() {
  const dispatch = useDispatch();
  const [tokenModal, setTokenModal] = useState({ isActive: false, modalType: 'sell', tokens: [] }); // modalType: buy, sell
  const [transactionModal, setTransactionModal] = useState(false);
  const [transactionStep1, setTransationStep1] = useState('notTriggered'); // inProgress, notTriggered, Rejected, Fialed , Successful
  const [transactionStep2, setTransationStep2] = useState('notTriggered'); // inProgress, notTriggered, Rejected, Fialed
  const [transactionStepFailure, setTransactionStepFailure] = useState(null);
  const [DCAData, setDCAData] = useState({
    sellToken: null,
    buyToken: null,
    swapsNo: '',
    amoutPerSwap: '',
    frequency: '', // Daily, Weekly, Monthly
    monthDate: '',
    weekDay: '',
    localHour: '',
    localMinute: '',
    timeLine: [],
  });
  //   Redux state
  const isDark = useSelector((state) => state.theme.isDark);
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const principalID = useSelector((state) => state.wallet.items.principalID);
  const accoundID = useSelector((state) => state.wallet.items.accountID);
  const walletName = useSelector((state) => state.wallet.items.walletName);
  const assets = useSelector((state) => state.wallet.items.assets);
  const totalBalance = useSelector((state) => state.wallet.items.totalBalance);
  const loader = useSelector((state) => state.wallet.items.loader);
  const supportedTokens = useSelector((state) => state.supportedTokens.tokens);
  const supportedPairs = useSelector((state) => state.supportedPairs.pairs);

  // Disable create button if form is not completed
  const handleButtonDisablity = () => {
    if (DCAData.timeLine.length != 0 && DCAData.buyToken != null && DCAData.sellToken != null && DCAData.amoutPerSwap != '') return false;
    return true;
  };

  // Filter Token for token selection modal based on type
  const filterBuyAndSellTokens = (modalType) => {
    //  If token modal type is sell
    if (modalType == 'sell') {
      // If there is no buy token show all the tokens that could be sold
      if (DCAData.buyToken == null) {
        const allSellTokens = supportedPairs.map((pair) => pair.sellToken);

        // Removing duplication
        let uniqueSellIds = {};
        let uniqueSellTokens = allSellTokens.filter((token) => {
          if (!uniqueSellIds[token.id]) {
            uniqueSellIds[token.id] = true;
            return true;
          }
          return false;
        });

        return uniqueSellTokens;
      }
      // If there is a buy token show only the tokens that could be sold to buy this token
      else {
        const allPairsWithBuyToken = supportedPairs.filter((pair) => pair.buyToken.id == DCAData.buyToken.id);
        return allPairsWithBuyToken.map((pair) => pair.sellToken);
      }
    }
    //  If token modal type is Buy
    else if (modalType == 'buy') {
      // If there is no sell token show all the tokens that could be bought
      if (DCAData.sellToken == null) {
        const allBuyTokens = supportedPairs.map((pair) => pair.buyToken);
        // Removing duplication
        let uniqueBuyIds = {};
        let uniqueBuyTokens = allBuyTokens.filter((token) => {
          if (!uniqueBuyIds[token.id]) {
            uniqueBuyIds[token.id] = true;
            return true;
          }
          return false;
        });

        return uniqueBuyTokens;
      }
      // If there is a sell token show only the tokens that could be bought by selling the sell token
      else {
        const allPairsWithSellToken = supportedPairs.filter((pair) => pair.sellToken.id == DCAData.sellToken.id);
        return allPairsWithSellToken.map((pair) => pair.buyToken);
      }
    }
  };

  // get WeekDay by nuumber
  const getWeekDayString = (weekNumber) => {
    var weekdays = ['Sun', 'Mon', 'Tues', 'Wednes', 'Thurs', 'Fri', 'Sat'];
    return weekdays[weekNumber];
  };

  // Foramt frequency
  const formatFrequency = (frequency) => {
    switch (frequency) {
      case 'Weekly':
        return 'Weeks';
      case 'Daily':
        return 'Days';
      case 'Monthly':
        return 'Months';
      default:
        return 'Months';
    }
  };

  // Format date for timeline
  const formatDate = (date) => {
    // Extract day, month, and year
    let day = date.getDate();
    let month = date.getMonth() + 1; // Months are zero-indexed, so we add 1
    let year = date.getFullYear();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let weekDay = getWeekDayString(date.getDay());

    if (hour < 10) {
      hour = '0' + String(hour);
    }
    if (minute < 10) {
      minute = '0' + String(minute);
    }
    // Convert date to string
    var dateString = date.toString();

    // Split the string by spaces
    var parts = dateString.split(' ');

    // Extract the time zone information
    var timeZone = parts[parts.length - 3] + ' ' + parts[parts.length - 1];

    // Format the date in non-American way (day-month-year)
    return `${weekDay}, ${day}/${month}/${year}, ${hour}:${minute} ${timeZone}`;
  };

  // Event Handler for Token slection
  const handleTokenSelection = (token) => {
    if (tokenModal.modalType == 'sell') {
      setDCAData({ ...DCAData, sellToken: token });
    }
    if (tokenModal.modalType == 'buy') {
      setDCAData({ ...DCAData, buyToken: token });
    }
    setTokenModal({ ...tokenModal, isActive: false });
  };

  // Generating dates for
  const generateDataForTimelineSkeleton = (index) => {
    // Get the current date
    let date = new Date();
    let indexDate = new Date(date.getYear(), date.getMonth(), date.getDate() + index * 7);

    // Extract day, month, and year
    let day = indexDate.getDate();
    let month = indexDate.getMonth() + 1; // Months are zero-indexed, so we add 1
    let year = indexDate.getFullYear();
    let weekDay = getWeekDayString(indexDate.getDay());

    // Convert date to string
    var dateString = date.toString();

    // Split the string by spaces
    var parts = dateString.split(' ');

    // Extract the time zone information
    var timeZone = parts[parts.length - 3] + ' ' + parts[parts.length - 1];
    // Format the date in non-American way (day-month-year)
    return `${weekDay}, ${day}/${month}/${year}, 17:00, ${timeZone}`;
  };

  const getCurrentTime = () => {
    const date = new Date();

    return {
      year: date.getFullYear(),
      month: date.getMonth(),
      monthDate: date.getDate(),
      hour: date.getHours(),
      minutes: date.getMinutes(),
      weekDay: date.getDay(),
    };
  };

  // Generatre First Swap's Time
  const generateFirstSwapTime = (newDCAData, currentDate) => {
    let firstSwapTime = '';
    if (newDCAData.frequency != '' && newDCAData.swapsNo != '') {
      switch (newDCAData.frequency) {
        // if frequency is Daily
        case 'Daily':
          if (newDCAData.localHour != '' && newDCAData.localMinute != '') {
            // Check to see if Hour  of Dca is greater than current Hour  plus 2 Hours
            if (Number(newDCAData.localHour) >= currentDate.hour + 2) {
              firstSwapTime = new Date(
                currentDate.year,
                currentDate.month,
                currentDate.monthDate,
                Number(newDCAData.localHour),
                Number(newDCAData.localMinute)
              );
            }
            // Hour and Minute of Dca is not greater than current Hour and minute set the first swap for the next day
            else {
              firstSwapTime = new Date(
                currentDate.year,
                currentDate.month,
                currentDate.monthDate + 1,
                Number(newDCAData.localHour),
                Number(newDCAData.localMinute)
              );
            }
          } else {
            firstSwapTime = '';
          }
          break;
        // if frequency is Weekly
        case 'Weekly':
          if (newDCAData.localHour != '' && newDCAData.localMinute != '' && newDCAData.weekDay != '') {
            // Check to see if WeekDay is equal to current WeekDay
            // And Hour and Minute of Dca is greater than current Hour and minute plus 2 Hours
            if (Number(newDCAData.weekDay) == currentDate.weekDay && Number(newDCAData.localHour) >= currentDate.hour + 2) {
              firstSwapTime = new Date(
                currentDate.year,
                currentDate.month,
                currentDate.monthDate,
                Number(newDCAData.localHour),
                Number(newDCAData.localMinute)
              );
            }
            // Check to see if WeekDay is not equal to current WeekDay
            // And Hour and Minute of Dca is not greater than current Hour and minute set the first swap for the next day
            else {
              if (Number(newDCAData.weekDay) == currentDate.weekDay) {
                firstSwapTime = new Date(
                  currentDate.year,
                  currentDate.month,
                  currentDate.monthDate + 7,
                  Number(newDCAData.localHour),
                  Number(newDCAData.localMinute)
                );
              } else if (Number(newDCAData.weekDay) > currentDate.weekDay) {
                firstSwapTime = new Date(
                  currentDate.year,
                  currentDate.month,
                  currentDate.monthDate + Number(newDCAData.weekDay) - currentDate.weekDay,
                  Number(newDCAData.localHour),
                  Number(newDCAData.localMinute)
                );
              } else if (Number(newDCAData.weekDay) < currentDate.weekDay) {
                firstSwapTime = new Date(
                  currentDate.year,
                  currentDate.month,
                  currentDate.monthDate + 7 - currentDate.weekDay + Number(newDCAData.weekDay),
                  Number(newDCAData.localHour),
                  Number(newDCAData.localMinute)
                );
              }
            }
          } else {
            firstSwapTime = '';
          }
          break;

        // if frequency is Monthly
        case 'Monthly':
          if (newDCAData.localHour != '' && newDCAData.localMinute != '' && newDCAData.monthDate != '') {
            // Check to see if Month Date equal to current Month Date
            // And If Hour and Minute of Dca is greater than current Hour and minute plus 2 Hours
            if (Number(newDCAData.monthDate) >= currentDate.monthDate && Number(newDCAData.localHour) >= currentDate.hour + 2) {
              firstSwapTime = new Date(
                currentDate.year,
                currentDate.month,
                Number(newDCAData.monthDate),
                Number(newDCAData.localHour),
                Number(newDCAData.localMinute)
              );
            }
            // Hour and Minute of Dca is not greater than current Hour and minute set the first swap for the next day
            else {
              firstSwapTime = new Date(
                currentDate.year,
                currentDate.month + 1,
                Number(newDCAData.monthDate),
                Number(newDCAData.localHour),
                Number(newDCAData.localMinute)
              );
            }
          } else {
            firstSwapTime = '';
          }
          break;

        default:
          break;
      }
    }
    return firstSwapTime;
  };

  // Generatre timelines and swap times from first swap time
  const generateSwapTimesFromFirstSwapTime = (firstSwapTime, newDCAData) => {
    // Extract day, month, and year
    let firstMonthDay = firstSwapTime.getDate();
    let firstMonth = firstSwapTime.getMonth(); // Months are zero-indexed, so we add 1
    let firstYear = firstSwapTime.getFullYear();
    let firstHour = firstSwapTime.getHours();
    let firstMinute = firstSwapTime.getMinutes();
    // Array for saving all swap times
    const timeLineArray = [firstSwapTime];

    // Creating loops to generate all swaps date
    switch (newDCAData.frequency) {
      case 'Daily':
        for (let i = 1; i < Number(newDCAData.swapsNo); i++) {
          timeLineArray.push(new Date(firstYear, firstMonth, firstMonthDay + i, firstHour, firstMinute));
        }
        break;
      case 'Weekly':
        for (let i = 1; i < Number(newDCAData.swapsNo); i++) {
          timeLineArray.push(new Date(firstYear, firstMonth, firstMonthDay + i * 7, firstHour, firstMinute));
        }
        break;
      case 'Monthly':
        for (let i = 1; i < Number(newDCAData.swapsNo); i++) {
          timeLineArray.push(new Date(firstYear, firstMonth + i, firstMonthDay, firstHour, firstMinute));
        }
        break;
    }

    setDCAData({ ...newDCAData, timeLine: timeLineArray });
  };
  // Generate Timelines
  const generateTimelines = (newDCAData) => {
    // Get current time
    const currentDate = getCurrentTime();
    let firstSwapTime = generateFirstSwapTime(newDCAData, currentDate);

    if (firstSwapTime != '') {
      generateSwapTimesFromFirstSwapTime(firstSwapTime, newDCAData);
    } else {
      setDCAData({ ...newDCAData, timeLine: [] });
    }
  };

  const handleCreateDca = async () => {
    setTransactionModal(true);
    setTransationStep1('inProgress');
    // Get swap times in unix standard time

    try {
      // Define Appic Actor
      let AppicActor = await artemisWalletAdapter.getCanisterActor(canistersIDs.APPIC_ROOT, AppicIdlFactory, false);
      // Call getAllowanceForNewTrade to get required allowance for approve function
      const allowanceForNewTrade = await AppicActor.getAllowanceForNewTrade({
        noOfSwaps: DCAData.swapsNo,
        userPrincipal: Principal.fromText(principalID),
        sellToken: Principal.fromText(DCAData.sellToken.id),
        amountPerSwap: BigNumber(DCAData.amoutPerSwap)
          .multipliedBy(10 ** DCAData.sellToken.decimals)
          .toNumber(),
      });
      const transactions = {
        approval: {
          canisterId: DCAData.sellToken.id,
          idl: icrcIdlFactory,
          methodName: 'icrc2_approve',
          args: [
            {
              fee: [],
              memo: [],
              from_subaccount: [],
              created_at_time: [],
              expected_allowance: [],
              expires_at: [],
              amount: allowanceForNewTrade.minAllowanceRequired,
              spender: { owner: Principal.fromText(canistersIDs.APPIC_ROOT), subaccount: [] },
            },
          ],
        },
      };

      // Execute transaction for calling approve function
      let transactionsList = new BatchTransact(transactions, artemisWalletAdapter);
      await transactionsList.execute();
      if (transactionsList.completed.length == 1) {
        setTransationStep1('Successful');
        setTransationStep2('inProgress');
      } else {
        setTransationStep1('Failed');
        return;
      }
      // Generate swapsTimes from timeline for creating position
      const swapsTime = DCAData.timeLine.map((swapTime) => swapTime.getTime() / 1000);

      // Call createPosition to create the position
      let positionResult = await AppicActor.createPosition({
        destination: Principal.fromText(principalID),
        swapsTime: swapsTime,
        sellToken: Principal.fromText(DCAData.sellToken.id),
        allowance: BigNumber(DCAData.amoutPerSwap)
          .multipliedBy(DCAData.swapsNo)
          .multipliedBy(10 ** DCAData.sellToken.decimals)
          .toNumber(),
        buyToken: Principal.fromText(DCAData.buyToken.id),
        amountPerSwap: BigNumber(DCAData.amoutPerSwap)
          .multipliedBy(10 ** DCAData.sellToken.decimals)
          .toNumber(),
      });
      setTransationStep2('Successful');
    } catch (error) {
      if (error.message == 'The transaction was rejected.') {
        setTransationStep1('Failed');
        setTransactionStepFailure('The transaction was rejected');
      }
      console.log(error.message);
      setTransactionStepFailure(error.message);
    }
  };

  return (
    <div className={darkModeClassnamegenerator('DcaCreation')}>
      {/* <CenteredMainTitle show={creationStatus == "configDca" ? false : true} onClick={handleBackButton}>Create DCA</CenteredMainTitle> */}

      {!isWalletConnected && <WalletNotConnected />}
      {isWalletConnected && (
        <>
          <div className="dcaBox">
            <div className="flex">
              {/* Creation part */}
              <div className="creationContainer">
                <div>
                  {/* Token selection */}
                  <div className="tokenSelectionTitle">
                    <div className="title">Sell</div>
                    <div></div>
                    <div className="title">Buy</div>
                  </div>
                  <div className="tokenSelection">
                    <div
                      onClick={() => {
                        setTokenModal({ isActive: true, modalType: 'sell', tokens: filterBuyAndSellTokens('sell') });
                      }}
                      className="sellContainer tokenContainer"
                    >
                      {DCAData.sellToken == null ? <div className="emptyLogo"></div> : <img src={DCAData.sellToken.logo} alt="" />}
                      {DCAData.sellToken == null ? <h3 className="emtpyText">Select a token</h3> : <h3>{DCAData.sellToken.symbol}</h3>}
                      <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" fill="none" width="24" height="24"></rect>
                        <g>
                          <path d="M7 10l5 5 5-5"></path>
                        </g>
                      </svg>
                    </div>
                    {/* Arrow left */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" id="right-arrow">
                      <path
                        className="right-arrow"
                        d="M10.245864,3.68413591 L13.7813979,7.21966982 C14.0742911,7.51256304 14.0742911,7.98743677 13.7813979,8.28032999 L10.245864,11.8158639 C9.95297077,12.1087571 9.47809704,12.1087571 9.18520382,11.8158639 C8.8923106,11.5229707 8.8923106,11.0480969 9.18520382,10.7552037 L11.44,8.499466 L2.75,8.5 C2.37030423,8.5 2.05650904,8.21784612 2.00684662,7.85177056 L2,7.75 C2,7.33578644 2.33578644,7 2.75,7 L2.75,7 L11.44,6.999466 L9.18520382,4.74479609 C8.8923106,4.45190287 8.8923106,3.97702913 9.18520382,3.68413591 C9.47809704,3.3912427 9.95297077,3.3912427 10.245864,3.68413591 Z"
                      ></path>
                    </svg>
                    <div
                      className="buyContainer tokenContainer"
                      onClick={() => {
                        setTokenModal({ isActive: true, modalType: 'buy', tokens: filterBuyAndSellTokens('buy') });
                      }}
                    >
                      {DCAData.buyToken == null ? <div className="emptyLogo"></div> : <img src={DCAData.buyToken.logo} alt="" />}
                      {DCAData.buyToken == null ? <h3 className="emtpyText">Select a token</h3> : <h3>{DCAData.buyToken.symbol}</h3>}
                      <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" fill="none" width="24" height="24"></rect>
                        <g>
                          <path d="M7 10l5 5 5-5"></path>
                        </g>
                      </svg>
                    </div>
                  </div>
                  {/* Inputs for amount and number of trades*/}

                  <div className="repetitionAndAmountContainer">
                    <div className="amount inputGroup">
                      <h4>No of swaps</h4>

                      <input
                        type="number"
                        max={50}
                        min={0}
                        step={1}
                        value={DCAData.swapsNo}
                        onChange={(e) => {
                          if (e.target.value > 50) {
                            setDCAData({ ...DCAData, swapsNo: 50 });
                            generateTimelines({ ...DCAData, swapsNo: 50 });
                          } else if (e.target.value < 0) {
                            setDCAData({ ...DCAData, swapsNo: 1 });
                            generateTimelines({ ...DCAData, swapsNo: 1 });
                          } else {
                            setDCAData({ ...DCAData, swapsNo: Math.floor(e.target.value) });
                            generateTimelines({ ...DCAData, swapsNo: Math.floor(e.target.value) });
                          }
                        }}
                        placeholder="No of swaps e.g 4"
                      />
                    </div>
                    <div className="repetition inputGroup">
                      <h4>Sell amount per swap</h4>
                      <div className="inputAndPriceContainer">
                        <input
                          type="number"
                          onChange={(e) => {
                            setDCAData({ ...DCAData, amoutPerSwap: e.target.value });
                          }}
                          placeholder="Amount e.g 2"
                        />
                        {/* Token value in dollors */}
                        <p className="price">
                          ~$
                          {DCAData.sellToken != null && DCAData.amoutPerSwap != ''
                            ? formatDecimalValue(BigNumber(DCAData.sellToken.price).multipliedBy(DCAData.amoutPerSwap).toString())
                            : 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="seprator"></div>

                  {/* Cycle part */}
                  <div className="cycleContainer">
                    <div className="title">Buy cycle</div>

                    {/* <p className="smallTitle">Purchase</p> */}
                    <div className="cycle_container">
                      <div
                        onClick={() => {
                          setDCAData({ ...DCAData, frequency: 'Daily' });
                          generateTimelines({ ...DCAData, frequency: 'Daily' });
                        }}
                        className={`cycle ${DCAData.frequency == 'Daily' && 'active'}`}
                      >
                        Daily
                      </div>
                      <div
                        onClick={() => {
                          setDCAData({ ...DCAData, frequency: 'Weekly' });
                          generateTimelines({ ...DCAData, frequency: 'Weekly' });
                        }}
                        className={`cycle ${DCAData.frequency == 'Weekly' && 'active'}`}
                      >
                        Weekly
                      </div>
                      <div
                        onClick={() => {
                          setDCAData({ ...DCAData, frequency: 'Monthly' });
                          generateTimelines({ ...DCAData, frequency: 'Monthly' });
                        }}
                        className={`cycle ${DCAData.frequency == 'Monthly' && 'active'}`}
                      >
                        Monthly
                      </div>
                    </div>

                    {/* Daily */}

                    {DCAData.frequency == 'Daily' && <></>}

                    {/* Weekly */}

                    {DCAData.frequency == 'Weekly' && (
                      <>
                        <p className="smallTitle">Repeats every</p>
                        <div className="weekdays">
                          {['0', '1', '2', '3', '4', '5', '6'].map((day) => (
                            <div
                              key={day}
                              className={`weekday ${day == DCAData.weekDay ? 'active' : ''}`}
                              onClick={() => {
                                setDCAData({ ...DCAData, weekDay: day });
                                generateTimelines({ ...DCAData, weekDay: day });
                              }}
                            >
                              {getWeekDayString(Number(day))}
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Monthly  */}
                    {DCAData.frequency == 'Monthly' && (
                      <>
                        {/* <p className="smallTitle">Repeats On</p> */}
                        <div className="monthDate">
                          <h4>Date of the month</h4>
                          <div className="localTimeInputs">
                            <input
                              type="number"
                              value={DCAData.monthDate}
                              onChange={(e) => {
                                if (Number(e.target.value) > 28) {
                                  setDCAData({ ...DCAData, monthDate: '28' });
                                  generateTimelines({ ...DCAData, monthDate: '28' });
                                } else if (Number(e.target.value) < 0) {
                                  setDCAData({ ...DCAData, monthDate: '0' });
                                  generateTimelines({ ...DCAData, monthDate: '0' });
                                } else {
                                  setDCAData({ ...DCAData, monthDate: String(e.target.value) });
                                  generateTimelines({ ...DCAData, monthDate: String(e.target.value) });
                                }
                              }}
                              placeholder="1-28"
                              min={1}
                              max={28}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {/* Local time  */}
                    <div className="localTime">
                      <p className="localTimeTitle">Local Time</p>

                      <div className="localTimeInputs">
                        <input
                          type="Number"
                          value={DCAData.localHour}
                          onChange={(e) => {
                            if (Number(e.target.value) > 23) {
                              setDCAData({ ...DCAData, localHour: '23' });
                              generateTimelines({ ...DCAData, localHour: '23' });
                            } else if (Number(e.target.value) < 0) {
                              setDCAData({ ...DCAData, localHour: '0' });
                              generateTimelines({ ...DCAData, localHour: '0' });
                            } else {
                              setDCAData({ ...DCAData, localHour: String(e.target.value) });
                              generateTimelines({ ...DCAData, localHour: String(e.target.value) });
                            }
                          }}
                          placeholder="17"
                          step={1}
                          min={0}
                          max={24}
                        />
                        <p className="localTime_seprator">:</p>
                        <input
                          type="number"
                          value={DCAData.localMinute}
                          onChange={(e) => {
                            if (Number(e.target.value) > 59) {
                              setDCAData({ ...DCAData, localMinute: '59' });
                              generateTimelines({ ...DCAData, localMinute: '59' });
                            } else if (Number(e.target.value) < 0) {
                              setDCAData({ ...DCAData, localMinute: '0' });
                              generateTimelines({ ...DCAData, localMinute: '0' });
                            } else {
                              setDCAData({ ...DCAData, localMinute: String(e.target.value) });
                              generateTimelines({ ...DCAData, localMinute: String(e.target.value) });
                            }
                          }}
                          placeholder="00"
                          step={1}
                          min={0}
                          max={59}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Create position button */}
                <button onClick={handleCreateDca} disabled={handleButtonDisablity()} className="createPosition">
                  Create Auto-invest position
                </button>
              </div>
              {/* Review part */}
              <div className="reviewDCA">
                {/* Details */}
                <div className="details">
                  <h3 className="title">Details</h3>
                  {/* Details Box  */}
                  <div className="detailsContainer">
                    <div className="detail">
                      <div className="titleContainer">
                        <div className="dot"></div>

                        <h1>Amount Per Swap</h1>
                      </div>

                      <h1>
                        {DCAData.amoutPerSwap != '' ? <span>{DCAData.amoutPerSwap}</span> : <span className="skeleton">4</span>}{' '}
                        {DCAData.sellToken != null ? <span>{DCAData.sellToken.symbol}</span> : <span className="skeleton">ICP</span>}
                      </h1>
                    </div>

                    <div className="detail">
                      <div className="titleContainer">
                        <div className="dot"></div>
                        <h1>Buy cycle</h1>
                      </div>
                      <h1> {DCAData.frequency != '' ? <span>{DCAData.frequency}</span> : <span className="skeleton">Weekly</span>}</h1>
                    </div>

                    <div className="detail">
                      <div className="titleContainer">
                        <div className="dot"></div>
                        <h1>Investment Period</h1>
                      </div>
                      <h1>
                        {DCAData.swapsNo != '' ? <span>{DCAData.swapsNo}</span> : <span className="skeleton">9</span>}{' '}
                        {DCAData.frequency != '' ? <span>{formatFrequency(DCAData.frequency)}</span> : <span className="skeleton">Weeks</span>}
                      </h1>
                    </div>
                    <div className="detail">
                      <div className="titleContainer">
                        <div className="dot"></div>
                        <h1>Total Investment Amount</h1>
                      </div>
                      <h1>
                        {DCAData.swapsNo != '' && DCAData.amoutPerSwap != '' ? (
                          <span>{BigNumber(DCAData.swapsNo).multipliedBy(DCAData.amoutPerSwap).toString()}</span>
                        ) : (
                          <span className="skeleton">9</span>
                        )}{' '}
                        {DCAData.sellToken != null ? <span>{DCAData.sellToken.symbol}</span> : <span className="skeleton">ICP</span>}
                      </h1>
                    </div>
                  </div>
                  <p className="explanation">
                    Please make sure before each swap yopu will have at least{' '}
                    <span>
                      {DCAData.amoutPerSwap != '' ? <span>{DCAData.amoutPerSwap}</span> : <span className="skeleton">4</span>}{' '}
                      {DCAData.sellToken != null ? <span>{DCAData.sellToken.symbol}</span> : <span className="skeleton">ICP</span>}
                    </span>{' '}
                    in your wallet. After swap is completed, fuds will be transfered to your wallet imidietly.
                  </p>
                </div>

                {/* Time line */}
                <div className="timeline">
                  <h3 className="title">Timeline</h3>
                  <div className="timelineContainer">
                    <div className="timelineHolder">
                      {(DCAData.swapsNo == '' || DCAData.swapsNo > 1) && (
                        <div key={'shape'} className={`timelineShape ${DCAData.timeLine.length == 0 && 'skeleton'}`}></div>
                      )}

                      {/* Timeline swaps */}
                      {/* Skeleton */}
                      {DCAData.timeLine.length == 0 && (
                        <>
                          <div className="swapTime skeleton first">
                            <div className="tailCover"></div>
                            <div className="connectedTitle">
                              <div className="connector"></div>
                              <h3>{generateDataForTimelineSkeleton(0)}</h3>
                            </div>

                            <h2>First Swap </h2>
                          </div>
                          <div className="swapTime skeleton ">
                            <div className="connectedTitle">
                              <div className="connector"></div>
                              <h3>{generateDataForTimelineSkeleton(1)}</h3>
                            </div>

                            <h2>Second Swap </h2>
                          </div>
                          <div className="swapTime skeleton">
                            <div className="connectedTitle">
                              <div className="connector"></div>
                              <h3>{generateDataForTimelineSkeleton(2)}</h3>
                            </div>

                            <h2>Third Swap </h2>
                          </div>
                          <div className="swapTime skeleton">
                            <div className="connectedTitle">
                              <div className="connector"></div>
                              <h3>{generateDataForTimelineSkeleton(3)}</h3>
                            </div>

                            <h2>Fourth Swap </h2>
                          </div>
                          <div className="swapTime skeleton">
                            <div className="connectedTitle">
                              <div className="connector"></div>
                              <h3>{generateDataForTimelineSkeleton(4)}</h3>
                            </div>

                            <h2>Fifth Swap </h2>
                          </div>
                          <div className="swapTime skeleton">
                            <div className="connectedTitle">
                              <div className="connector"></div>
                              <h3>{generateDataForTimelineSkeleton(5)}</h3>
                            </div>

                            <h2>Sixth Swap </h2>
                          </div>
                          <div className="swapTime skeleton">
                            <div className="connectedTitle">
                              <div className="connector"></div>
                              <h3>{generateDataForTimelineSkeleton(6)}</h3>
                            </div>

                            <h2>Seventh Swap </h2>
                          </div>
                          <div className="swapTime skeleton last">
                            <div className="tailCover"></div>

                            <div className="connectedTitle">
                              <div className="connector"></div>
                              <h3>{generateDataForTimelineSkeleton(8)}</h3>
                            </div>

                            <h2>Final Swap </h2>
                          </div>
                        </>
                      )}

                      {/* Real data */}
                      {DCAData.timeLine.length != 0 &&
                        DCAData.timeLine.map((swapTime, index) => {
                          return (
                            <div key={index} className={`swapTime ${index == 0 && 'first'} ${index == DCAData.timeLine.length - 1 && 'last'}`}>
                              {(index == DCAData.timeLine.length - 1 || index == 0) && <div className="tailCover"></div>}

                              <div className="connectedTitle">
                                <div className="connector"></div>
                                <h3>{formatDate(swapTime)}</h3>
                              </div>

                              <h2>{getPositionNumber(index, DCAData.timeLine.length - 1 == index)} Swap</h2>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add token modal */}
      <Modal active={tokenModal.isActive}>
        <div className="addTokenModal">
          <div className="topSection">
            <button className="backBTN"></button>
            <h3 className="title">Select a token</h3>
            <button
              onClick={() => {
                setTokenModal({ ...tokenModal, isActive: false });
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
          <div className="searchContainer">
            <svg className="searchIcon" xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18">
              <path d="M17.8109 16.884L13.719 12.792C14.9047 11.3682 15.4959 9.54208 15.3696 7.69351C15.2433 5.84494 14.4091 4.11623 13.0407 2.86698C11.6723 1.61772 9.87502 0.944104 8.02262 0.986239C6.17021 1.02837 4.40536 1.78299 3.09517 3.09317C1.78499 4.40336 1.03033 6.1682 0.988192 8.0206C0.946057 9.873 1.61969 11.6704 2.86894 13.0388C4.1182 14.4072 5.84693 15.2413 7.6955 15.3676C9.54407 15.494 11.3702 14.9028 12.7939 13.717L16.886 17.8089C17.0086 17.9316 17.175 18.0006 17.3485 18.0006C17.5219 18.0006 17.6883 17.9316 17.8109 17.8089C17.9336 17.6863 18.0025 17.52 18.0025 17.3465C18.0025 17.1731 17.9336 17.0067 17.8109 16.884ZM2.31096 8.19297C2.31096 7.02902 2.6561 5.89122 3.30275 4.92343C3.9494 3.95565 4.86851 3.20138 5.94385 2.75595C7.01919 2.31053 8.20248 2.19398 9.34406 2.42105C10.4856 2.64813 11.5342 3.20862 12.3573 4.03165C13.1803 4.85468 13.7408 5.90332 13.9679 7.04489C14.1949 8.18647 14.0784 9.3697 13.633 10.445C13.1876 11.5204 12.4333 12.4395 11.4655 13.0862C10.4977 13.7328 9.3599 14.078 8.19596 14.078C6.63547 14.0767 5.13926 13.4562 4.03574 12.3529C2.93221 11.2495 2.31154 9.75345 2.30995 8.19297H2.31096Z"></path>
            </svg>
            <input type="text" placeholder="Search name or paste address" />
          </div>
          <div className="seprator">
            <span></span>
          </div>
          <div className="tokens">
            {tokenModal.tokens?.map((token) => {
              return (
                <div
                  onClick={() => {
                    handleTokenSelection(token);
                  }}
                  key={token.id}
                  className="token"
                >
                  <div className="token_info">
                    <img className="token_logo" src={token.logo} alt="" />
                    <div className="token_details">
                      <h3 className="token_name">{token.name}</h3>
                      <h4 className="token_symbol">{token.symbol}</h4>
                    </div>
                  </div>
                  <div className="token_balance">
                    <h3>{applyDecimals(token.balance, token.decimals)}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Transaction Modal */}
      <Modal active={transactionModal}>
        <div className="transactionModal">
          <div className="topSection">
            <button className="backBTN"></button>
            <h3 className="title">Approve transaction</h3>
            <button
              onClick={() => {
                setTransactionModal(false);
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
          <div className="stepContainer Approval">
            <h1>Step 1</h1>
            <div
              className={`imagesContainer ${transactionStep1 == 'inProgress' ? 'active' : ''} ${transactionStep1 == 'Failed' ? 'Failed' : ''} ${
                transactionStep1 == 'Successful' ? 'Successful' : ''
              }`}
            >
              <div className="iconLoading">
                <div className="coverBG"></div>
                <div className="rotator"></div>
              </div>
              {transactionStep1 == 'inProgress' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                </svg>
              )}
              {transactionStep1 == 'Successful' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                </svg>
              )}
              {transactionStep1 == 'Failed' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
                </svg>
              )}
            </div>
            <p className="transactionDetail">{transactionStep1 == 'Failed' ? transactionStepFailure : 'Please approve the transaction.'}</p>
          </div>
          <div className="stepContainer dcaCreation">
            <h1>Step 2</h1>
            <div
              className={`imagesContainer ${transactionStep2 == 'inProgress' ? 'active' : ''} ${transactionStep2 == 'Failed' ? 'Failed' : ''} ${
                transactionStep2 == 'Successful' ? 'Successful' : ''
              }`}
            >
              <div className="iconLoading">
                <div className="coverBG"></div>

                <div className="rotator"></div>
              </div>
              {transactionStep2 == 'notTriggered' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                </svg>
              )}
              {transactionStep2 == 'inProgress' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                </svg>
              )}
              {transactionStep2 == 'Successful' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                </svg>
              )}
              {transactionStep2 == 'Failed' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
                </svg>
              )}
            </div>
            <p className="transactionDetail">
              {transactionStep2 == 'Failed' ? transactionStepFailure : 'Please Wait until the position is created.'}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

