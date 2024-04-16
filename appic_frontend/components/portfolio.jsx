'use client';
import { formatAccountId, formatAddress } from '@/helper/helperFunc';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import { useDispatch, useSelector } from 'react-redux';
import { useState, React } from 'react';
import { useRouter } from 'next/navigation';
import WalletNotConnected from './walletNotConnectd';
import { formatDecimalValue, formatSignificantNumber } from '@/helper/number_formatter';
import canistersIDs from '@/config/canistersIDs';

function Portfolio() {
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const dispatch = useDispatch();

  const isDark = useSelector((state) => state.theme.isDark);
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const principalID = useSelector((state) => state.wallet.items.principalID);
  const accoundID = useSelector((state) => state.wallet.items.accountID);
  const walletName = useSelector((state) => state.wallet.items.walletName);
  const assets = useSelector((state) => state.wallet.items.assets);
  const totalBalance = useSelector((state) => state.wallet.items.totalBalance);

  // Helper Functions
  const GetICPBalance = () => {
    const balances = {
      usdBalance: 0,
      balance: 0,
    };
    const icpToken = assets.find((token) => token.id == canistersIDs.NNS_ICP_LEDGER);
    if (icpToken) {
      balances.usdBalance = formatDecimalValue(icpToken.usdBalance, 2);
      balances.balance = formatSignificantNumber(Number(icpToken.balance) / 10 ** 8);
    }
    return balances;
  };

  return (
    <div className={darkModeClassnamegenerator('portfolio')}>
      {isWalletConnected ? (
        <div className="portfolio__box">
          {/* <img
            src="/refreshButton.svg"
            //  onClick={refreshUserAssets}
            className="refreshButton"
            alt=""
          /> */}
          <div className="collapseContainer">
            <div className="addressActions">
              <div className="avatarImage"></div>
              <div className="addressContainer">
                <div className="addressWithCopy">
                  <h1 className="address">
                    <span>Principal ID:</span> {formatAddress(principalID)}
                  </h1>
                  <div className="copyAddress">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbUlEQVR4nGNgGDagxXa+d7Ptwictdgv/k4MZCFuw4DG5hrcQZQGxCskFdLeghdw4sQUF9QJPIiygKE4eEbaAzCBrwaVv1AIYGA0igmA0iAgCmpeuLYPHAlsqF3boAFTkkmnJo2b7+R4YBg5ZAADgA5UsbuklBAAAAABJRU5ErkJggg==" />
                  </div>
                </div>
                <div className="addressWithCopy">
                  <h1 className="address">
                    <span>Accound ID:</span> {formatAccountId(accoundID)}
                  </h1>
                  <div className="copyAddress">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbUlEQVR4nGNgGDagxXa+d7Ptwictdgv/k4MZCFuw4DG5hrcQZQGxCskFdLeghdw4sQUF9QJPIiygKE4eEbaAzCBrwaVv1AIYGA0igmA0iAgCmpeuLYPHAlsqF3boAFTkkmnJo2b7+R4YBg5ZAADgA5UsbuklBAAAAABJRU5ErkJggg==" />
                  </div>
                </div>
              </div>
            </div>
            <div className="titleContainer">
              <div className="description">
                <p>Total Balance</p>
              </div>
              <div className="balance">
                <span>$</span>
                <h1>{formatSignificantNumber(totalBalance)}</h1>
              </div>
            </div>
            <div className="titleContainer">
              <div className="description">
                <p>ICP Balance</p>
                <img className="chainIMG" src="https://cdn.sonic.ooo/icons/ryjl3-tyaaa-aaaaa-aaaba-cai" alt="" />
              </div>

              <div className="balance">
                <h1>{GetICPBalance().balance}</h1>
              </div>
            </div>
            <div className="titleContainer">
              <div className="description">
                <p>ICP USD Balance</p>
                <img className="chainIMG" src="https://cdn.sonic.ooo/icons/ryjl3-tyaaa-aaaaa-aaaba-cai" alt="" />
              </div>

              <div className="balance">
                <span>$</span>
                <h1>{GetICPBalance().usdBalance}</h1>
              </div>
            </div>
            <div className="chartContainer"></div>
          </div>

          {/* Upper container */}
        </div>
      ) : (
        <WalletNotConnected />
      )}
    </div>
  );
}

export default Portfolio;

