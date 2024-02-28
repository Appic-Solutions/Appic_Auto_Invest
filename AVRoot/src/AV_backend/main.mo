import Types "types";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";

actor AlphavaultRoot {
  //Types
  type PositionId = Types.PositionId;
  type TransactionStatus = Types.TransactionStatus;
  type PositionStatus = Types.PositionStatus;
  type PositionTokens = Types.PositionTokens;
  type Transaction = Types.Transaction;
  type AutoInvestPosition = Types.AutoInvestPosition;

  let positions = HashMap.HashMap<PositionId, AutoInvestPosition>(0, Nat64.equal, Nat64.toNat32);
};
