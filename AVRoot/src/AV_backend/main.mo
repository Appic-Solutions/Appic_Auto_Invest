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
  type Result_2 = dcaTypes.Result_2;
  type PositionCreationError = dcaTypes.PositionCreationError;
  type AllowanceAmountResult = dcaTypes.AllowanceAmountResult;
  type GetAllowanceArgs = dcaTypes.GetAllowanceArgs;
  type Pair = dcaTypes.Pair;
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

  let platformFee : Nat = 2; //2
  let cronInterval = 60; // 1 min
  let admin : Principal = Principal.fromText("matbl-u2myk-jsllo-b5aw6-bxboq-7oon2-h6wmo-awsxf-pcebc-4wpgx-4qe");

  // Buffer for supported pairs
  let supportedPirs = Buffer.Buffer<Pair>(0);
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

  public shared func createPosition(createPositionArgs : CreatePositionsArgs) : async Result_1 {

    // Check if entered unix swap times are not in the past
    for (swapTime in createPositionArgs.swapsTime.vals()) {
      if (swapTime < utils.nanoToSecond(Time.now())) {
        return (#err(#PositionInThePast));
      };
    };

    // Check if input tokens are supported
    let ifPairSupported = Buffer.forSome<Pair>(
      supportedPirs,
      func(pair : Pair) : Bool {
        if (pair.sellToken == createPositionArgs.sellToken and pair.buyToken == createPositionArgs.buyToken) {
          return true;
        };
        return false;
      },
    );
    switch (ifPairSupported) {
      case (true) {};
      case (false) { return (#err(#TokenNotFound)) };
    };

    // Check to see if allwance is valid
    switch (await _validateAllowance(createPositionArgs)) {

      case (#err(#WronmgAlloance { expectedAllowance; inputAllowance })) {
        return (#err(#WronmgAlloance { expectedAllowance; inputAllowance }));
      };
      case (#err(#AllowanceNotEnough { expectedAllowance; receivedAllowance })) {
        return (#err(#AllowanceNotEnough { expectedAllowance; receivedAllowance }));
      };
      case _ {};
    };

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

  // Validate allowance
  // Part 1: Checks if privided allowance covers fees and platform fee
  // Part 2: Checks if total allowance from token canister covers everything
  private func _validateAllowance(createPositionArgs : CreatePositionsArgs) : async Result_2 {

    // defining tokenCanister
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
    // part 1
    let calculateMinAllowanceForPosition = await _calculateMinAllowanceForPosition(
      createPositionArgs.destination,
      createPositionArgs.sellToken,
      createPositionArgs.amountPerSwap,
      createPositionArgs.swapsTime.size(),
      tokenCanister,
    );
    if (createPositionArgs.allowance < calculateMinAllowanceForPosition) {
      return (#err(#WronmgAlloance { expectedAllowance = calculateMinAllowanceForPosition; inputAllowance = createPositionArgs.allowance }));
    };

    // part 2
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
      return (#err(#AllowanceNotEnough { expectedAllowance = userMinExpectedAllowance; receivedAllowance = userAllowance.allowance }));
    };

    return (#ok);
  };

  // calculate minimum allowance for position to be created plus token fee and platofrm fee
  private func _calculateMinAllowanceForPosition(
    userPrincipal : Principal,
    sellToken : Principal,
    amountPerSwap : Nat,
    noOfSwaps : Nat,
    tokenCanister : ICRC2TokenActor,
  ) : async Nat {
    let totalAmountOfSellToken = amountPerSwap * noOfSwaps;
    let tokenFee = await tokenCanister.icrc1_fee();
    let totalTokenFee = tokenFee * 2 * noOfSwaps;
    let calculatedPlatformFee = (totalTokenFee + totalAmountOfSellToken) * platformFee / 100;
    return (totalAmountOfSellToken + totalTokenFee + calculatedPlatformFee + tokenFee); // MinAllowanceForPosition, the last tokenFee is for witdrwing platform Fee
  };

  // Get min allowance for a createPositionArg and approveFunctionAmount
  public shared func getAllowanceForNewTrade(getAllowanceArgs : GetAllowanceArgs) : async AllowanceAmountResult {
    // defining tokenCanister
    let tokenCanister : ICRC2TokenActor = icrcTypes._getTokenActor(getAllowanceArgs.sellToken);

    let minAllowanceForPosition = await _calculateMinAllowanceForPosition(
      getAllowanceArgs.userPrincipal,
      getAllowanceArgs.sellToken,
      getAllowanceArgs.amountPerSwap,
      getAllowanceArgs.noOfSwaps,
      tokenCanister,
    );

    let userAlreadyExsistingPositions : [Position] = _getPositionsFor(getAllowanceArgs.userPrincipal, ?getAllowanceArgs.sellToken, null);
    var userMinExpectedAllowance = 0;
    if (userAlreadyExsistingPositions.size() > 0) {
      for (userPosition in userAlreadyExsistingPositions.vals()) {
        userMinExpectedAllowance += userPosition.allowance;
      };
      userMinExpectedAllowance += minAllowanceForPosition;
    } else {
      userMinExpectedAllowance += minAllowanceForPosition;
    };

    return {
      minAllowanceForPositionCreation = minAllowanceForPosition;
      minAllowanceForApproveFunction = userMinExpectedAllowance;
    };
  };

  // Calculate fee for showing in the frontend
  public shared func calculateFee(getAllowanceArgs : GetAllowanceArgs) : async Nat {
    // defining tokenCanister
    let tokenCanister : ICRC2TokenActor = icrcTypes._getTokenActor(getAllowanceArgs.sellToken);
    let totalAmountOfSellToken = getAllowanceArgs.amountPerSwap * getAllowanceArgs.noOfSwaps;
    let tokenFee = await tokenCanister.icrc1_fee();
    let totalTokenFee = tokenFee * 2 * getAllowanceArgs.noOfSwaps;
    let calculatedPlatformFee = (totalTokenFee + totalAmountOfSellToken) * platformFee / 100;
    return (totalTokenFee + calculatedPlatformFee + tokenFee);

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
  // Get all supported pairs
  public shared func getAllPairs() : async [Pair] {
    return Buffer.toArray(supportedPirs);
  };
  public shared func retreiveTime() : async Int {
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

  ignore recurringTimer(#seconds cronInterval, cronTimer);

  // Admin Function

  public shared ({ caller }) func addPair(sellToken : Principal, buyToken : Principal) : async Text {
    if (caller == admin) {
      supportedPirs.add({
        sellToken;
        buyToken;
      });
      return "Pair Added";
    };
    return "You're not an admin";
  };
  public shared ({ caller }) func removePair(sellToken : Principal, buyToken : Principal) : async Text {
    if (caller == admin) {
      supportedPirs.filterEntries(
        func(_, pair) : Bool {
          if (pair.sellToken == sellToken and pair.buyToken == buyToken) {
            return false;
          };
          return true;
        }
      );
    };
    return "You're not an admin";
  };

  // System Functions
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