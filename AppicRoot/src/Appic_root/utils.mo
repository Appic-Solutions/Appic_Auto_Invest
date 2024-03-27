import Float "mo:base/Float";

module utils {
    public func nanoToSecond(nano : Int) : Int {
        let secondFloat = Float.fromInt(nano) / 1_000_000_000.0;
        return Float.toInt(secondFloat);
    };
};
