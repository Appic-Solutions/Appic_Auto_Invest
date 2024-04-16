import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import externalLinks from '@/utils/externalLinks';
import axios from 'axios';
import { initIcpPrice } from '@/redux/features/icpPrice';

export const useIcpPrice = () => {
  const dispatch = useDispatch();
  const [icpPriceError, setIcpPrcieError] = useState(null);
  useEffect(() => {
    // Fetch all tokens from sonic canister

    async function getIcpPrice() {
      try {
        const response = await axios.get(externalLinks.icpPriceEndpoint);
        // Save to App's stroe
        dispatch(initIcpPrice(response.data.price));
      } catch (error) {
        console.log(error);
        setIcpPrcieError(error);
      }
    }
    getIcpPrice();
    return () => {};
  }, []);
  return { icpPriceError };
};

