'use client';
import { useEffect, useState } from 'react';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import WalletTokens from '@/components/walletTokens';

import { useDispatch, useSelector } from 'react-redux';
import LoadingComponent from '@/components/higerOrderComponents/loadingComponent';
import Sidebar from '@/components/sidebar';
import DCA from '@/components/dcaRoot';
export default function Home() {
  const dispatch = useDispatch();
  const [activeComponent, setActiveComponent] = useState('');

  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  return (
    <>
      <Sidebar setActiveComponent={setActiveComponent} activeComponent={activeComponent} />
      <main className={darkModeClassnamegenerator('mainPage')}>
        {isWalletConnected && (
          <>
            {activeComponent == '' && <WalletTokens />}
            {activeComponent == 'DCA' && <DCA></DCA>}
          </>
        )}
      </main>
      ;
    </>
  );
}

