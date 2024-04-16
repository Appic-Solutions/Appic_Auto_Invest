'use client';

import DcaCreation from '@/components/dcaCreation';
import DcaPositions from '@/components/dcaPositions';
import Title from '@/components/higerOrderComponents/titlesAndHeaders';
import WalletNotConnected from '@/components/walletNotConnectd';
import { findNetworkConfig } from '@/helper/helperFunc';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
export default function DCA() {
  //there are two dca stages the first one is dcaPositions for showing dca positions and the second one is dcaCreation for creating dca
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const [positionStatus, setPositionStatus] = useState('dca'); //dca,takeProfit,stopLoss ,active,inactive,
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleScreen = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    <div className={darkModeClassnamegenerator('dca__page')}>
      {/* <Title title={`Auto Invest`}>

            </Title> */}
      <div className="headerSwitcher">
        <div className="statusChanger">
          <button
            onClick={() => {
              setPositionStatus('dca');
            }}
            className={positionStatus == 'dca' ? 'active' : ''}
          >
            New
          </button>
          <button
            onClick={() => {
              setPositionStatus('active');
            }}
            className={positionStatus == 'active' ? 'active' : ''}
          >
            Active
          </button>
          <button
            onClick={() => {
              setPositionStatus('inactive');
            }}
            className={positionStatus == 'inactive' ? 'active' : ''}
          >
            History
          </button>
        </div>
      </div>

      {(positionStatus == 'active' || positionStatus == 'inactive') && <DcaPositions positionStatus={positionStatus}></DcaPositions>}

      {(positionStatus == 'dca' || positionStatus == 'takeProfit' || positionStatus == 'stopLoss') && (
        <DcaCreation setPositionStatus={setPositionStatus} />
      )}
    </div>
  );
}

