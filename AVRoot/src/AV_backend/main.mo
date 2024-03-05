import dcaTypes "dcaTypes";
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
  //Types
  type PositionId = dcaTypes.PositionId;
  type TransactionStatus = dcaTypes.TransactionStatus;
  type PositionStatus = dcaTypes.PositionStatus;
  type PositionTokens = dcaTypes.PositionTokens;
  type Transaction = dcaTypes.Transaction;
  type Position = dcaTypes.Position;
  type CreatePositionsArgs = dcaTypes.CreatePositionsArgs;
  type Result_1 = dcaTypes.Result_1;

  stable var nextPositionId : PositionId = 0;

  let activePositions = HashMap.HashMap<Principal, [Position]>(0, Principal.equal, Principal.hash);

  public type TxReceipt = Result.Result<Nat, Text>;

  let SonicDex = actor ("3xwpq-ziaaa-aaaah-qcn4a-cai") : actor {
    deposit : shared (Principal, Nat) -> async TxReceipt;
    initiateICRC1Transfer : shared () -> async Blob;

  };
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
  public shared func createPosition(createPositionArgs : CreatePositionsArgs) : async Result_1 {
    // TODO : check to see if allwance has been given to our canister

    // TODO : check if allowance is enough to cover fees

    // TODO : check if input tokens are supported

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
    let alreadyExisitngPositions = activePositions.get(createPositionArgs.destination);
    switch (alreadyExisitngPositions) {
      case (null) {
        activePositions.put(createPositionArgs.destination, [newPosition]);
      };
      case (?position) {
        let positions = Buffer.fromArray<Position>(position);
        positions.add(newPosition);
        activePositions.put(createPositionArgs.destination, Buffer.toArray(positions));
      };
    };
    return #ok(1);
  };

  // Get all active positions
  public shared query func getAllPositions() : async [(Principal, [Position])] {
    return Iter.toArray(activePositions.entries());
  };

  // Get active positions by principal id of a specific user
  public shared query func getPositionsFor(userPrincipal : Principal) : async ?[Position] {
    return activePositions.get(userPrincipal);
  };

  public func retreiveTime() : async Int {
    return utils.nanoToSecond(Time.now());
  };

  // Timer function for triggering the swap on time
  // Runs every one hour and checks the transactionTime value of each transaction
  // If current time in unix format is bigger than transactionTime and transactionStauts is #notTriggered, it will trigger a new swap transaction

  private func _proccedTransaction(userPositions : [Position], position : Position, transaction : Transaction, positionId : PositionId, transactionId : Nat) : async () {

    // Convet positions to buffer
    let positionsBuffer = Buffer.fromArray<Position>(userPositions);
    // TODO: Trade logic

    // Save new user positions with updated transaction

    // Iterate over buffer to find the target transaction and update
    let newPositionsBuffer = Buffer.map<Position, Position>(
      positionsBuffer,
      func updatePosition(oldPosition : Position) : Position {

        // Update the target Position
        if (oldPosition.positionId == positionId) {

          // Update the target transaction in swaps array
          let newSwaps = Array.map<Transaction, Transaction>(
            oldPosition.swaps,
            func(oldTransaction : Transaction) : Transaction {
              if (oldTransaction.transactionId == transactionId) {
                return {
                  transactionId = transactionId;
                  transactionStatus = #Successful;
                  transactionTime = oldTransaction.transactionTime;
                  sellingAmount = oldTransaction.sellingAmount;
                  amountBought = null;
                };
              };
              return oldTransaction;
            },
          );

          return {
            allowance = oldPosition.allowance;
            destination = oldPosition.destination;
            positionId = oldPosition.positionId;
            // TODO : Write the logic for changing the position status to successful or faild
            positionStatus = oldPosition.positionStatus;
            tokens = oldPosition.tokens;
            swaps = newSwaps;
          };
        };
        return oldPosition;
      },
    );

    // Save updated Positions into active position hashmap
    activePositions.put(position.destination, Buffer.toArray(newPositionsBuffer))

  };

  let Seconds = 60; // Number of seconds in one hour

  private func cronTimer() : async () {
    // Create a clone of Hashmap to iterate over to prevent errors while updating the main hashmap
    let positionsToIteratreOver = HashMap.clone(activePositions, Principal.equal, Principal.hash);

    // Iterating over all active posittions
    for ((userPrincipal, userPositions) in positionsToIteratreOver.entries()) {

      // Iterating over specific users' auto invest positions
      for (position in userPositions.vals()) {

        // Iterating over transactions of a poisition
        for (transaction in position.swaps.vals()) {

          // Checking the transaction status
          switch (transaction.transactionStatus) {

            // If the transaction has not been triggered and the unix time is less or equla to time.now() the transaction should be triggered
            case (#NotTriggered) {
              if (transaction.transactionTime <= utils.nanoToSecond(Time.now())) await _proccedTransaction(userPositions, position, transaction, position.positionId, transaction.transactionId);
            };
            case _ {};
          };
        };
      };
    };
  };

  ignore recurringTimer(#seconds Seconds, cronTimer);

  // Pre-upgrade logic
  stable var usersPositionsArray : [(Principal, [Position])] = [];
  system func preupgrade() {

    //saving active positions in a stable array
    usersPositionsArray := Iter.toArray(activePositions.entries());
  };
  // Post-upgrade logic
  system func postupgrade() {
    for ((userPrincipal, positions) in usersPositionsArray.vals()) {
      //putting active positions from a stable array
      activePositions.put(userPrincipal, positions);
    };
  };
  usersPositionsArray := [];
};
