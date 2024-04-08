'use client';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { formatDecimalValue } from '@/helper/number_formatter';
import Link from 'next/link';
export default function DcaPositions({ positionStatus }) {
  const activeDcaPositions = [];
  const completedDcaPositions = [];
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
    </div>
  );
}

