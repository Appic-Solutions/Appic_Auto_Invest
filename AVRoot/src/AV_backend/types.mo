import Text "mo:base/Text";
import Principal "mo:base/Principal";
module {
    public type PositionId = Nat64;

    //Public Type for specifying the status of each transaction after a swap has been completed at regular intervals
    public type TransactionStatus = {
        #Successful;
        #Failed;
        #Pending;
    };

    //Public Type for specifying the status of Auto Invest Position
    public type PositionStatus = {
        #Open;
        #Closed;
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
        amountSold : ?Nat; // Before transactionTime the value will be null
        amountBought : ?Nat; // Before transactionTime the value will be null
    };

    //Position Type
    public type AutoInvestPosition = {
        tokens : PositionTokens;
        destination : Principal; // Bought tokens final destination
        swaps : [Transaction]; // Array that contains all swaps, each of them with specific time
        positionStatus : PositionStatus;
        amountPerSwap : Nat; //Amount of sell token to be sold
        noOfSwaps : Int; //Equals to swaps array size
    };
};
