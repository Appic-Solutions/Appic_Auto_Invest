'use client';

import darkModeClassnamegenerator, { darkClassGenerator } from '@/utils/darkClassGenerator';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import WalletNotConnected from './walletNotConnectd';
import Modal from './higerOrderComponents/modal';
import { applyDecimals } from '@/helper/number_formatter';

export default function DcaCreation({ isExpanded, toggleScreen }) {
  const dispatch = useDispatch();
  const [dcaTimeFrame, setDcaTimeFrame] = useState('Monthly'); // Daily, Monthly , Weekly
  const [selectedDay, setSelectedDay] = useState('Sunday'); // Default selected day is Sunday
  const [Hours, setHours] = useState(new Date().getHours());
  const [Minutes, setMinutes] = useState(new Date().getMinutes());
  const [errorMessage, setErrorMessage] = useState('');
  const [tokenModal, setTokenModal] = useState({ isActive: false, modalType: 'sell' }); // modalType: buy, sell
  const [DCAData, setDCAData] = useState({
    sellToken: null,
    buyToken: null,
    swapsNo: null,
    amoutPerSwap: null,
    frequency: 'Daily', // Daily, Weekly, Monthly
    monthDate: null,
    weekDay: 'Sun',
    localHour: new Date().getHours(),
    localMinute: new Date().getMinutes(),
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
  const handleButtonDisablity = () => {
    if (!DCAData.sellToken.id || !DCAData.buyToken.id || !DCAData) return false;
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
        const allPairsWithBuyToken = supportedPairs.filter((pair) => pair.buyToken.id == DCAData.buyToken);
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
        const allPairsWithSellToken = supportedPairs.filter((pair) => pair.sellToken.id == DCAData.sellToken);
        return allPairsWithSellToken.map((pair) => pair.buyToken);
      }
    }
  };

  return (
    <div className={darkModeClassnamegenerator('DcaCreation')}>
      {/* <CenteredMainTitle show={creationStatus == "configDca" ? false : true} onClick={handleBackButton}>Create DCA</CenteredMainTitle> */}

      {!isWalletConnected && <WalletNotConnected />}
      {isWalletConnected && <></>}
      <div className="dcaBox">
        <div className="flex">
          {/* Creation part */}
          <div className="creationContainer">
            {/* Token selection */}
            <div className="tokenSelectionTitle">
              <div className="title">Sell</div>
              <div></div>
              <div className="title">Buy</div>
            </div>
            <div className="tokenSelection">
              <div
                onClick={() => {
                  setTokenModal({ isActive: true, modalType: 'sell' });
                }}
                className="sellContainer tokenContainer"
              >
                <img src="/ICP.png" alt="" />
                <h3>ICP</h3>
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
                  setTokenModal({ isActive: true, modalType: 'buy' });
                }}
              >
                <img src="/ckBTC.png" alt="" />
                <h3>ckBTC</h3>
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

                <input type="number" placeholder="No of swaps e.g 4" />
              </div>
              <div className="repetition inputGroup">
                <h4>Sell amount per swap</h4>
                <input type="number" placeholder="Amount e.g 2" />
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
                    setDcaTimeFrame('Daily');
                  }}
                  className={`cycle ${dcaTimeFrame == 'Daily' && 'active'}`}
                >
                  Daily
                </div>
                <div
                  onClick={() => {
                    setDcaTimeFrame('Weekly');
                  }}
                  className={`cycle ${dcaTimeFrame == 'Weekly' && 'active'}`}
                >
                  Weekly
                </div>
                <div
                  onClick={() => {
                    setDcaTimeFrame('Monthly');
                  }}
                  className={`cycle ${dcaTimeFrame == 'Monthly' && 'active'}`}
                >
                  Monthly
                </div>
              </div>

              {/* Daily */}

              {dcaTimeFrame == 'Daily' && <></>}

              {/* Weekly */}

              {dcaTimeFrame == 'Weekly' && (
                <>
                  <p className="smallTitle">Repeats every</p>
                  <div className="weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className={`weekday ${day === selectedDay ? 'active' : ''}`} onClick={() => handleDayClick(day)}>
                        {day}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Monthly  */}
              {dcaTimeFrame == 'Monthly' && (
                <>
                  {/* <p className="smallTitle">Repeats On</p> */}
                  <div className="monthDate">
                    <h4>Date of the month</h4>
                    <div className="localTimeInputs">
                      <input type="number" placeholder="1-28" min={1} max={28} />
                    </div>
                  </div>
                </>
              )}
              {/* Local time  */}
              <div className="localTime">
                <h4>Time</h4>
                <div className="localTimeInputs">
                  <input type="Number" placeholder="17" min={0} max={24} />
                  <p className="localTime_seprator">:</p>
                  <input type="Number" placeholder="00" min={0} max={59} />
                </div>
              </div>
            </div>

            {/* Create position button */}
            <button className="createPosition">Create Auto-invest position</button>
            {/* Interval  */}
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
                    <h1>Amount Per Transaction</h1>
                  </div>
                  <h1>4 ICP</h1>
                </div>

                <div className="detail">
                  <div className="titleContainer">
                    <div className="dot"></div>
                    <h1>Buy cycle</h1>
                  </div>
                  <h1>Weekly</h1>
                </div>

                <div className="detail">
                  <div className="titleContainer">
                    <div className="dot"></div>
                    <h1>Investment Period</h1>
                  </div>
                  <h1>9 Weeks</h1>
                </div>
                <div className="detail">
                  <div className="titleContainer">
                    <div className="dot"></div>
                    <h1>Total Investment Amount</h1>
                  </div>
                  <h1>36 ICP</h1>
                </div>
              </div>
              <p className="explanation">
                please make sure before each swap yopu will have at least <span>4 ICP</span> in your wallet.
              </p>
            </div>

            {/* Time line */}
            <div className="timeline">
              <h3 className="title">Timeline</h3>
              <div className="timelineContainer">
                <div className="timelineHolder">
                  <div className="timelineShape"></div>
                  <div className="swapTime first">
                    <div className="tailCover"></div>
                    <div className="connectedTitle">
                      <div className="connector"></div>
                      <h3>{new Date().toUTCString()}</h3>
                    </div>

                    <h2>First Swap </h2>
                  </div>

                  <div className="swapTime ">
                    <div className="connectedTitle">
                      <div className="connector"></div>
                      <h3>{new Date().toUTCString()}</h3>
                    </div>

                    <h2>Second Swap </h2>
                  </div>

                  <div className="swapTime">
                    <div className="connectedTitle">
                      <div className="connector"></div>
                      <h3>{new Date().toUTCString()}</h3>
                    </div>

                    <h2>Third Swap </h2>
                  </div>

                  <div className="swapTime">
                    <div className="connectedTitle">
                      <div className="connector"></div>
                      <h3>{new Date().toUTCString()}</h3>
                    </div>

                    <h2>Fourth Swap </h2>
                  </div>

                  <div className="swapTime ">
                    <div className="connectedTitle">
                      <div className="connector"></div>
                      <h3>{new Date().toUTCString()}</h3>
                    </div>

                    <h2>Fifth Swap </h2>
                  </div>
                  <div className="swapTime ">
                    <div className="connectedTitle">
                      <div className="connector"></div>
                      <h3>{new Date().toUTCString()}</h3>
                    </div>

                    <h2>Sixth Swap </h2>
                  </div>
                  <div className="swapTime ">
                    <div className="connectedTitle">
                      <div className="connector"></div>
                      <h3>{new Date().toUTCString()}</h3>
                    </div>

                    <h2>Seventh Swap </h2>
                  </div>
                  <div className="swapTime ">
                    <div className="connectedTitle">
                      <div className="connector"></div>
                      <h3>{new Date().toUTCString()}</h3>
                    </div>

                    <h2>Eighth Swap </h2>
                  </div>
                  <div className="swapTime last">
                    <div className="tailCover"></div>

                    <div className="connectedTitle">
                      <div className="connector"></div>
                      <h3>{new Date().toUTCString()}</h3>
                    </div>

                    <h2>Final Swap </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            {filterBuyAndSellTokens(tokenModal.modalType)?.map((token) => {
              return (
                <div key={token.id} className="token">
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
    </div>
  );
}

