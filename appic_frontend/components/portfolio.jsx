'use client';
import { formatAccountId, formatAddress } from '@/helper/helperFunc';
import darkModeClassnamegenerator from '@/utils/darkClassGenerator';
import { useDispatch, useSelector } from 'react-redux';
import { useState, React } from 'react';
import { useRouter } from 'next/navigation';
import WalletNotConnected from './walletNotConnectd';
import { formatDecimalValue, formatSignificantNumber } from '@/helper/numberFormatter';
import { artemisWalletAdapter } from '@/utils/walletConnector';
import canistersIDs from '@/config/canistersIDs';

// Chart Imports and config
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
ChartJS.register(CategoryScale, ArcElement, LinearScale, BarElement, Title, Tooltip, Legend);
export const data = {
  // labels: ['token'],

  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ],
};
export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: 'bottom',
    },
    title: {
      position: 'bottom',
      display: true,
      text: 'Tokens USD Balance',
    },
  },
};

function Portfolio() {
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const lightColorsPalette = [
    '#22092C',
    '#872341',
    '#BE3144',
    '#F05941', // Original colors
    '#A1D2CE',
    '#809BCE',
    '#95B8D1',
    '#B8E0D2', // Dummy light theme colors
    '#E8DDB5',
    '#FAE0E4',
  ];
  const darkColorsPalette = [
    '#F24C3D',
    '#940B92',
    '#8E8FFA',
    '#FDEBED', // Original colors
    '#4D5061',
    '#5C80BC',
    '#112D4E',
    '#3F72AF', // Dummy dark theme colors
    '#DBE2EF',
    '#F9F7F7',
  ];
  const dispatch = useDispatch();

  const isDark = useSelector((state) => state.theme.isDark);
  const isWalletConnected = useSelector((state) => state.wallet.items.isWalletConnected);
  const principalID = useSelector((state) => state.wallet.items.principalID);
  const accoundID = useSelector((state) => state.wallet.items.accountID);
  const walletName = useSelector((state) => state.wallet.items.walletName);
  const assets = useSelector((state) => state.wallet.items.assets);
  const totalBalance = useSelector((state) => state.wallet.items.totalBalance);

  const data = {
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
                <img className="chainIMG" src={artemisWalletAdapter.wallets[0].icon} alt="" />
              </div>

              <div className="balance">
                <h1>{GetICPBalance().balance}</h1>
              </div>
            </div>
            <div className="titleContainer">
              <div className="description">
                <p>ICP USD Balance</p>
                <img className="chainIMG" src={artemisWalletAdapter.wallets[0].icon} alt="" />
              </div>

              <div className="balance">
                <span>$</span>
                <h1>{GetICPBalance().usdBalance}</h1>
              </div>
            </div>
            <div className="chartContainer">
              <Doughnut options={options} width={150} data={data}></Doughnut>
            </div>
          </div>

          {/* Upper container */}
          <div className={`upperContainer ${isExpanded ? '' : 'hideItem'}     `}>
            {/* first part */}
            <div className="walletActions">
              <div className="addressActions">
                <div className="avatarImage"></div>
                <div className="addressContainer">
                  <h1 className="address">{formatAddress(principalID)}</h1>
                  <div className="copyAddress">
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAbUlEQVR4nGNgGDagxXa+d7Ptwictdgv/k4MZCFuw4DG5hrcQZQGxCskFdLeghdw4sQUF9QJPIiygKE4eEbaAzCBrwaVv1AIYGA0igmA0iAgCmpeuLYPHAlsqF3boAFTkkmnJo2b7+R4YBg5ZAADgA5UsbuklBAAAAABJRU5ErkJggg==" />
                  </div>
                </div>
              </div>

              <div className="actions">
                <div className="action">
                  <div className="imgContainer">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                      <path d="M403.8 34.4c12-5 25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V160H352c-10.1 0-19.6 4.7-25.6 12.8L284 229.3 244 176l31.2-41.6C293.3 110.2 321.8 96 352 96h32V64c0-12.9 7.8-24.6 19.8-29.6zM164 282.7L204 336l-31.2 41.6C154.7 401.8 126.2 416 96 416H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96c10.1 0 19.6-4.7 25.6-12.8L164 282.7zm274.6 188c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V416H352c-30.2 0-58.7-14.2-76.8-38.4L121.6 172.8c-6-8.1-15.5-12.8-25.6-12.8H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96c30.2 0 58.7 14.2 76.8 38.4L326.4 339.2c6 8.1 15.5 12.8 25.6 12.8h32V320c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64z" />
                    </svg>
                  </div>
                  <p>Swap</p>
                </div>
                <div className="action" onClick={() => router.push('/nuke-button')}>
                  <div className="imgContainer">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                      <path d="M32 96l320 0V32c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6V160L32 160c-17.7 0-32-14.3-32-32s14.3-32 32-32zM480 352c17.7 0 32 14.3 32 32s-14.3 32-32 32H160v64c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-96-96c-6-6-9.4-14.1-9.4-22.6s3.4-16.6 9.4-22.6l96-96c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 64H480z" />
                    </svg>
                  </div>

                  <p>Nuke</p>
                </div>
                <div className="action">
                  <div className="imgContainer">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                      <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
                    </svg>
                  </div>
                  <p>Buy/Sell</p>
                </div>
                <div className="action">
                  <div className="imgContainer">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                      <path d="M304.083 405.907c4.686 4.686 4.686 12.284 0 16.971l-44.674 44.674c-59.263 59.262-155.693 59.266-214.961 0-59.264-59.265-59.264-155.696 0-214.96l44.675-44.675c4.686-4.686 12.284-4.686 16.971 0l39.598 39.598c4.686 4.686 4.686 12.284 0 16.971l-44.675 44.674c-28.072 28.073-28.072 73.75 0 101.823 28.072 28.072 73.75 28.073 101.824 0l44.674-44.674c4.686-4.686 12.284-4.686 16.971 0l39.597 39.598zm-56.568-260.216c4.686 4.686 12.284 4.686 16.971 0l44.674-44.674c28.072-28.075 73.75-28.073 101.824 0 28.072 28.073 28.072 73.75 0 101.823l-44.675 44.674c-4.686 4.686-4.686 12.284 0 16.971l39.598 39.598c4.686 4.686 12.284 4.686 16.971 0l44.675-44.675c59.265-59.265 59.265-155.695 0-214.96-59.266-59.264-155.695-59.264-214.961 0l-44.674 44.674c-4.686 4.686-4.686 12.284 0 16.971l39.597 39.598zm234.828 359.28l22.627-22.627c9.373-9.373 9.373-24.569 0-33.941L63.598 7.029c-9.373-9.373-24.569-9.373-33.941 0L7.029 29.657c-9.373 9.373-9.373 24.569 0 33.941l441.373 441.373c9.373 9.372 24.569 9.372 33.941 0z" />
                    </svg>
                  </div>
                  <p>Disconnect</p>
                </div>
                {/* <button className='action'>
                        Transfer
                    </button>
                    <button className='action'>
                        Edit Portfolio
                    </button> */}
              </div>
            </div>

            {/* second part */}
            <div className="portfolio__totalBalance">
              <div className="totalbalance__container">
                <div>
                  <div className="description">
                    <p>Total Balance</p>
                  </div>
                  <div className="balance">
                    <span>$</span>
                    <h1>{formatSignificantNumber(totalBalance)}</h1>
                  </div>
                </div>
                <div>
                  <div className="description">
                    <p>ICP Balance</p>
                    <img className="chainIMG" src={artemisWalletAdapter.wallets[0].icon} alt="" />
                  </div>

                  <div className="balance">
                    <h1>{GetICPBalance().balance}</h1>
                  </div>
                </div>
                <div>
                  <div className="description">
                    <p>ICP $ Balance</p>
                    <img className="chainIMG" src={artemisWalletAdapter.wallets[0].icon} alt="" />
                  </div>

                  <div className="balance">
                    <span>$</span>
                    <h1>{GetICPBalance().usdBalance}</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <WalletNotConnected />
      )}
    </div>
  );
}

export default Portfolio;

