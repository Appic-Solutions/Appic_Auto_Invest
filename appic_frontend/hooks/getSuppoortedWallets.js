import { useCallback, useEffect, useState } from 'react';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import { useDispatch } from 'react-redux';
import { intiWallets } from '@/redux/features/supportedWallets';

export const useSupportedWallets = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    // Fetch all tokens from sonic canister
    let allWallets = artemisWalletAdapter.wallets;
    console.log(allWallets);
    //  save
    dispatch(intiWallets(allWallets));

    return () => {};
  }, []);
  return {};
};

