import { netWorkConfig } from "@/config/network";
// import { walletConfig } from "@/config/wallet";
// import { MetaMaskConnector } from "wagmi/connectors/metaMask";
// import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
// import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
// import { InjectedConnector } from "wagmi/connectors/injected";
// import {
//   mainnet,
//   polygon,
//   bsc,
//   arbitrum,
//   optimism,
//   avalanche,
//   fantom,
// } from "wagmi/chains";

// Create an object that maps conditions to connectors
// const connectorMap = {
//   walletconnect: new WalletConnectConnector({
//     options: {
//       projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECTID,
//       showQrModal: true,
//       metadata: {
//         name: "Alpha Vault",
//         description: "app.alphavault.io",
//         url: "https://alphavault.io",
//         icons: ["https://wagmi.sh/icon.png"],
//       },
//     },
//   }),
//   metamask: new MetaMaskConnector({}),
//   coinbase: new CoinbaseWalletConnector({}),
//   binance: new InjectedConnector({}),
//   trustwallet: new InjectedConnector({}),
// };
// Enum-like function to get a connector based on a condition
// export function getConnector(walletType) {
//   // const connector = connectorMap[walletType];
//   // return connector;
//   return new MetaMaskConnector({
//     chains: [mainnet, polygon, bsc, arbitrum, optimism, avalanche, fantom],
//   });
// }
// Create a utility function to find network configuration
export function findNetworkConfig(chainId) {
  return netWorkConfig.find((config) => config.networkId === chainId);
}
// // Create a utility function to find wallet configuration
// export function findWalletConfig(walletName) {
//   return walletConfig.find((config) => config.walletId === walletName);
// }
// function for formating walletAddress
export const formatAddress = (address) => {
  let newAddress = address?.substr(0, 6) + "..." + address?.substr(address?.length - 5);
  return newAddress;
};

//CHECK FOR SUPPORTIVE CHAIN
export const checkForSupportiveChains = (chainId) => {
  let supportedChainIds = [1, 10, 89, 137, 250, 42161, 43114];

  return supportedChainIds.includes(chainId);
};
