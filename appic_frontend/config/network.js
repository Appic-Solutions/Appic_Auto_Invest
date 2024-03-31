export const netWorkConfig = [
  {
    networkName: 'Ethereum',
    networkId: 1,
    netWorkIdForMorallis: '0x1',
    symbol: 'ETH',
    networkLogo: '/assets/images/chains/ethereum.svg',
    contractAddress: '0xc62cf7aF3CB61FedEfaF135c5a7b52f6AC265e76', //AlphaVault custom Vault smart contract
    baseCurrencyAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    dcaContractAddress: '',
    rangoName: 'ETH',
    zeroXName: 'eth',
  },
  {
    networkName: 'Polygon',
    networkId: 137,
    netWorkIdForMorallis: '0x89',
    symbol: 'MATIC',
    networkLogo: '/assets/images/chains/polygon.svg',
    contractAddress: '0xC444435677D859DB1520d59E00557258b20Df8d8', // AlphaVault smart Contract
    baseCurrencyAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    dcaContractAddress: '0x75D046313b917504e899d45c4ddD3e1fFb8CC8ae',
    rangoName: 'POLYGON',
    zeroXName: 'polygon',
  },
  {
    networkName: 'BSC',
    networkId: 56,
    netWorkIdForMorallis: '0x38',
    symbol: 'BNB',
    networkLogo: '/assets/images/chains/bsc.svg',
    contractAddress: '0x3065F648aAA6Df32Ef0223716411C73C1808DF95', // AlphaVault smart Contract
    baseCurrencyAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    dcaContractAddress: '0x75D046313b917504e899d45c4ddD3e1fFb8CC8ae',
    rangoName: 'BSC',
    zeroXName: 'bsc',
  },
  {
    networkName: 'Arbitrum',
    networkId: 42161,
    netWorkIdForMorallis: '0xa4b1',
    symbol: 'AETH',
    networkLogo: '/assets/images/chains/arbitrum.svg',
    contractAddress: '0x2847efCF4Ac0D239A431697d0B7ABf6db90CA730',
    baseCurrencyAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    dcaContractAddress: '0x3dAEDf91384Df6922d34dFD02f95fCFeDBB646F1',
    rangoName: 'ARBITRUM',
    zeroXName: 'arbitrum',
  },
  // {
  //   networkName: "Optimism",
  //   networkId: 10,
  //   netWorkIdForMorallis: "0xa",
  //   symbol: "OP",
  //   networkLogo: "/assets/images/chains/optimism.svg",
  //   contractAddress: "0xc62cf7aF3CB61FedEfaF135c5a7b52f6AC265e76",
  //   baseCurrencyAddress: "0x4200000000000000000000000000000000000006",
  //   dcaContractAddress: ""

  // },
  {
    networkName: 'Avalanche',
    networkId: 43114,
    netWorkIdForMorallis: '0xa86a',
    symbol: 'AVAX',
    networkLogo: '/assets/images/chains/avalanche.svg',
    contractAddress: '0xA16FFA7274bfF034364f86cDB69BE7e1eBBeC334',
    baseCurrencyAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    dcaContractAddress: '0x75D046313b917504e899d45c4ddD3e1fFb8CC8ae',
    rangoName: 'AVAX_CCHAIN',
    zeroXName: 'avalanche',
  },
  {
    networkName: 'Fantom',
    networkId: 250,
    netWorkIdForMorallis: '0xfa',
    symbol: 'FTM',
    networkLogo: '/assets/images/chains/fantom.svg',
    contractAddress: '0xA16FFA7274bfF034364f86cDB69BE7e1eBBeC334',
    baseCurrencyAddress: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',
    dcaContractAddress: '0x75D046313b917504e899d45c4ddD3e1fFb8CC8ae',
    rangoName: 'FANTOM',
    zeroXName: 'fantom',
  },
];

export function getNetworkById(chainId) {
  return netWorkConfig.find((id) => {
    return id.networkId == Number(chainId);
  });
}

