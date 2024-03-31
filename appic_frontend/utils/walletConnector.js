import { Artemis } from "artemis-web3-adapter";
import { BatchTransact } from "artemis-web3-adapter";
import { SONICSWAP_IDL } from "artemis-web3-adapter/src/did/sonixswap.idl";
import { ICRC1_IDL } from "artemis-web3-adapter/src/did/icrc1.idl";
import { Principal } from "@dfinity/principal";
const connectObj = { whitelist: [""], host: "https://icp0.io/" };

export const artemisWalletAdapter = new Artemis(connectObj);
// export const transactions = {
//   initGetAcc1: {
//     canisterId: "3xwpq-ziaaa-aaaah-qcn4a-cai",
//     idl: SONICSWAP_IDL,
//     methodName: "initiateICRC1Transfer",
//     updateNextStep: (trxResult, nextTrxItem) => {
//       nextTrxItem.args[0].to.subaccount = [trxResult];
//     },
//     onSuccess: () => {
//       console.log("Succ");
//     },
//     onFail: () => {
//       console.log("Fail");
//     },
//     args: [],
//   },
//   deposit: {
//     canisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
//     idl: ICRC1_IDL,
//     methodName: "icrc1_transfer1",
//     args: [
//       {
//         to: { owner: Principal.fromText("3xwpq-ziaaa-aaaah-qcn4a-cai"), subaccount: [] },
//         fee: [],
//         memo: [],
//         amount: BigInt(0),
//         from_subaccount: [],
//         created_at_time: [],
//       },
//     ],
//   },
// };

// export const batchTransactionObject = new BatchTransact(transactions, artemisWalletAdapter);

// const resp = await batchTransactionObject.execute();
