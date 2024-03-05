import dcaTypes "dcaTypes";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Blob "mo:base/Blob";

actor AlphavaultRoot {
  //Types
  type PositionId = dcaTypes.PositionId;
  type TransactionStatus = dcaTypes.TransactionStatus;
  type PositionStatus = dcaTypes.PositionStatus;
  type PositionTokens = dcaTypes.PositionTokens;
  type Transaction = dcaTypes.Transaction;
  type AutoInvestPosition = dcaTypes.AutoInvestPosition;

  let positions = HashMap.HashMap<PositionId, AutoInvestPosition>(0, Nat64.equal, Nat64.toNat32);

  public type TxReceipt = Result.Result<Nat, Text>;

  let SonicDex = actor ("3xwpq-ziaaa-aaaah-qcn4a-cai") : actor {
    deposit : shared (Principal, Nat) -> async TxReceipt;
    initiateICRC1Transfer : shared () -> async Blob;

  };
  public type Account = { owner : Principal; subaccount : ?Blob };
  public type Result = { #Ok : Nat; #Err : TransferError };
  public type TransferError = {
    #GenericError : { message : Text; error_code : Nat };
    #TemporarilyUnavailable;
    #BadBurn : { min_burn_amount : Nat };
    #Duplicate : { duplicate_of : Nat };
    #BadFee : { expected_fee : Nat };
    #CreatedInFuture : { ledger_time : Nat64 };
    #TooOld;
    #InsufficientFunds : { balance : Nat };
  };
  public type TransferArg = {
    to : Account;
    fee : ?Nat;
    memo : ?Blob;
    from_subaccount : ?Blob;
    created_at_time : ?Nat64;
    amount : Nat;
  };
  let ICP_Ledger = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai") : actor {
    icrc1_transfer : shared TransferArg -> async Result;

  };

  public shared func depositToSonic(amount : Nat) : async TxReceipt {
    let result = await SonicDex.deposit(Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"), amount);
    return result;
  };

  public shared func transferToSonic(amount : Nat) : async Text {
    let toSubAccount = await SonicDex.initiateICRC1Transfer();
    let transferResult = await ICP_Ledger.icrc1_transfer({
      to = {
        owner = Principal.fromText("3xwpq-ziaaa-aaaah-qcn4a-cai");
        subaccount = ?toSubAccount;
      };
      fee = null;
      memo = null;
      created_at_time = null;
      amount;
      from_subaccount = null;
    });
    switch (transferResult) {
      case (#Err error) {
        switch (error) {
          case (#BadFee { expected_fee }) {
            return "Bad fee" # Nat.toText(expected_fee);
          };
          case (#BadBurn { min_burn_amount }) {
            return "Bad Burn min burn amount :" # Nat.toText(min_burn_amount);
          };
          case (#InsufficientFunds { balance }) {
            return "Insufficient Funds Balance: " # Nat.toText(balance);
          };

          case (#TooOld) {
            return "Too old";
          };
          case (#CreatedInFuture { ledger_time }) {
            return "CreatedInFuture" # Nat64.toText(ledger_time);
          };
          case (#Duplicate { duplicate_of }) {
            return "Duplicate" # Nat.toText(duplicate_of);
          };
          case (#TemporarilyUnavailable) {
            return "TemporarilyUnavailable";
          };
          case (#GenericError { error_code; message }) {
            return "GenericError" # message;
          };
          case _ { return "Unknow Error" };
        };
      };
      case (#Ok BlockNumber) {
        return "Successful" # Nat.toText(BlockNumber);
      };
    };
  };

  public shared func initiateICRC1transfer() : async Blob {
    let result = await SonicDex.initiateICRC1Transfer();
    return result;
  };
};
