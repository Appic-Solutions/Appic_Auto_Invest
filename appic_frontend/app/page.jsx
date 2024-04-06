'use client';
import { useEffect, useState } from 'react';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import WalletTokens from '@/components/walletTokens';

import { useDispatch, useSelector } from 'react-redux';
import LoadingComponent from '@/components/higerOrderComponents/loadingComponent';
import { changePageTitle } from '@/redux/features/pageData';
export default function Home() {
  const dispatch = useDispatch();
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);

  return <main className={darkModeClassnamegenerator('mainPage')}>{isWalletConnected && <WalletTokens />}</main>;
}

