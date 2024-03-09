import Blob "mo:base/Blob";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
module {
    public type TxReceipt = Result.Result<Nat, Text>;
    public type sonicActor = actor {
        initiateICRC1Transfer : shared () -> async Blob;
        deposit : shared (Principal, Nat) -> async TxReceipt;
    };
    public func _getSonicActor(sonicCanisterId : Principal) : sonicActor {
        var sonicCanister : sonicActor = actor (Principal.toText(sonicCanisterId));
        return sonicCanister;

    };
};
