'use client';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { formatDecimalValue } from '@/helper/number_formatter';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Modal from './higerOrderComponents/modal';
import { formatDate, getPositionNumber } from '@/helper/helperFunc';
import { useUserDcaPositions } from '@/hooks/getUserDCAPositions';
export default function DcaPositions({ positionStatus }) {
  const [timeLineModal, setTimelineModal] = useState({ isActive: false, timline: [], sellToken: null, buyToken: null });
  const activePositions = useSelector((state) => state.userPositionsReducer.active);
  const completedPositions = useSelector((state) => state.userPositionsReducer.completed);
  const principalID = useSelector((state) => state.wallet.items.principalID);
  const supportedTokens = useSelector((state) => state.supportedTokens.tokens);

  // Custom hooks
  const {} = useUserDcaPositions(principalID, supportedTokens);
  const formatTransactionStatus = (status) => {
    switch (status) {
      case 'Pending':
        return 'Executing';
      case 'Failed':
        return 'Failed';
      case 'NotTriggered':
        return 'Waiting for Execution time';
      case 'Successful':
        return 'Successful';
    }
  };
  return (
    <div>
      {/* Active */}
      {positionStatus == 'active' && (
        <div className={darkModeClassnamegenerator('dca__list')}>
          {activePositions.length === 0 ? (
            <div className="empty_history">
              {/* <img src="/assets/images/Empty.svg" alt="No history" /> */}
              <p>No Active Auto Invest Position Available</p>
            </div>
          ) : (
            <>
              <ul className="header">
                <li className="tokens">Tokens</li>
                <li>Interval</li>
                <li>Amount per swap</li>
                <li>Executed</li>
                <li>TimeLine</li>
                <li></li>
              </ul>
              {activePositions.map((position, index) => {
                let amountPerSwap = 0;

                return (
                  <div key={position.positionId}>
                    <div className="position">
                      <div className="tokens">
                        <div className="token sellToken">
                          <img className="tokenLogo" src={position.sellToken.logo} alt="" />
                          <h3 className="tokenSymbol">{position.sellToken.symbol}</h3>
                        </div>
                        {/* Arrow left */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" id="right-arrow">
                          <path
                            className="right-arrow"
                            d="M10.245864,3.68413591 L13.7813979,7.21966982 C14.0742911,7.51256304 14.0742911,7.98743677 13.7813979,8.28032999 L10.245864,11.8158639 C9.95297077,12.1087571 9.47809704,12.1087571 9.18520382,11.8158639 C8.8923106,11.5229707 8.8923106,11.0480969 9.18520382,10.7552037 L11.44,8.499466 L2.75,8.5 C2.37030423,8.5 2.05650904,8.21784612 2.00684662,7.85177056 L2,7.75 C2,7.33578644 2.33578644,7 2.75,7 L2.75,7 L11.44,6.999466 L9.18520382,4.74479609 C8.8923106,4.45190287 8.8923106,3.97702913 9.18520382,3.68413591 C9.47809704,3.3912427 9.95297077,3.3912427 10.245864,3.68413591 Z"
                          ></path>
                        </svg>
                        <div className="token buyToken">
                          <img className="tokenLogo" src={position.buyToken.logo} alt="" />
                          <h3 className="tokenSymbol">{position.buyToken.symbol}</h3>
                        </div>
                      </div>
                      <div className="Interval">{position.interval}</div>
                      <div className="Amount">
                        {BigNumber(position.swaps[0].sellingAmount)
                          .dividedBy(10 ** position.sellToken.decimals)
                          .toString()}{' '}
                        {position.sellToken.symbol}
                      </div>
                      <div className="Executed">{`${position.executed}/${position.swaps.length}`}</div>

                      <div className="timeLine">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                          onClick={() => {
                            setTimelineModal({ isActive: true, timline: position.swaps, sellToken: position.sellToken, buyToken: position.buyToken });
                          }}
                        >
                          <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
                        </svg>
                      </div>
                      <div className="DeleteBTN">
                        <button>Delete Position</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Inactive */}
      {positionStatus == 'inactive' && (
        <div className={darkModeClassnamegenerator('dca__list')}>
          {completedPositions.length === 0 ? (
            <div className="empty_history">
              {/* <img src="/assets/images/Empty.svg" alt="No history" /> */}
              <p>No Active Auto Invest Position Available</p>
            </div>
          ) : (
            <>
              <ul className="header">
                <li className="tokens">Tokens</li>
                <li>Interval</li>
                <li>Amount per swap</li>
                <li>Executed</li>
                <li>TimeLine</li>
                <li></li>
              </ul>
              {activePositions.map((position, index) => {
                let amountPerSwap = 0;

                return (
                  <div key={position.positionId}>
                    <div className="position">
                      <div className="tokens">
                        <div className="token sellToken">
                          <img className="tokenLogo" src={position.sellToken.logo} alt="" />
                          <h3 className="tokenSymbol">{position.sellToken.symbol}</h3>
                        </div>
                        {/* Arrow left */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" id="right-arrow">
                          <path
                            className="right-arrow"
                            d="M10.245864,3.68413591 L13.7813979,7.21966982 C14.0742911,7.51256304 14.0742911,7.98743677 13.7813979,8.28032999 L10.245864,11.8158639 C9.95297077,12.1087571 9.47809704,12.1087571 9.18520382,11.8158639 C8.8923106,11.5229707 8.8923106,11.0480969 9.18520382,10.7552037 L11.44,8.499466 L2.75,8.5 C2.37030423,8.5 2.05650904,8.21784612 2.00684662,7.85177056 L2,7.75 C2,7.33578644 2.33578644,7 2.75,7 L2.75,7 L11.44,6.999466 L9.18520382,4.74479609 C8.8923106,4.45190287 8.8923106,3.97702913 9.18520382,3.68413591 C9.47809704,3.3912427 9.95297077,3.3912427 10.245864,3.68413591 Z"
                          ></path>
                        </svg>
                        <div className="token buyToken">
                          <img className="tokenLogo" src={position.buyToken.logo} alt="" />
                          <h3 className="tokenSymbol">{position.buyToken.symbol}</h3>
                        </div>
                      </div>
                      <div className="Interval">{position.interval}</div>
                      <div className="Amount">
                        {BigNumber(position.swaps[0].sellingAmount)
                          .dividedBy(10 ** position.sellToken.decimals)
                          .toString()}{' '}
                        {position.sellToken.symbol}
                      </div>
                      <div className="Executed">{`${position.executed}/${position.swaps.length}`}</div>

                      <div className="timeLine">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 384 512"
                          onClick={() => {
                            setTimelineModal({ isActive: true, timline: position.swaps, sellToken: position.sellToken, buyToken: position.buyToken });
                          }}
                        >
                          <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z" />
                        </svg>
                      </div>
                      <div className="DeleteBTN">
                        <button>Delete Position</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      <Modal active={timeLineModal.isActive}>
        <div className="timelineModal">
          <div className="topSection">
            <button className="backBTN"></button>
            <h3 className="title">Position Timeline</h3>
            <button
              onClick={() => {
                setTimelineModal({ ...timeLineModal, isActive: false });
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
          <div className="timelineContainer">
            <div className="timelineHolder">
              {timeLineModal.timline.length > 1 && <div key={'shape'} className={`timelineShape`}></div>}

              {/* Timeline swaps */}

              {timeLineModal.timline.map((swap, index) => {
                return (
                  <div key={index} className={`swapTime ${index == 0 && 'first'} ${index == timeLineModal.timline.length - 1 && 'last'}`}>
                    {(index == timeLineModal.timline.length - 1 || index == 0) && <div className="tailCover"></div>}

                    <div className="connectedTitle">
                      <div className="connector"></div>
                      <h2 className="transactionIndex">{getPositionNumber(index, timeLineModal.timline.length - 1 == index)} Swap</h2>
                    </div>

                    <h2 className="transactionDetail">{formatDate(new Date(swap.transactionTime))}</h2>
                    <h2 className="transactionDetail">
                      Status: <span>{formatTransactionStatus(swap.transactionStatus)}</span>
                    </h2>
                    {formatTransactionStatus(swap.transactionStatus) == 'Successful' && (
                      <h2 className="transactionDetail">
                        Amount Bought:
                        <span>
                          {' '}
                          {BigNumber(swap.amountBought)
                            .dividedBy(10 ** timeLineModal.buyToken.decimals)
                            .toString()}{' '}
                          {timeLineModal.buyToken.symbol}
                        </span>
                      </h2>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

