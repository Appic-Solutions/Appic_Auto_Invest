import Blob "mo:base/Blob";
import Principal "mo:base/Principal";
module {
    public type sonicActor = actor {
        initiateICRC1Transfer : shared () -> async Blob;
    };
    public func _getSonicActor(sonicCanisterId : Principal) : sonicActor {

        var sonicCanister : sonicActor = actor (Principal.toText(sonicCanisterId));
        return sonicCanister;

    };
};
