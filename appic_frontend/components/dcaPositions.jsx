'use client';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CenteredMainTitle from './higerOrderComponents/centeredMainTitle';
import BigNumber from 'bignumber.js';
import WalletNotConnected from './walletNotConnectd';
import { formatDecimalValue } from '@/helper/number_formatter';
import { changePageTitle } from '@/redux/features/pageData';
import Link from 'next/link';
import DcaCreation from './dcaCreation';
export default function DcaPositions({ positionStatus, children }) {
  //how to show the active and completed positions tabs using hooks
  const [activeDcaPositions, setActiveDcaPositions] = useState([]);
  const [completedDcaPositions, setCompletedDcaPositions] = useState([]);
  const [alldcahistory, setAlldcahistory] = useState([]);
  const walletAddress = useSelector((state) => state.wallet.items.walletAddress);
  const chainId = useSelector((state) => state.wallet.items.chainId);
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const dispatch = useDispatch();
  useEffect(() => {
    const getDcaPositions = async () => {
      try {
        let obj = {
          chainId,
          walletAddress,
        };
        let _web3Instance = new ethers.providers.Web3Provider(window.ethereum);
        let _signer = _web3Instance.getSigner();
        let _dcaContract = new ethers.Contract(findNetworkConfig(chainId).dcaContractAddress, dcaAbi.abi, _signer);

        console.log('obj', obj);
        const dcaPositionsData = await axios.post('https://backend.alphavault.io/api/dca/positions', obj);

        let _dcaPositions = dcaPositionsData.data.data;
        console.log('_dcaPositions', _dcaPositions);

        let _activeDcaPositions = [];
        let _allDcaPositions = [];
        let _completedDcaPositions = [];

        await Promise.all(
          _dcaPositions.map(async (position, index) => {
            console.log(walletAddress, position.id, index);
            let _dcaHistory = await _dcaContract.getUserSwapHistory(walletAddress, position.id);
            console.log('_dcaHistory', _dcaHistory);
            // Create new objects for each element in _dcaHistory
            _allDcaPositions = _allDcaPositions.concat(
              _dcaHistory.map((historyItem) => ({
                ...position,
                timeStamp: historyItem,
              }))
            );

            if (position.isActive) {
              _activeDcaPositions.push(position);
            } else {
              _completedDcaPositions.push(position);
            }
          })
        );
        const groupedByStartTimeActive = _activeDcaPositions.reduce((acc, obj) => {
          const startTime = obj.startTime;

          // If there's already a basket for this startTime, add the object to it
          if (acc[startTime]) {
            acc[startTime].push(obj);
          } else {
            // If not, create a new basket for this startTime
            acc[startTime] = [obj];
          }

          return acc;
        }, {});
        // Convert the grouped data back into an array
        const groupedArrayActive = Object.values(groupedByStartTimeActive);
        // console.log("allDcaPositions", _allDcaPositions)
        setAlldcahistory(_allDcaPositions);
        setActiveDcaPositions(groupedArrayActive);
        setCompletedDcaPositions(_completedDcaPositions);
        // console.log("setAlldcahistory", alldcahistory.length)

        // if(alldcahistory.length){
        await getDcaHistory();
        // }
      } catch (error) {
        console.log('error', error);
      }
      //  setDcaPositions(_dcaPositions)
    };
    if (isWalletConnected) {
      getDcaPositions();
    } else {
      console.log('chainId', chainId);
    }
  }, [chainId, walletAddress]);
  // useEffect(() => {
  //     dispatch(changePageTitle("Auto Investment Positions"))
  //     return;
  // }, [])
  //func to get dca positions

  //func to delete dca position
  const deleteDcaPosition = async (id) => {
    try {
      let _web3Instance = new ethers.providers.Web3Provider(window.ethereum);
      let _signer = _web3Instance.getSigner();
      let _dcaContract = new ethers.Contract(findNetworkConfig(chainId).dcaContractAddress, dcaAbi.abi, _signer);
      let tx = await _dcaContract.deleteSchedule(id);
      await tx.wait();
      alert('DCA position deleted successfully');
    } catch (error) {
      console.log('error', error);
    }
  };
  //func to get dca history
  const getDcaHistory = async () => {
    console.log('alldcahistory', alldcahistory);
    let _web3Instance = new ethers.providers.Web3Provider(window.ethereum);
    let _signer = _web3Instance.getSigner();
    let _dcaContract = new ethers.Contract(findNetworkConfig(chainId).dcaContractAddress, dcaAbi.abi, _signer);
    // from alldcaHistory array call each obj and get the history from below func
    // alldcahistory.map(async (position) => {
    // console.log("_dcaHistory", _dcaHistory)
    // }
  };
  return (
    <div>
      {/* Active */}
      {positionStatus == 'active' && (
        <div className={darkModeClassnamegenerator('dca__list')}>
          {activeDcaPositions.length === 0 ? (
            <div className="empty_history">
              <img src="/assets/images/Empty.svg" alt="No history" />
              <p>No DCA history available</p>
            </div>
          ) : (
            <>
              <ul className="header">
                <li>Created at</li>
                <li>Selling</li>
                <li>Amount</li>
                <li>Interval</li>
                <li>Executed</li>
                <li className="buyingDesktop">Buying</li>
                <li>Edit</li>
              </ul>
              {activeDcaPositions.map((position, index) => {
                let amountPerSwap = 0;
                console.log('position :', position);
                position.map((pos) => {
                  amountPerSwap = new BigNumber(amountPerSwap).plus(pos['amountPerSwap']).toString();
                });

                return (
                  <Link href="#" key={index}>
                    <div className="position">
                      <div>
                        <p>{new Date(position[0]['startTime']?.toString() * '1000').toDateString()}</p>
                        <p>{new Date(position[0]['startTime']?.toString() * '1000').toLocaleTimeString()}</p>
                      </div>
                      <div className="sellingToken">
                        <div>
                          <img src={position[0]['sellToken']['coinLogoUrl']} alt="" />
                          <h3>{position[0]['sellToken']['coinSymbol'].toUpperCase()}</h3>
                        </div>
                      </div>
                      <div className="position__amount">${formatDecimalValue(amountPerSwap)}</div>
                      <div className="position__interval">{position[0]['frequency']}</div>
                      <div className="position__status">
                        {`${position[0]['totalExecution'] - position[0]['remainingExecution']}/${position[0]['totalExecution']}`}{' '}
                      </div>
                      <div className="position__buyingDesktop">
                        {position.map((pos, index) => {
                          return <img key={index} src={pos['buyToken']['coinLogoUrl']} alt="" />;
                        })}
                      </div>

                      <div className="position__delete">
                        <button> Edit</button>{' '}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Inactive */}
      {positionStatus == 'inactive' && (
        <div className={darkModeClassnamegenerator('dca__list')}>
          {completedDcaPositions.length === 0 ? (
            <div className="empty_history">
              <img src="/assets/images/Empty.svg" alt="No history" />
              <p>No history available</p>
            </div>
          ) : (
            <>
              <ul className="header">
                <li>Sold</li>
                <li>Amount</li>
                <li>Interval</li>
                <li>Status</li>
                <li className="buyingDesktop">Bought</li>
              </ul>
              {completedDcaPositions.map((position, index) => {
                return (
                  <Link key={index} href="#">
                    <div className="position">
                      <div className="sellingToken">
                        <img src="/assets/images/bitcoin.png" alt="" />
                        <h3>USDT</h3>
                      </div>
                      <div className="position__amount">40</div>
                      <div className="position__interval">Daily</div>
                      <div className="position__status">Executed</div>
                      <div className="position__buyingDesktop">
                        <img src="/assets/images/bitcoin.png" alt="" />
                        <img src="/assets/images/bitcoin.png" alt="" />
                        <img src="/assets/images/bitcoin.png" alt="" />
                        <img src="/assets/images/bitcoin.png" alt="" />
                        <p>...</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      )}
      {/* creation
                {positionStatus == "creation" && <>
                       <DcaCreation></DcaCreation> 
                </>}  */}

      {/* position details */}
      {false && (
        <>
          {/* active positions */}
          {positionStatus == 'active' && !isWalletConnected && <WalletNotConnected />}
          {positionStatus == 'active' && isWalletConnected && activeDcaPositions.length > 0
            ? activeDcaPositions[0]?.isActive && (
                <div className="position">
                  <div className="tokens">
                    <div className="token">
                      <img src={activeDcaPositions[0]?.sellToken?.coinLogoUrl} alt="" />
                      <p>{activeDcaPositions[0]?.sellToken?.coinSymbol}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="27" height="16" viewBox="0 0 27 16" fill="none">
                      <path
                        fillRule="evenodd"
                        clip-rule="evenodd"
                        d="M17.3645 13.0983C17.2264 13.2271 17.1156 13.3823 17.0387 13.5548C16.9618 13.7273 16.9205 13.9135 16.9172 14.1024C16.9138 14.2912 16.9486 14.4787 17.0193 14.6538C17.09 14.8289 17.1953 14.988 17.3288 15.1215C17.4624 15.2551 17.6214 15.3603 17.7965 15.4311C17.9716 15.5018 18.1592 15.5365 18.348 15.5332C18.5368 15.5299 18.723 15.4885 18.8955 15.4117C19.068 15.3348 19.2233 15.224 19.352 15.0858L25.4477 8.99209L26.4414 7.99834L25.4477 7.00459L19.3539 0.910842C19.0888 0.654555 18.7336 0.512643 18.3649 0.515673C17.9962 0.518702 17.6434 0.666429 17.3826 0.927038C17.1217 1.18765 16.9737 1.54028 16.9703 1.909C16.9669 2.27771 17.1085 2.633 17.3645 2.89834L21.0583 6.59209L1.59766 6.59209C1.2247 6.59209 0.86701 6.74025 0.603287 7.00397C0.339563 7.2677 0.191406 7.62538 0.191406 7.99834C0.191406 8.3713 0.339563 8.72899 0.603287 8.99271C0.86701 9.25643 1.2247 9.40459 1.59766 9.40459L21.0583 9.40459L17.3645 13.0983Z"
                      />
                    </svg>

                    <div className="token">
                      <img src={activeDcaPositions[0]?.buyToken?.coinLogoUrl} alt="" />
                      <p>{activeDcaPositions[0]?.buyToken?.coinSymbol}</p>
                    </div>
                  </div>
                  <div className="detailsBox">
                    <div className="dataPart">
                      <h3>Total Amount</h3>
                      <h4>{activeDcaPositions[0]?.totalAmount}</h4>
                    </div>
                    <div className="dataPart">
                      <h3>Total P&L</h3>
                      <div className="flex">
                        <p className="figures Up">0.71927</p>
                        <p className="percentage Up">13.78%</p>
                      </div>
                    </div>
                  </div>
                  {/* seprator */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="310" height="2" viewBox="0 0 310 2" fill="none" className="seprator">
                    <path d="M1 1L309.5 1" stroke="#CACACA" strokeOpacity="0.5" strokeLinecap="round" />
                  </svg>

                  <div className="dataRow">
                    <div className="dataPart">
                      <h3>Frequency</h3>
                      <h4>{activeDcaPositions[0]?.frequency}</h4>
                    </div>

                    <div className="dataPart">
                      <h3>Amt. per Swap</h3>
                      <h4>{activeDcaPositions[0]?.amountPerSwap}</h4>
                    </div>

                    <div className="dataPart">
                      <h3>Executed</h3>
                      <h4>
                        {activeDcaPositions[0]?.totalExecution - activeDcaPositions[0]?.remainingExecution}/{activeDcaPositions[0]?.totalExecution}
                      </h4>
                    </div>
                    <div className="dataPart">
                      <h3>Avg. Sell Price</h3>
                      <h4>1 MATIC = $0.82</h4>
                    </div>
                    <div className="dataPart">
                      <h3>Current Price</h3>
                      <h4>${formatDecimalValue(activeDcaPositions[0]?.sellToken?.coinPrice, 2)}</h4>
                    </div>

                    <div className="dataPart">
                      {/* <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                        <path d="M10.416 20.8333C10.416 21.3859 10.6355 21.9158 11.0262 22.3065C11.4169 22.6972 11.9468 22.9167 12.4993 22.9167C13.0519 22.9167 13.5818 22.6972 13.9725 22.3065C14.3632 21.9158 14.5827 21.3859 14.5827 20.8333M10.416 20.8333C10.416 20.2808 10.6355 19.7509 11.0262 19.3602C11.4169 18.9695 11.9468 18.75 12.4993 18.75C13.0519 18.75 13.5818 18.9695 13.9725 19.3602C14.3632 19.7509 14.5827 20.2808 14.5827 20.8333M10.416 20.8333H4.16602M14.5827 20.8333H20.8327M12.4993 6.25V8.33333M12.4993 11.4583V11.4687M12.4993 15.625L10.416 13.5417H7.29102C7.01475 13.5417 6.7498 13.4319 6.55445 13.2366C6.3591 13.0412 6.24935 12.7763 6.24935 12.5V4.16667C6.24935 3.8904 6.3591 3.62545 6.55445 3.4301C6.7498 3.23475 7.01475 3.125 7.29102 3.125H17.7077C17.9839 3.125 18.2489 3.23475 18.4443 3.4301C18.6396 3.62545 18.7493 3.8904 18.7493 4.16667V12.5C18.7493 12.7763 18.6396 13.0412 18.4443 13.2366C18.2489 13.4319 17.9839 13.5417 17.7077 13.5417H14.5827L12.4993 15.625Z" stroke="#14172C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg> */}
                      <h3 className="delete_Btn" onClick={() => deleteDcaPosition(activeDcaPositions[0]?.id)}>
                        Delete{' '}
                      </h3>
                    </div>
                  </div>
                </div>
              )
            : isWalletConnected &&
              positionStatus == 'active' && (
                <div className="position">
                  <h1> No DCA positions active Yet</h1>
                </div>
              )}

          {/* completed positions */}
          {positionStatus == 'completed' && !isWalletConnected && <WalletNotConnected />}
          {positionStatus == 'completed' && isWalletConnected && completedDcaPositions.length > 0 ? (
            <div className="position">
              <div className="tokens">
                <div className="token">
                  <img src={completedDcaPositions[0]?.sellToken?.coinLogoUrl} alt="" />
                  <p>{completedDcaPositions[0]?.sellToken?.coinSymbol}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="27" height="16" viewBox="0 0 27 16" fill="none">
                  <path
                    fillRule="evenodd"
                    clip-rule="evenodd"
                    d="M17.3645 13.0983C17.2264 13.2271 17.1156 13.3823 17.0387 13.5548C16.9618 13.7273 16.9205 13.9135 16.9172 14.1024C16.9138 14.2912 16.9486 14.4787 17.0193 14.6538C17.09 14.8289 17.1953 14.988 17.3288 15.1215C17.4624 15.2551 17.6214 15.3603 17.7965 15.4311C17.9716 15.5018 18.1592 15.5365 18.348 15.5332C18.5368 15.5299 18.723 15.4885 18.8955 15.4117C19.068 15.3348 19.2233 15.224 19.352 15.0858L25.4477 8.99209L26.4414 7.99834L25.4477 7.00459L19.3539 0.910842C19.0888 0.654555 18.7336 0.512643 18.3649 0.515673C17.9962 0.518702 17.6434 0.666429 17.3826 0.927038C17.1217 1.18765 16.9737 1.54028 16.9703 1.909C16.9669 2.27771 17.1085 2.633 17.3645 2.89834L21.0583 6.59209L1.59766 6.59209C1.2247 6.59209 0.86701 6.74025 0.603287 7.00397C0.339563 7.2677 0.191406 7.62538 0.191406 7.99834C0.191406 8.3713 0.339563 8.72899 0.603287 8.99271C0.86701 9.25643 1.2247 9.40459 1.59766 9.40459L21.0583 9.40459L17.3645 13.0983Z"
                  />
                </svg>

                <div className="token">
                  <img src={completedDcaPositions[0]?.buyToken?.coinLogoUrl} alt="" />
                  <p>{completedDcaPositions[0]?.buyToken?.coinSymbol}</p>
                </div>
              </div>
              <div className="detailsBox">
                <div className="dataPart">
                  <h3>Total Amount</h3>
                  <h4>{completedDcaPositions[0]?.totalAmount}</h4>
                </div>
                <div className="dataPart">
                  <h3>Total P&L</h3>
                  <div className="flex">
                    <p className="figures Up">0.71927</p>
                    <p className="percentage Up">13.78%</p>
                  </div>
                </div>
              </div>
              {/* seprator */}
              <svg xmlns="http://www.w3.org/2000/svg" width="310" height="2" viewBox="0 0 310 2" fill="none" className="seprator">
                <path d="M1 1L309.5 1" stroke="#CACACA" strokeOpacity="0.5" strokeLinecap="round" />
              </svg>

              <div className="dataRow">
                <div className="dataPart">
                  <h3>Frequency</h3>
                  <h4>{completedDcaPositions[0]?.frequency}</h4>
                </div>

                <div className="dataPart">
                  <h3>Amt. per Swap</h3>
                  <h4>{completedDcaPositions[0]?.amountPerSwap}</h4>
                </div>

                <div className="dataPart">
                  <h3>Executed</h3>
                  <h4>
                    {completedDcaPositions[0]?.totalExecution - completedDcaPositions[0]?.remainingExecution}/
                    {completedDcaPositions[0]?.totalExecution}
                  </h4>
                </div>
                <div className="dataPart">
                  <h3>Avg. Sell Price</h3>
                  <h4>1 MATIC = $0.82</h4>
                </div>
                <div className="dataPart">
                  <h3>Current Price</h3>
                  <h4>${formatDecimalValue(completedDcaPositions[0]?.sellToken?.coinPrice, 2)}</h4>
                </div>

                <div className="dataPart">
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                    <path
                      d="M10.416 20.8333C10.416 21.3859 10.6355 21.9158 11.0262 22.3065C11.4169 22.6972 11.9468 22.9167 12.4993 22.9167C13.0519 22.9167 13.5818 22.6972 13.9725 22.3065C14.3632 21.9158 14.5827 21.3859 14.5827 20.8333M10.416 20.8333C10.416 20.2808 10.6355 19.7509 11.0262 19.3602C11.4169 18.9695 11.9468 18.75 12.4993 18.75C13.0519 18.75 13.5818 18.9695 13.9725 19.3602C14.3632 19.7509 14.5827 20.2808 14.5827 20.8333M10.416 20.8333H4.16602M14.5827 20.8333H20.8327M12.4993 6.25V8.33333M12.4993 11.4583V11.4687M12.4993 15.625L10.416 13.5417H7.29102C7.01475 13.5417 6.7498 13.4319 6.55445 13.2366C6.3591 13.0412 6.24935 12.7763 6.24935 12.5V4.16667C6.24935 3.8904 6.3591 3.62545 6.55445 3.4301C6.7498 3.23475 7.01475 3.125 7.29102 3.125H17.7077C17.9839 3.125 18.2489 3.23475 18.4443 3.4301C18.6396 3.62545 18.7493 3.8904 18.7493 4.16667V12.5C18.7493 12.7763 18.6396 13.0412 18.4443 13.2366C18.2489 13.4319 17.9839 13.5417 17.7077 13.5417H14.5827L12.4993 15.625Z"
                      stroke="#14172C"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            positionStatus == 'completed' &&
            isWalletConnected && (
              <div className="position">
                <h1> No DCA positions completed Yet</h1>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

