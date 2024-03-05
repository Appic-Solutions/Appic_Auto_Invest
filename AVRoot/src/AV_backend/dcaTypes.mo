import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
module {
    public type PositionId = Nat64;

    //Public Type for specifying the status of each transaction after a swap has been completed at regular intervals
    public type TransactionStatus = {
        #Successful;
        #Failed;
        #Pending;
        #NotTriggered;
    };

    //Public Type for specifying the status of Auto Invest Position
    public type PositionStatus = {
        #Open;
        #Successful;
        #Deleted;
    };

    //Public Type for setting the Principal-Id(canister-id) of tokens
    public type PositionTokens = {
        sellToken : Principal;
        buyToken : Principal;
    };

    //Public type for specifying the details of transaction
    public type Transaction = {
        transactionTime : Int; // UNIX format
        transactionStatus : TransactionStatus;
        sellinngAmount : Nat; // Before transactionTime the value will be null
        amountBought : ?Nat; // Before transactionTime the value will be null
    };

    //Position Type
    public type Position = {
        positionId : PositionId;
        tokens : PositionTokens;
        destination : Principal; // Bought tokens final destination
        swaps : [Transaction]; // Array that contains all swaps, each of them with specific time
        positionStatus : PositionStatus;
        allowance : Nat;
    };

    //Create Position Args
    public type CreatePositionsArgs = {
        sellToken : Principal;
        buyToken : Principal;
        destination : Principal; // Bought tokens final destination
        swapsTime : [Nat]; // Array that contains all swaps, each of them with specific time
        allowance : Nat;
        amountPerSwap : Nat;
    };

    public type PositionCreationError = {
        #WronmgAlloance : { expectedAllowance : Nat; receivedAllowance : Nat };
        #PositionInThePast;
        #NotEnoughFee : { expectedFee : Nat; receivedFee : Nat };
        #TokenNotFound;
        #GenericError : { message : Text };
    };

    // AutoInvestPosition creation result
    public type Result_1 = Result.Result<Nat, PositionCreationError>;
};
