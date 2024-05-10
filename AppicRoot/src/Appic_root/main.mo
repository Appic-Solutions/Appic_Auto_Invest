import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import { recurringTimer } "mo:base/Timer";
import TrieMap "mo:base/TrieMap";
import Hash "mo:base/Hash";

import dcaTypes "dcaTypes";
import icrcTypes "icrcTypes";
import sonicTypes "sonicTypes";
import utils "utils";

actor AlphavaultRoot {
  // Auto invest Types
  type PositionId = dcaTypes.PositionId;
  type TransactionStatus = dcaTypes.TransactionStatus;
  type PositionStatus = dcaTypes.PositionStatus;
  type PositionTokens = dcaTypes.PositionTokens;
  type Transaction = dcaTypes.Transaction;
  type Position = dcaTypes.Position;
  type CreatePositionArgs = dcaTypes.CreatePositionArgs;
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
  // Sonic Canister types
  type sonicActor = sonicTypes.sonicActor;
  type TxReceipt = sonicTypes.TxReceipt;

  let platformFee : Nat = 1; //2 percent
  let noOfTransferFees = 3; // how many time do we have to pay transfer fee for a single swap
  let cronInterval = 300; // 5 min
  let admin : Principal = Principal.fromText("matbl-u2myk-jsllo-b5aw6-bxboq-7oon2-h6wmo-awsxf-pcebc-4wpgx-4qe");
  let sonicCanisterId : Principal = Principal.fromText("3xwpq-ziaaa-aaaah-qcn4a-cai");

  // Buffer for supported pairs
  let supportedPirs = Buffer.Buffer<Pair>(0);

  // Buffer for keeping active positions
  let activePositions = TrieMap.TrieMap<PositionId, Position>(Nat.equal, Hash.hash);

  //
  let platformIncome = HashMap.HashMap<Principal, Nat>(0, Principal.equal, Principal.hash);

  // Add Auto invest position
  stable var nextPositionId : PositionId = 0;

  public shared ({ caller }) func createPosition(createPositionArgs : CreatePositionArgs) : async Result_1 {

    if (createPositionArgs.swapsTime.size() > 50) {
      return (#err(#GenericError { message = "Max tokens are 50" }));
    };

    // 1: Check if entered unix swap times are not in the past
    // 2: Check if the the duration between each trade is at least 23 hours
    for (swapTime : Nat in createPositionArgs.swapsTime.vals()) {
      // 1
      if (swapTime < utils.nanoToSecond(Time.now())) {
        return (#err(#PositionInThePast));
      };

      // 2
      for (transactionTime : Nat in createPositionArgs.swapsTime.vals()) {
        if (transactionTime > swapTime) {
          if (transactionTime - swapTime < 82800) {
            return (#err(#SwapsTooClose { message = "The difference between swap times should be at least 23 hours " }));
          };
        };
        if (swapTime > transactionTime) {
          if (swapTime - transactionTime < 82800) {
            return (#err(#SwapsTooClose { message = "The difference between swap times should be at least 23 hours " }));
          };
        };
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
    switch (await _validateAllowance(createPositionArgs, caller)) {

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
          step1 = null;
          step2 = null;
          step3 = null;
          step4 = null;
          step5 = null;
          step6 = null;
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
      positionStatus = #Active;
      leftAllowance = createPositionArgs.allowance;
      initialAllowance = createPositionArgs.allowance;
      managerCanister = Principal.fromActor(AlphavaultRoot);
    };
    // Save created new position arg
    // Check if user principal already existes in hashmap

    activePositions.put(nextPositionId, newPosition);

    nextPositionId += 1;

    return #ok(1);
  };

  // Validate allowance
  // Part 1: Check if initialAllowance given by user is enough to cover all the swaps
  // Part 2: Checks if total allowance from that was given to our canister by user is enough
  private func _validateAllowance(createPositionArgs : CreatePositionArgs, userPrincipal : Principal) : async Result_2 {
    // Part 1: Check if initialAllowance given by user is enough to cover all the swaps
    let minAllowanceForPosition = createPositionArgs.amountPerSwap * createPositionArgs.swapsTime.size();
    if (createPositionArgs.allowance < minAllowanceForPosition) {
      return (#err(#AllowanceNotEnough { expectedAllowance = minAllowanceForPosition; receivedAllowance = createPositionArgs.allowance }));

    };
    // Part 2: Check to see if user has more than one transaction with the same selling token
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

    let userAllowance : ICRC2Allowance = await tokenCanister.icrc2_allowance(allowanceArgs);

    let userAlreadyExsistingPositions : [Position] = _getPositionsFor(createPositionArgs.destination, ?createPositionArgs.sellToken, null, ?true);
    var userMinExpectedAllowance = 0;
    if (userAlreadyExsistingPositions.size() > 0) {
      for (userPosition in userAlreadyExsistingPositions.vals()) {
        userMinExpectedAllowance += userPosition.leftAllowance;
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

  // Get min allowance for a createPositionArg and approveFunctionAmount
  public shared func getAllowanceForNewTrade(getAllowanceArgs : GetAllowanceArgs) : async AllowanceAmountResult {
    let minAllowanceForPosition = getAllowanceArgs.amountPerSwap * getAllowanceArgs.noOfSwaps;
    // defining tokenCanister
    let tokenCanister : ICRC2TokenActor = icrcTypes._getTokenActor(getAllowanceArgs.sellToken);

    let userAlreadyExsistingPositions : [Position] = _getPositionsFor(getAllowanceArgs.userPrincipal, ?getAllowanceArgs.sellToken, null, ?true);
    var userMinExpectedAllowance : Nat = 0;
    if (userAlreadyExsistingPositions.size() > 0) {
      for (userPosition in userAlreadyExsistingPositions.vals()) {
        userMinExpectedAllowance += userPosition.leftAllowance;
      };
      userMinExpectedAllowance += minAllowanceForPosition;
    } else {
      userMinExpectedAllowance += minAllowanceForPosition;
    };

    return {
      minAllowanceRequired : Nat = userMinExpectedAllowance;
    };
  };

  // Calculate fee for showing in the frontend
  // public shared func calculateFee(getAllowanceArgs : GetAllowanceArgs) : async Nat {
  //   // defining tokenCanister
  //   let tokenCanister : ICRC2TokenActor = icrcTypes._getTokenActor(getAllowanceArgs.sellToken);
  //   let totalAmountOfSellToken = getAllowanceArgs.amountPerSwap * getAllowanceArgs.noOfSwaps;
  //   let tokenFee = await tokenCanister.icrc1_fee();
  //   let totalTokenFee = tokenFee * noOfTransferFees * getAllowanceArgs.noOfSwaps;
  //   let calculatedPlatformFee = totalAmountOfSellToken * platformFee / 100;
  //   return (totalTokenFee + calculatedPlatformFee);

  // };

  // Get all active positions
  public shared query func getAllPositions() : async [Position] {
    return Iter.toArray(activePositions.vals());
  };

  // Get active positions by principal id of a specific user public
  public shared query func getPositionsFor(userPrincipal : Principal, sellToken : ?Principal, buyToken : ?Principal, active : ?Bool) : async [Position] {
    // convert activePositions hashmap to a buffer of only values
    let positionsBuffer = Buffer.fromIter<Position>(activePositions.vals());

    // Filter positions buffer based on the arguments provided
    let filteredByPrincipal = Buffer.mapFilter<Position, Position>(
      positionsBuffer,
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

    // Filter Only active positions
    switch (active) {
      case (?true) {
        filteredByPrincipal.filterEntries(func(_, position : Position) { position.positionStatus == #Active });
      };
      case (?false) {
        filteredByPrincipal.filterEntries(func(_, position : Position) { position.positionStatus == #InActive });
      };
      case (null) {};
    };

    return Buffer.toArray(filteredByPrincipal);
  };

  // Get active positions by principal id of a specific user and if token id is provided result should be filtered by token id
  private func _getPositionsFor(userPrincipal : Principal, sellToken : ?Principal, buyToken : ?Principal, active : ?Bool) : [Position] {
    // convert activePositions hashmap to a buffer of only values
    let positionsBuffer = Buffer.fromIter<Position>(activePositions.vals());

    // Filter positions buffer based on the arguments provided
    let filteredByPrincipal = Buffer.mapFilter<Position, Position>(
      positionsBuffer,
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

    // Filter Only active positions
    switch (active) {
      case (?true) {
        filteredByPrincipal.filterEntries(func(_, position : Position) { position.positionStatus == #Active });
      };
      case (?false) {
        filteredByPrincipal.filterEntries(func(_, position : Position) { position.positionStatus == #InActive });
      };
      case (null) {};
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

  public shared ({ caller }) func retreiveCaller() : async Principal {
    return caller;
  };

  // Timer function for triggering the swap on time
  // Runs every one hour and checks the transactionTime value of each transaction
  // If current time in unix format is bigger than transactionTime and transactionStauts is #notTriggered, it will trigger a new swap transaction
  private func _proccedTransaction(
    userPosition : Position,
    transaction : Transaction,
  ) : async () {
    var positionId = userPosition.positionId;
    var transactionId = transaction.transactionId;
    // Check if the transaction has already started by previous cron
    let positionsLiveData = activePositions.get(positionId);
    switch (positionsLiveData) {
      case (?value) {
        if (value.swaps[transactionId].transactionStatus != #NotTriggered) {
          return;
        };
      };
      case (null) {};
    };

    // Set the status to pending
    // Generate the new transaction object
    var newTransactionForPending : Transaction = {
      transactionId = transaction.transactionId;
      transactionStatus = #Pending;
      transactionTime = transaction.transactionTime;
      sellingAmount = transaction.sellingAmount;
      amountBought = ?0;
      step1 = null;
      step2 = null;
      step3 = null;
      step4 = null;
      step5 = null;
      step6 = null;
    };

    // Save new user positions
    let newTransactionsArrayForPending = Buffer.fromArray<Transaction>(userPosition.swaps);
    newTransactionsArrayForPending.put(transactionId, newTransactionForPending);

    // Generate new Position
    let newPositionForPending : Position = {
      initialAllowance = userPosition.initialAllowance;
      leftAllowance = userPosition.leftAllowance - newTransactionForPending.sellingAmount;
      destination = userPosition.destination;
      positionId = userPosition.positionId;
      // TODO : Write the logic for changing the position status to successful or faild
      positionStatus = userPosition.positionStatus;
      tokens = userPosition.tokens;
      swaps = Buffer.toArray(newTransactionsArrayForPending);
      managerCanister = userPosition.managerCanister;
    };

    // Save updated Positions into active position buffer
    activePositions.put(positionId, newPositionForPending);

    // Starting the swap process

    // Actors
    let sonicCanister : sonicActor = sonicTypes._getSonicActor(sonicCanisterId); // Sonic canister
    let sellTokenCanister : ICRC2TokenActor = icrcTypes._getTokenActor(userPosition.tokens.sellToken); //Selling token actor
    let buyTokenCanister : ICRC2TokenActor = icrcTypes._getTokenActor(userPosition.tokens.buyToken); //Buy token actor token actor

    let sellTokenFee : Nat = await sellTokenCanister.icrc1_fee();
    let buyTokenFee : Nat = await buyTokenCanister.icrc1_fee();

    var transactionStatus : TransactionStatus = #Pending;
    var sonicBalanceOfBuyTokenAfterTrade : Nat = 0;
    var amountOfBoughtToken : Nat = 0;
    var step1 : ?Text = null;
    var step2 : ?Text = null;
    var step3 : ?Text = null;
    var step4 : ?Text = null;
    var step5 : ?Text = null;
    var step6 : ?Text = null;

    // TODO: Trade logic
    // Step1: Transfer from users wallet to canister
    let icrc2TransferFromResult : ICRCTokenTxReceipt = await _transferFromUserToCanister(userPosition, transaction, sellTokenCanister, sellTokenFee);
    switch (icrc2TransferFromResult) {
      case (#Err transferError) {
        transactionStatus := #Failed(transferError);
        step1 := ?(
          "Transaction faild. requested amount to transfer to our AV canister:" #
          Nat.toText(transaction.sellingAmount - sellTokenFee) # "This does not include transfer fee"
        );
      };
      case (#Ok SuccessId) {
        step1 := ?(
          "Success code:" #
          Nat.toText(SuccessId)
        );
      };
    };
    let amountOfSellTokenTransfered : Nat = transaction.sellingAmount - sellTokenFee;
    // Reducing platform fee
    let calculatedPlatformFee : Nat = transaction.sellingAmount * platformFee / 100;
    let amountOfSellTokenAfterStep1 : Nat = amountOfSellTokenTransfered - platformFee;

    // Step2: ICRC1 transfer to sonic swap
    switch (transactionStatus) {
      case (#Pending) {
        let icrc1TransferToSonicResult : ICRCTokenTxReceipt = await _transferFromCanisterToSonic(
          sonicCanister,
          sellTokenCanister,
          amountOfSellTokenAfterStep1 - sellTokenFee,
        );
        switch (icrc1TransferToSonicResult) {
          case (#Err transferError) {
            transactionStatus := #Failed(transferError);
            step2 := ?(
              "Transaction faild. requested amount to sonic canister:" #
              Nat.toText(amountOfSellTokenAfterStep1 - sellTokenFee) # "This does not include transfer fee"
            );
            //sending funds back
            let refundResult : ICRCTokenTxReceipt = await _transferFundsBack(userPosition, sellTokenCanister, amountOfSellTokenAfterStep1 - sellTokenFee);
            switch (refundResult) {
              case (#Ok successId) {
                step2 := ?(
                  "Transaction faild. requested amount to sonic canister:" #
                  Nat.toText(amountOfSellTokenAfterStep1 - sellTokenFee) # "This does not include transfer fee" #
                  "Funds were sent back to user wallet addreess"
                );
              };
              case (#Err transferEr) {
                step2 := ?(
                  "Transaction faild. requested amount to sonic canister:" #
                  Nat.toText(amountOfSellTokenAfterStep1 - sellTokenFee) #
                  "Failed to send back user assets"
                );
              };
            };
          };
          case (#Ok SuccessId) {
            step2 := ?(
              "Success code:" #
              Nat.toText(SuccessId)
            );
          };
        };
      };
      case _ {};
    };
    let amountOfSellTokenAfterStep2 : Nat = amountOfSellTokenAfterStep1 - sellTokenFee;

    // Step3: Despoit to sonic account
    switch (transactionStatus) {
      case (#Pending) {
        let depositResult = await _depositFundsToSonic(userPosition, sonicCanister, amountOfSellTokenAfterStep2 - sellTokenFee);
        switch (depositResult) {
          case (#ok successId) {
            step3 := ?("Successfully deposited " # Nat.toText(amountOfSellTokenAfterStep2 - sellTokenFee) # " to sonic canister ");
          };
          case (#err reason) {
            transactionStatus := #Failed(#CustomError(reason));
            step3 := ?("Failed to deposit " # Nat.toText(amountOfSellTokenAfterStep2 - sellTokenFee) # " to sonic canister, this does not include transfer fee " # reason);
          };
        };
      };
      case _ {

      };
    };
    let amountOfSellTokenAfterStep3 : Nat = amountOfSellTokenAfterStep2 - sellTokenFee;

    // Step4: Trigger the swap
    switch (transactionStatus) {
      case (#Pending) {
        var sonicBalanceOfBuyTokenBeforeTrade : Nat = await sonicCanister.balanceOf(Principal.toText(userPosition.tokens.buyToken), userPosition.managerCanister);
        let swapResult = await _SwapExactTokensForTokens(userPosition, sonicCanister, amountOfSellTokenAfterStep3);
        switch (swapResult) {
          case (#ok successId) {
            sonicBalanceOfBuyTokenAfterTrade := await sonicCanister.balanceOf(Principal.toText(userPosition.tokens.buyToken), userPosition.managerCanister);
            amountOfBoughtToken := sonicBalanceOfBuyTokenAfterTrade - sonicBalanceOfBuyTokenBeforeTrade;
            step4 := ?("Successfully Swapped " # Nat.toText(amountOfSellTokenAfterStep3) # " For " # Nat.toText(amountOfBoughtToken) # " Of buy token");
          };
          case (#err reason) {
            transactionStatus := #Failed(#CustomError(reason));
            step4 := ?("Failed to swap " # Nat.toText(amountOfSellTokenAfterStep3) # " in sonic" # reason);

          };
        };
      };
      case _ {};
    };

    // Step5: Withdraw traded token from sonic
    switch (transactionStatus) {
      case (#Pending) {
        let withdrawResult = await _WithdrawFromSonic(userPosition, transaction, sonicCanister, amountOfBoughtToken);
        switch (withdrawResult) {
          case (#ok successId) {
            step5 := ?("Successfully Withdrew " # Nat.toText(amountOfBoughtToken - buyTokenFee));
            // Deduct withdraw fee
            amountOfBoughtToken -= buyTokenFee;
          };
          case (#err reason) {
            transactionStatus := #Failed(#CustomError(reason));
            step5 := ?("Failed to withdraw " # Nat.toText(amountOfBoughtToken) # " from sonic for:" # reason);

          };
        };
      };
      case _ {};
    };

    // Step6: Transfer traded token to users wallet
    switch (transactionStatus) {
      case (#Pending) {
        let transferResult = await _TransferBoughtTokenToUserWallet(userPosition, buyTokenCanister, amountOfBoughtToken, buyTokenFee);
        switch (transferResult) {
          case (#Ok SuccessId) {
            step6 := ?("Transfer was successful, Amount sent to user's wallet: " # Nat.toText(amountOfBoughtToken - (buyTokenFee * 2)));
            transactionStatus := #Successful;
          };
          case (#Err transferError) {
            transactionStatus := #Failed(transferError);
            step6 := ?(
              "Transaction faild. requested amount to transfer to our User wallet:" #
              Nat.toText(amountOfBoughtToken - buyTokenFee)
            );
          };
        };
      };
      case _ {};
    };

    // Generate the new transaction object
    var newTransaction : Transaction = {
      transactionId = transaction.transactionId;
      transactionStatus = transactionStatus;
      transactionTime = transaction.transactionTime;
      sellingAmount = transaction.sellingAmount;
      amountBought = ?amountOfBoughtToken;
      step1 = step1;
      step2 = step2;
      step3 = step3;
      step4 = step4;
      step5 = step5;
      step6 = step6;
    };

    // Save new user positions with updated transaction
    // Since the time difference between each swap of a transaction is at least one hour the wont be any conflict on saving data here
    let newTransactionsArray = Buffer.fromArray<Transaction>(userPosition.swaps);
    newTransactionsArray.put(transactionId, newTransaction);

    // Generate new Position
    let newPosition : Position = {
      initialAllowance = userPosition.initialAllowance;
      leftAllowance = userPosition.leftAllowance;
      destination = userPosition.destination;
      positionId = userPosition.positionId;
      // TODO : Write the logic for changing the position status to successful or faild
      positionStatus = userPosition.positionStatus;
      tokens = userPosition.tokens;
      swaps = Buffer.toArray(newTransactionsArray);
      managerCanister = userPosition.managerCanister;
    };

    // Save updated Positions into active position buffer
    activePositions.put(positionId, newPosition);

    // Add to platform income
    _addToPlatformIncome(userPosition.tokens.sellToken, calculatedPlatformFee);

  };

  // Transfer from users wallet to canister
  private func _transferFromUserToCanister(
    userPosition : Position,
    transaction : Transaction,
    sellTokenCanister : ICRC2TokenActor,
    sellTokenFee : Nat,
  ) : async ICRCTokenTxReceipt {
    let transferFromArgs : ICRC2TransferArg = {
      from : ICRCAccount = {
        owner = userPosition.destination;
        subaccount = null;
      };
      to : ICRCAccount = {
        owner = userPosition.managerCanister;
        subaccount = null;
      };
      amount = transaction.sellingAmount - sellTokenFee;
    };
    let result = await sellTokenCanister.icrc2_transfer_from(transferFromArgs);
  };

  // Transfer from our canister to sonic's canister
  private func _transferFromCanisterToSonic(
    sonicCanister : sonicActor,
    sellTokenCanister : ICRC2TokenActor,
    transferAmount : Nat,
  ) : async ICRCTokenTxReceipt {
    let getSubbaccount : Blob = await sonicCanister.initiateICRC1Transfer();
    let transferArgs : ICRCTransferArg = {
      from_subaccount = null;
      to : ICRCAccount = {
        owner = sonicCanisterId;
        subaccount = ?getSubbaccount;
      };
      amount = transferAmount;
    };
    let result = await sellTokenCanister.icrc1_transfer(transferArgs);
    return (result);
  };

  // Transfer Funds back becasue of Error during transaction execution
  private func _transferFundsBack(
    userPosition : Position,
    sellTokenCanister : ICRC2TokenActor,
    refundAmount : Nat,
  ) : async ICRCTokenTxReceipt {
    let transferFromArgs : ICRCTransferArg = {
      from_subaccount = null;
      to : ICRCAccount = {
        owner = userPosition.destination;
        subaccount = null;
      };
      amount = refundAmount;
    };
    let result = await sellTokenCanister.icrc1_transfer(transferFromArgs);
    return (result);
  };

  // Deposit funds to sonic to be able to use swap function
  private func _depositFundsToSonic(
    userPosition : Position,
    sonicCanister : sonicActor,
    depositAmount : Nat,
  ) : async TxReceipt {
    let depositResult : TxReceipt = await sonicCanister.deposit(userPosition.tokens.sellToken, depositAmount);
    return depositResult;
  };

  // Swap Deposited funds by using swapExactTokensForTokens func from sonic
  private func _SwapExactTokensForTokens(
    userPosition : Position,
    sonicCanister : sonicActor,
    swapAmount : Nat,
  ) : async TxReceipt {
    let sellToken = Principal.toText(userPosition.tokens.sellToken);
    let buyToken = Principal.toText(userPosition.tokens.buyToken);
    let swapResult : TxReceipt = await sonicCanister.swapExactTokensForTokens(swapAmount, 0, [sellToken, buyToken], userPosition.managerCanister, Time.now() + 300000000000);
    return swapResult;
  };

  // Withdraw swapped funds from sonic
  private func _WithdrawFromSonic(
    userPosition : Position,
    transaction : Transaction,
    sonicCanister : sonicActor,
    amountToWithdraw : Nat,
  ) : async TxReceipt {
    let buyToken = userPosition.tokens.buyToken;
    let withdrawResult : TxReceipt = await sonicCanister.withdraw(buyToken, amountToWithdraw);
    return withdrawResult;
  };

  // Transfer Bought tokens back to users wallet
  private func _TransferBoughtTokenToUserWallet(
    userPosition : Position,
    buyTokenCanister : ICRC2TokenActor,
    amount : Nat,
    buyTokenFee : Nat,
  ) : async ICRCTokenTxReceipt {
    let transferFromArgs : ICRCTransferArg = {
      from_subaccount = null;
      to : ICRCAccount = {
        owner = userPosition.destination;
        subaccount = null;
      };
      amount = amount - buyTokenFee;
    };
    let result = await buyTokenCanister.icrc1_transfer(transferFromArgs);
    return (result);
  };

  private func _addToPlatformIncome(token : Principal, amount : Nat) {
    let currentValueOfToken : Nat = switch (platformIncome.get(token)) {
      case (null) { 0 };
      case (?value) { value };
    };

    platformIncome.put(token, amount + currentValueOfToken);
  };

  // Cron timer function
  private func cronTimer() : async () {
    // Create a buffer of activePosition hashmap to Iterate over
    let positionsToIteratreOver = Buffer.fromIter<Position>(activePositions.vals());

    // Iterating over all active posittions
    for (userPosition in positionsToIteratreOver.vals()) {
      // Check if the position is active
      switch (userPosition.positionStatus) {
        case (#Active) {
          var markAsInActive = true;
          // Iterating over transactions of a poisition
          for (transaction in userPosition.swaps.vals()) {
            // Checking the transaction status
            switch (transaction.transactionStatus) {
              // If the transaction has not been triggered and the unix time is less or equla to time.now() the transaction should be triggered
              case (#Pending) {
                markAsInActive := false;
              };
              case (#NotTriggered) {
                markAsInActive := false;
                if (transaction.transactionTime <= utils.nanoToSecond(Time.now())) {
                  await _proccedTransaction(userPosition, transaction);
                };
              };
              case _ {};
            };
          };

          //If all the transactions are triggered put the position status as #InActive
          switch (markAsInActive) {
            case (true) {
              let newPosition : Position = {
                initialAllowance = userPosition.initialAllowance;
                leftAllowance = userPosition.leftAllowance;
                destination = userPosition.destination;
                positionId = userPosition.positionId;
                // TODO : Write the logic for changing the position status to successful or faild
                positionStatus = #InActive;
                tokens = userPosition.tokens;
                swaps = userPosition.swaps;
                managerCanister = userPosition.managerCanister;
              };
              activePositions.put(userPosition.positionId, newPosition);
            };
            case (false) {};
          };
        };
        case _ {

        };
      };
    };
    return ();
  };

  ignore recurringTimer(#seconds cronInterval, cronTimer);

  // Admin Functions

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

  // Withdraw to address
  public shared ({ caller }) func transferTokens(token : Principal, to : Principal, amount : Nat) : async Text {
    if (caller == admin) {
      let transferArgs = {
        from_subaccount = null;
        to : ICRCAccount = { owner = to; subaccount = null };
        amount;
      };
      let tokenActor : ICRC2TokenActor = icrcTypes._getTokenActor(token);
      let reuslt : ICRCTokenTxReceipt = await tokenActor.icrc1_transfer(transferArgs);
      switch (reuslt) {
        case (#Ok SuccessId) {
          return "Success";
        };
        case _ {
          return "Transfer Failed";
        };
      };
    };
    return "You're not an admin";

  };

  //withdraw from sonic
  public shared ({ caller }) func withdrawFromSonic(token : Principal, amount : Nat) : async Text {
    if (caller == admin) {
      let sonicCanister : sonicActor = sonicTypes._getSonicActor(sonicCanisterId);
      let reuslt : TxReceipt = await sonicCanister.withdraw(token, amount);
      switch (reuslt) {
        case (#ok successId) { return "Transfer Successful" };
        case _ { return "Transfer Failed" };
      };
    };
    return "You're not an admin";

  };

  // Get platform income
  public shared ({ caller }) func showPlatformIncome() : async Result.Result<[(Principal, Nat)], Text> {
    if (caller == admin) {
      return #ok(Iter.toArray(platformIncome.entries()));
    };
    return #err("You're not an admin");

  };

  // System Functions
  // Pre-upgrade logic
  stable var usersPositionsArray : [(PositionId, Position)] = [];
  stable var pairsArray : [Pair] = [];
  stable var platformIncomeArray : [(Principal, Nat)] = [];

  system func preupgrade() {

    //saving active positions in a stable array
    usersPositionsArray := Iter.toArray(activePositions.entries());

    //saving pairs in stable array
    pairsArray := Buffer.toArray(supportedPirs);

    //saving platform incom
    platformIncomeArray := Iter.toArray(platformIncome.entries());
  };
  // Post-upgrade logic
  system func postupgrade() {
    for ((positionId, userPosition) in usersPositionsArray.vals()) {
      //putting active positions from a stable array
      activePositions.put(positionId, userPosition);
    };
    usersPositionsArray := [];

    for (pair in pairsArray.vals()) {
      supportedPirs.add(pair);
    };
    pairsArray := [];

    for ((token, amount) in platformIncomeArray.vals()) {
      platformIncome.put(token, amount);
    };
    platformIncomeArray := [];
  };
};
