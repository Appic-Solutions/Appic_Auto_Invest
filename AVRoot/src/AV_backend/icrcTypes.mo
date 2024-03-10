import Principal "mo:base/Principal";
import Nat64 "mo:base/Nat64";
import Nat "mo:base/Nat";
module {
    public type ICRCTransferError = {
        #BadFee : { expected_fee : Nat };
        #BadBurn : { min_burn_amount : Nat };
        #InsufficientFunds : { balance : Nat };
        #InsufficientAllowance : { allowance : Nat };
        #TooOld;
        #CreatedInFuture : { ledger_time : Nat64 };
        #Duplicate : { duplicate_of : Nat };
        #TemporarilyUnavailable;
        #GenericError : { message : Text; error_code : Nat };
        #Expired; //only for approve
        #CustomError : Text; // custom error for sonic logic
    };
    public type ICRCTokenTxReceipt = {
        #Ok : Nat;
        #Err : ICRCTransferError;
    };
    public type ICRCMetaDataValue = {
        #Nat8 : Nat8;
        #Nat : Nat;
        #Int : Int;
        #Blob : Blob;
        #Text : Text;
    };
    public type ICRCAccount = {
        owner : Principal;
        subaccount : ?Subaccount;
    };
    public type Subaccount = Blob;

    public type ICRC2TransferArg = {
        from : ICRCAccount;
        to : ICRCAccount;
        amount : Nat;
    };
    public type ICRCTransferArg = {
        from_subaccount : ?Subaccount;
        to : ICRCAccount;
        amount : Nat;
    };
    public type ICRC2AllowanceArgs = {
        account : ICRCAccount;
        spender : ICRCAccount;
    };
    public type ICRC2Allowance = {
        allowance : Nat;
        expires_at : ?Nat64;
    };
    public type ICRC2TokenActor = actor {
        icrc2_approve : shared (from_subaccount : ?Subaccount, spender : Principal, amount : Nat) -> async ICRCTokenTxReceipt;
        icrc2_allowance : shared (ICRC2AllowanceArgs) -> async ICRC2Allowance;
        icrc1_balance_of : (account : ICRCAccount) -> async Nat;
        icrc1_decimals : () -> async Nat8;
        icrc1_name : () -> async Text;
        icrc1_symbol : () -> async Text;
        icrc1_metadata : () -> async [(Text, ICRCMetaDataValue)];
        icrc1_total_supply : () -> async Nat;
        icrc2_transfer_from : shared (ICRC2TransferArg) -> async ICRCTokenTxReceipt;
        icrc1_transfer : shared (ICRCTransferArg) -> async ICRCTokenTxReceipt;
        icrc1_fee : query () -> async Nat;

    };

    public func _getTokenActor(tokenId : Principal) : ICRC2TokenActor {

        var tokenCanister : ICRC2TokenActor = actor (Principal.toText(tokenId));
        return tokenCanister;

    };
};
