import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface AllowanceAmountResult { 'minAllowanceRequired' : bigint }
export interface CreatePositionArgs {
  'destination' : Principal,
  'swapsTime' : Array<bigint>,
  'sellToken' : Principal,
  'allowance' : bigint,
  'buyToken' : Principal,
  'amountPerSwap' : bigint,
}
export interface GetAllowanceArgs {
  'noOfSwaps' : bigint,
  'userPrincipal' : Principal,
  'sellToken' : Principal,
  'amountPerSwap' : bigint,
}
export interface Pair { 'sellToken' : Principal, 'buyToken' : Principal }
export interface Position {
  'destination' : Principal,
  'managerCanister' : Principal,
  'leftAllowance' : bigint,
  'positionStatus' : PositionStatus,
  'positionId' : PositionId,
  'initialAllowance' : bigint,
  'swaps' : Array<Transaction>,
  'tokens' : PositionTokens,
}
export type PositionCreationError = {
    'GenericError' : { 'message' : string }
  } |
  { 'TokenNotFound' : null } |
  {
    'WronmgAlloance' : {
      'expectedAllowance' : bigint,
      'inputAllowance' : bigint,
    }
  } |
  { 'PositionInThePast' : null } |
  {
    'AllowanceNotEnough' : {
      'expectedAllowance' : bigint,
      'receivedAllowance' : bigint,
    }
  } |
  { 'NotEnoughFee' : { 'receivedFee' : bigint, 'expectedFee' : bigint } } |
  { 'SwapsTooClose' : { 'message' : string } };
export type PositionId = bigint;
export type PositionStatus = { 'Active' : null } |
  { 'InActive' : null } |
  { 'Deleted' : null };
export interface PositionTokens {
  'sellToken' : Principal,
  'buyToken' : Principal,
}
export type Result = { 'ok' : Array<[Principal, bigint]> } |
  { 'err' : string };
export type Result_1 = { 'ok' : bigint } |
  { 'err' : PositionCreationError };
export interface Transaction {
  'transactionTime' : bigint,
  'step1' : [] | [string],
  'step2' : [] | [string],
  'step3' : [] | [string],
  'step4' : [] | [string],
  'step5' : [] | [string],
  'step6' : [] | [string],
  'amountBought' : [] | [bigint],
  'sellingAmount' : bigint,
  'transactionStatus' : TransactionStatus,
  'transactionId' : bigint,
}
export type TransactionFailureReason = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'InsufficientAllowance' : { 'allowance' : bigint } } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'CustomError' : string } |
  { 'Expired' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export type TransactionStatus = { 'Failed' : TransactionFailureReason } |
  { 'NotTriggered' : null } |
  { 'Successful' : null } |
  { 'Pending' : null };
export interface _SERVICE {
  'addPair' : ActorMethod<[Principal, Principal], string>,
  'createPosition' : ActorMethod<[CreatePositionArgs], Result_1>,
  'getAllPairs' : ActorMethod<[], Array<Pair>>,
  'getAllPositions' : ActorMethod<[], Array<Position>>,
  'getAllowanceForNewTrade' : ActorMethod<
    [GetAllowanceArgs],
    AllowanceAmountResult
  >,
  'getPositionsFor' : ActorMethod<
    [Principal, [] | [Principal], [] | [Principal], [] | [boolean]],
    Array<Position>
  >,
  'removePair' : ActorMethod<[Principal, Principal], string>,
  'retreiveCaller' : ActorMethod<[], Principal>,
  'retreiveTime' : ActorMethod<[], bigint>,
  'showPlatformIncome' : ActorMethod<[], Result>,
  'transferTokens' : ActorMethod<[Principal, Principal, bigint], string>,
  'withdrawFromSonic' : ActorMethod<[Principal, bigint], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: ({ IDL }: { IDL: IDL }) => IDL.Type[];
