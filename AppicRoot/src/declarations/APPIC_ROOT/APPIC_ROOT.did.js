export const idlFactory = ({ IDL }) => {
  const GetAllowanceArgs = IDL.Record({
    'noOfSwaps' : IDL.Nat,
    'userPrincipal' : IDL.Principal,
    'sellToken' : IDL.Principal,
    'amountPerSwap' : IDL.Nat,
  });
  const CreatePositionsArgs = IDL.Record({
    'destination' : IDL.Principal,
    'swapsTime' : IDL.Vec(IDL.Nat),
    'sellToken' : IDL.Principal,
    'allowance' : IDL.Nat,
    'buyToken' : IDL.Principal,
    'amountPerSwap' : IDL.Nat,
  });
  const PositionCreationError = IDL.Variant({
    'GenericError' : IDL.Record({ 'message' : IDL.Text }),
    'TokenNotFound' : IDL.Null,
    'WronmgAlloance' : IDL.Record({
      'expectedAllowance' : IDL.Nat,
      'inputAllowance' : IDL.Nat,
    }),
    'PositionInThePast' : IDL.Null,
    'AllowanceNotEnough' : IDL.Record({
      'expectedAllowance' : IDL.Nat,
      'receivedAllowance' : IDL.Nat,
    }),
    'NotEnoughFee' : IDL.Record({
      'receivedFee' : IDL.Nat,
      'expectedFee' : IDL.Nat,
    }),
  });
  const Result_1 = IDL.Variant({
    'ok' : IDL.Nat,
    'err' : PositionCreationError,
  });
  const Pair = IDL.Record({
    'sellToken' : IDL.Principal,
    'buyToken' : IDL.Principal,
  });
  const PositionStatus = IDL.Variant({
    'Active' : IDL.Null,
    'InActive' : IDL.Null,
    'Deleted' : IDL.Null,
  });
  const PositionId = IDL.Nat64;
  const TransactionFailureReason = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'InsufficientAllowance' : IDL.Record({ 'allowance' : IDL.Nat }),
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'CustomError' : IDL.Text,
    'Expired' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const TransactionStatus = IDL.Variant({
    'Failed' : TransactionFailureReason,
    'NotTriggered' : IDL.Null,
    'Successful' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const Transaction = IDL.Record({
    'transactionTime' : IDL.Int,
    'step1' : IDL.Opt(IDL.Text),
    'step2' : IDL.Opt(IDL.Text),
    'step3' : IDL.Opt(IDL.Text),
    'step4' : IDL.Opt(IDL.Text),
    'step5' : IDL.Opt(IDL.Text),
    'step6' : IDL.Opt(IDL.Text),
    'amountBought' : IDL.Opt(IDL.Nat),
    'sellingAmount' : IDL.Nat,
    'transactionStatus' : TransactionStatus,
    'transactionId' : IDL.Nat,
  });
  const PositionTokens = IDL.Record({
    'sellToken' : IDL.Principal,
    'buyToken' : IDL.Principal,
  });
  const Position = IDL.Record({
    'destination' : IDL.Principal,
    'managerCanister' : IDL.Principal,
    'positionStatus' : PositionStatus,
    'positionId' : PositionId,
    'swaps' : IDL.Vec(Transaction),
    'tokens' : PositionTokens,
    'allowance' : IDL.Nat,
  });
  const AllowanceAmountResult = IDL.Record({
    'minAllowanceForPositionCreation' : IDL.Nat,
    'minAllowanceForApproveFunction' : IDL.Nat,
  });
  return IDL.Service({
    'addPair' : IDL.Func([IDL.Principal, IDL.Principal], [IDL.Text], []),
    'calculateFee' : IDL.Func([GetAllowanceArgs], [IDL.Nat], []),
    'createPosition' : IDL.Func([CreatePositionsArgs], [Result_1], []),
    'getAllPairs' : IDL.Func([], [IDL.Vec(Pair)], []),
    'getAllPositions' : IDL.Func([], [IDL.Vec(Position)], ['query']),
    'getAllowanceForNewTrade' : IDL.Func(
        [GetAllowanceArgs],
        [AllowanceAmountResult],
        [],
      ),
    'getPositionsFor' : IDL.Func(
        [
          IDL.Principal,
          IDL.Opt(IDL.Principal),
          IDL.Opt(IDL.Principal),
          IDL.Opt(IDL.Bool),
        ],
        [IDL.Vec(Position)],
        ['query'],
      ),
    'removePair' : IDL.Func([IDL.Principal, IDL.Principal], [IDL.Text], []),
    'retreiveCaller' : IDL.Func([], [IDL.Principal], []),
    'retreiveTime' : IDL.Func([], [IDL.Int], []),
    'transferTokens' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [IDL.Text],
        [],
      ),
    'withdrawFromSonic' : IDL.Func([IDL.Principal, IDL.Nat], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
