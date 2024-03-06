import dcaTypes "dcaTypes";
import icrcTypes "icrcTypes";
import utils "utils";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import { recurringTimer } = "mo:base/Timer";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Int "mo:base/Int";

actor AlphavaultRoot {
  // Auto invest Types
  type PositionId = dcaTypes.PositionId;
  type TransactionStatus = dcaTypes.TransactionStatus;
  type PositionStatus = dcaTypes.PositionStatus;
  type PositionTokens = dcaTypes.PositionTokens;
  type Transaction = dcaTypes.Transaction;
  type Position = dcaTypes.Position;
  type CreatePositionsArgs = dcaTypes.CreatePositionsArgs;
  type Result_1 = dcaTypes.Result_1;

  // Token canister(ICRC2) types
  type ICRCTransferError = icrcTypes.ICRCTransferError;
  type ICRCTokenTxReceipt = icrcTypes.ICRCTokenTxReceipt;
  type ICRCMetaDataValue = icrcTypes.ICRCMetaDataValue;
  type ICRCAccount = icrcTypes.ICRCAccount;
  type Subaccount = icrcTypes.Subaccount;
  type ICRC2TransferArg = icrcTypes.ICRC2TransferArg;
  type ICRCTransferArg = icrcTypes.ICRCTransferArg;
  type ICRC2TokenActor = icrcTypes.ICRC2TokenActor;
  type ICRC2AllowanceArgs = icrcTypes.ICRC2AllowanceArgs;
  type ICRC2Allowance = icrcTypes.ICRC2Allowance;

  // Buffer for keeping active positions
  let activePositions = Buffer.Buffer<Position>(0);

  // public type TxReceipt = Result.Result<Nat, Text>;

  // let SonicDex = actor ("3xwpq-ziaaa-aaaah-qcn4a-cai") : actor {
  //   deposit : shared (Principal, Nat) -> async TxReceipt;
  //   initiateICRC1Transfer : shared () -> async Blob;

  // };
  // public type Result = { #Ok : Nat; #Err : TransferError };
  // public type Account = { owner : Principal; subaccount : ?Blob };
  // public type TransferError = {
  //   #GenericError : { message : Text; error_code : Nat };
  //   #TemporarilyUnavailable;
  //   #BadBurn : { min_burn_amount : Nat };
  //   #Duplicate : { duplicate_of : Nat };
  //   #BadFee : { expected_fee : Nat };
  //   #CreatedInFuture : { ledger_time : Nat64 };
  //   #TooOld;
  //   #InsufficientFunds : { balance : Nat };
  // };
  // public type TransferArg = {
  //   to : Account;
  //   fee : ?Nat;
  //   memo : ?Blob;
  //   from_subaccount : ?Blob;
  //   created_at_time : ?Nat64;
  //   amount : Nat;
  // };
  // let ICP_Ledger = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai") : actor {
  //   icrc1_transfer : shared TransferArg -> async Result;

  // };

  // public shared func depositToSonic(amount : Nat) : async TxReceipt {
  //   let result = await SonicDex.deposit(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"), amount);
  //   return result;
  // };

  // public shared func transferToSonic(amount : Nat) : async Text {
  //   let toSubAccount = await SonicDex.initiateICRC1Transfer();
  //   let transferResult = await ICP_Ledger.icrc1_transfer({
  //     to = {
  //       owner = Principal.fromText("3xwpq-ziaaa-aaaah-qcn4a-cai");
  //       subaccount = ?toSubAccount;
  //     };
  //     fee = null;
  //     memo = null;
  //     created_at_time = null;
  //     amount;
  //     from_subaccount = null;
  //   });
  //   switch (transferResult) {
  //     case (#Err error) {
  //       switch (error) {
  //         case (#BadFee { expected_fee }) {
  //           return "Bad fee" # Nat.toText(expected_fee);
  //         };
  //         case (#BadBurn { min_burn_amount }) {
  //           return "Bad Burn min burn amount :" # Nat.toText(min_burn_amount);
  //         };
  //         case (#InsufficientFunds { balance }) {
  //           return "Insufficient Funds Balance: " # Nat.toText(balance);
  //         };

  //         case (#TooOld) {
  //           return "Too old";
  //         };
  //         case (#CreatedInFuture { ledger_time }) {
  //           return "CreatedInFuture" # Nat64.toText(ledger_time);
  //         };
  //         case (#Duplicate { duplicate_of }) {
  //           return "Duplicate" # Nat.toText(duplicate_of);
  //         };
  //         case (#TemporarilyUnavailable) {
  //           return "TemporarilyUnavailable";
  //         };
  //         case (#GenericError { error_code; message }) {
  //           return "GenericError" # message;
  //         };
  //         case _ { return "Unknow Error" };
  //       };
  //     };
  //     case (#Ok BlockNumber) {
  //       return "Successful" # Nat.toText(BlockNumber);
  //     };
  //   };
  // };

  // public shared func initiateICRC1transfer() : async Blob {
  //   let result = await SonicDex.initiateICRC1Transfer();
  //   return result;
  // };

  // Add Auto invest position
  stable var nextPositionId : PositionId = 0;
  public func checkActor(canisterId : Principal) : async Text {
    let tokenCanister : ICRC2TokenActor = icrcTypes._getTokenActor(canisterId);
    return await tokenCanister.icrc1_name();
  };
  public shared func createPosition(createPositionArgs : CreatePositionsArgs) : async Result_1 {
    // TODO : check if input tokens are supported
    // TODO : Check to see if allowance covers all Fees
    // Check to see if allwance is valid
    // Get users Allowance
    let tokenCanister : ICRC2TokenActor = icrcTypes._getTokenActor(createPositionArgs.sellToken);
    let allowanceArgs : ICRC2AllowanceArgs = {
      account = {
        owner = createPositionArgs.destination;
        subaccount = null;
      };
      spender = {
        owner = Principal.fromActor(AlphavaultRoot);
        subaccount = null;
      };
    };
    let userAllowance : ICRC2Allowance = await tokenCanister.icrc2_allowance(allowanceArgs);

    // Check to see if user has more than one transaction with the same selling token
    let userAlreadyExsistingPositions : [Position] = _getPositionsFor(createPositionArgs.destination, ?createPositionArgs.sellToken, null);
    var userMinExpectedAllowance = 0;
    if (userAlreadyExsistingPositions.size() > 0) {
      for (userPosition in userAlreadyExsistingPositions.vals()) {
        userMinExpectedAllowance += userPosition.allowance;
      };
      userMinExpectedAllowance += createPositionArgs.allowance;
    } else {
      userMinExpectedAllowance += createPositionArgs.allowance;
    };

    if (userMinExpectedAllowance > userAllowance.allowance) {
      return (#err(#WronmgAlloance { expectedAllowance = userMinExpectedAllowance; receivedAllowance = userAllowance.allowance }));
    };

    // TODO : check if allowance is enough to cover fees

    // TODO : check if entered unix swap times are not in the past

    // Create [Transactions] Array for newPosition's swaps parameter
    var nextTransactionid : Nat = 0;
    let transactionsArray = Array.map<Nat, Transaction>(
      createPositionArgs.swapsTime,
      func(swapTime : Nat) : Transaction {
        nextTransactionid += 1;
        return {
          transactionId = nextTransactionid - 1;
          transactionTime = swapTime; // UNIX format
          transactionStatus = #NotTriggered;
          sellingAmount = createPositionArgs.amountPerSwap;
          amountBought = null; // Before transactionTime the value will be null
        };
      },
    );

    // Create newPositions object
    let newPosition : Position = {
      positionId = nextPositionId;
      tokens = {
        sellToken = createPositionArgs.sellToken;
        buyToken = createPositionArgs.buyToken;
      };
      destination = createPositionArgs.destination; // Bought tokens final destination
      swaps = transactionsArray; // Array that contains all swaps, each of them with specific time
      positionStatus = #Open;
      allowance = createPositionArgs.allowance;
    };
    // Save created new position arg
    // Check if user principal already existes in hashmap

    activePositions.add(newPosition);

    return #ok(1);
  };

  // Get all active positions
  public shared query func getAllPositions() : async [Position] {
    return Buffer.toArray(activePositions);
  };

  // Get active positions by principal id of a specific user public
  public shared query func getPositionsFor(userPrincipal : Principal, sellToken : ?Principal, buyToken : ?Principal) : async [Position] {
    let filteredByPrincipal = Buffer.mapFilter<Position, Position>(
      activePositions,
      func(position : Position) {
        if (position.destination == userPrincipal) {
          return ?position;
        } else {
          return null;
        };
      },
    );

    // Filter by buying token
    switch (sellToken) {
      case (null) {};
      case (?sellingToken) {
        filteredByPrincipal.filterEntries(func(_, position : Position) { position.tokens.sellToken == sellingToken });
      };
    };

    // Filter by selling token
    switch (buyToken) {
      case (null) {};
      case (?buyingToken) {
        filteredByPrincipal.filterEntries(func(_, position : Position) { position.tokens.buyToken == buyingToken });
      };
    };

    return Buffer.toArray(filteredByPrincipal);
  };

  // Get active positions by principal id of a specific user and if token id is provided result should be filtered by token id
  private func _getPositionsFor(userPrincipal : Principal, sellToken : ?Principal, buyToken : ?Principal) : [Position] {
    let filteredByPrincipal = Buffer.mapFilter<Position, Position>(
      activePositions,
      func(position : Position) {
        if (position.destination == userPrincipal) {
          return ?position;
        } else {
          return null;
        };
      },
    );

    // Filter by buying token
    switch (sellToken) {
      case (null) {};
      case (?sellingToken) {
        filteredByPrincipal.filterEntries(func(_, position : Position) { position.tokens.sellToken == sellingToken });
      };
    };

    // Filter by selling token
    switch (buyToken) {
      case (null) {};
      case (?buyingToken) {
        filteredByPrincipal.filterEntries(func(_, position : Position) { position.tokens.buyToken == buyingToken });
      };
    };

    return Buffer.toArray(filteredByPrincipal);
  };

  public func retreiveTime() : async Int {
    return utils.nanoToSecond(Time.now());
  };

  // Timer function for triggering the swap on time
  // Runs every one hour and checks the transactionTime value of each transaction
  // If current time in unix format is bigger than transactionTime and transactionStauts is #notTriggered, it will trigger a new swap transaction

  private func _proccedTransaction(
    userPosition : Position,
    transaction : Transaction,
    positionIndex : Nat,
    transactionIndex : Nat,
  ) : () {

    // TODO: Trade logic

    // Save new user positions with updated transaction

    // Generate the new transaction object
    let newTransaction : Transaction = {
      transactionId = transaction.transactionId;
      transactionStatus = #Successful;
      transactionTime = transaction.transactionTime;
      sellingAmount = transaction.sellingAmount;
      amountBought = null;
    };

    let newTransactionsArray = Buffer.fromArray<Transaction>(userPosition.swaps);
    newTransactionsArray.put(transactionIndex, newTransaction);

    //
    let newPosition : Position = {
      allowance = userPosition.allowance;
      destination = userPosition.destination;
      positionId = userPosition.positionId;
      // TODO : Write the logic for changing the position status to successful or faild
      positionStatus = userPosition.positionStatus;
      tokens = userPosition.tokens;
      swaps = Buffer.toArray(newTransactionsArray);
    };

    // Save updated Positions into active position buffer
    activePositions.put(positionIndex, newPosition)

  };

  let Seconds = 60; // Number of seconds in one hour

  private func cronTimer() : async () {
    // Create a clone of buffer to iterate over to prevent errors while updating the main buffer
    let positionsToIteratreOver = Buffer.clone(activePositions);
    var positionIndex = 0;

    // Iterating over all active posittions
    for (userPosition in positionsToIteratreOver.vals()) {
      var transactionIndex = 0;
      // Iterating over transactions of a poisition
      for (transaction in userPosition.swaps.vals()) {
        // Checking the transaction status
        switch (transaction.transactionStatus) {
          // If the transaction has not been triggered and the unix time is less or equla to time.now() the transaction should be triggered
          case (#NotTriggered) {
            if (transaction.transactionTime <= utils.nanoToSecond(Time.now())) {
              _proccedTransaction(userPosition, transaction, positionIndex, transactionIndex);
            };
          };
          case _ {};
        };
        transactionIndex += 1;
      };
      positionIndex += 1;
    };
  };

  ignore recurringTimer(#seconds Seconds, cronTimer);

  // Pre-upgrade logic
  stable var usersPositionsArray : [Position] = [];
  system func preupgrade() {

    //saving active positions in a stable array
    usersPositionsArray := Buffer.toArray(activePositions);
  };
  // Post-upgrade logic
  system func postupgrade() {
    for (userPosition in usersPositionsArray.vals()) {
      //putting active positions from a stable array
      activePositions.add(userPosition);
    };
    usersPositionsArray := [];
  };
};
