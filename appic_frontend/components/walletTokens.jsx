'use client';

import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import Title from './higerOrderComponents/titlesAndHeaders';
import WalletNotConnected from './walletNotConnectd';
import { useSelector } from 'react-redux';
import { formatSignificantNumber, formatDecimalValue } from '@/helper/number_formatter';

import LoadingComponent from './higerOrderComponents/loadingComponent';

// Chart imports
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as chartTitle, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import BigNumber from 'bignumber.js';

// Chart config
ChartJS.register(CategoryScale, ArcElement, LinearScale, BarElement, chartTitle, Tooltip, Legend);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
    },
    title: {
      position: 'bottom',
      display: true,
      text: 'Wallet Distribution',
    },
  },
};

const lightColorsPalette = [
  '#F15A24',
  '#ED1E79',
  '#592784',
  '#3B00B9', // Original colors
  '#FBB03B',
  '#932380',
];
const darkColorsPalette = [
  '#F15A24',
  '#ED1E79',
  '#592784',
  '#3B00B9', // Original colors
  '#FBB03B',
  '#932380',
];

// WalletTokens Component
function WalletTokens({ setEditMode }) {
  const isDark = useSelector((state) => state.theme.isDark);
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const principalID = useSelector((state) => state.wallet.items.principalID);
  const accoundID = useSelector((state) => state.wallet.items.accountID);
  const walletName = useSelector((state) => state.wallet.items.walletName);
  const assets = useSelector((state) => state.wallet.items.assets);
  const totalBalance = useSelector((state) => state.wallet.items.totalBalance);
  const loader = useSelector((state) => state.wallet.items.loader);

  const chartLiveData = {
    labels: assets.map((token) => token.symbol),

    datasets: [
      {
        label: 'USD value',
        data: assets.map((token) => token.usdBalance),
        backgroundColor: isDark ? darkColorsPalette : lightColorsPalette,
        borderColor: isDark ? '#000' : '#FFF',
        // color: isDark ? '#FFF' : '#000',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className={darkModeClassnamegenerator('walletTokens')}>
      <Title title="Wallet Tokens">
        {isWalletConnected && (
          <div className="wallet__totlaBalance">
            {/* <p className="balance__title">Balance on {findNetworkConfig(chainId).networkName}:</p> */}
            {/* <p className="balance__dolarAmount">∼${formatSignificantNumber(assets?.total_wallet_balance)}</p> */}
          </div>
        )}
      </Title>

      {/* assets card */}

      {!isWalletConnected && <WalletNotConnected></WalletNotConnected>}
      {isWalletConnected && (
        <>
          <div className="wallet__tokens">
            {loader && <LoadingComponent></LoadingComponent>}
            {!loader && (
              <>
                <div className="chart">
                  <Doughnut options={options} data={chartLiveData}></Doughnut>
                </div>
                <div className="assets_table">
                  <div className="header">
                    <h3 className="header__title">Token</h3>
                    <h3 className="header__title">Amount</h3>
                    <h3 className="header__title hiddenForMobile">Price</h3>
                    <h3 className="header__title">Value</h3>
                  </div>
                  {/* Assets table */}
                  {assets?.map((token) => {
                    return (
                      <div key={token?.id} className="token">
                        <div className="token__info">
                          <img src={token.logo} className="logo" alt={token.name} />
                          <div className="nameAndPrice">
                            <h4>{token.name}</h4>
                            <p className="hideForDesktop">${formatSignificantNumber(token.price)}</p>
                          </div>
                        </div>

                        <div className="token__amount">
                          <h3>{formatSignificantNumber(BigNumber(token.balance).dividedBy(10 ** token.decimals))}</h3>
                          <p>{token.coin_symbol}</p>
                        </div>

                        <div className="token__price">
                          <h3>${formatDecimalValue(token.price, 2)}</h3>
                        </div>

                        <div className="token__value">
                          <h3>${formatDecimalValue(token.usdBalance, 2)}</h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default WalletTokens;

