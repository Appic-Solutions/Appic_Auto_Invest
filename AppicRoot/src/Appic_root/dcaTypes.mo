import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
module {
    public type PositionId = Nat64;

    //Public Type for specifying the status of each transaction after a swap has been completed at regular intervals
    public type TransactionStatus = {
        #Successful;
        #Failed : TransactionFailureReason;
        #Pending;
        #NotTriggered;
    };

    public type TransactionFailureReason = {
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

    //Public Type for specifying the status of Auto Invest Position
    public type PositionStatus = {
        #Active;
        #InActive;
        #Deleted;
    };

    //Public Type for setting the Principal-Id(canister-id) of tokens
    public type PositionTokens = {
        sellToken : Principal;
        buyToken : Principal;
    };

    //Public type for specifying the details of transaction
    public type Transaction = {
        transactionId : Nat;
        transactionTime : Int; // UNIX format
        transactionStatus : TransactionStatus;
        sellingAmount : Nat; // Before transactionTime the value will be null
        amountBought : ?Nat; // Before transactionTime the value will be null
        step1 : ?Text; // step one of execution (transfer funds from user wallet to wallet using allowance);
        step2 : ?Text; // step two of execution (transfer funds from canister to sonic canister)
        step3 : ?Text; // step three of execution (deposit funds into sonic canister)
        step4 : ?Text; // step four of execution (execute the swap in sonic canister)
        step5 : ?Text; // step five of execution (witdraw bought tokens from sonic canister to Alphavault canister)
        step6 : ?Text; // step six of execution (transfer funds from alphavault canister to users principal(wallet))
    };

    //Position Type
    public type Position = {
        positionId : PositionId;
        tokens : PositionTokens;
        destination : Principal; // Bought tokens final destination
        swaps : [Transaction]; // Array that contains all swaps, each of them with specific time
        positionStatus : PositionStatus;
        allowance : Nat;
        managerCanister : Principal; // AlpahvaultRoot canister id
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
        #WronmgAlloance : { expectedAllowance : Nat; inputAllowance : Nat };
        #AllowanceNotEnough : {
            expectedAllowance : Nat;
            receivedAllowance : Nat;
        };
        #PositionInThePast;
        #NotEnoughFee : { expectedFee : Nat; receivedFee : Nat };
        #TokenNotFound;
        #GenericError : { message : Text };
    };

    public type AllowanceAmountResult = {
        minAllowanceForApproveFunction : Nat;
        minAllowanceForPositionCreation : Nat;
    };

    public type GetAllowanceArgs = {
        userPrincipal : Principal;
        sellToken : Principal;
        amountPerSwap : Nat;
        noOfSwaps : Nat;
    };

    public type Pair = {
        sellToken : Principal;
        buyToken : Principal;
    };

    // AutoInvestPosition creation result
    public type Result_1 = Result.Result<Nat, PositionCreationError>;

    // Allowance validator function result
    public type Result_2 = Result.Result<(), PositionCreationError>;
};
