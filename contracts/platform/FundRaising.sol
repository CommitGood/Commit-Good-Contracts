pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";
import "./Registry.sol";
import "./RateOfGood.sol";
import "./PlatformContract.sol";

contract Delivery is PlatformContract, Destructible {

    // reward for donated funds b/t $10-24
    int256 rateA = 1 * (10 ** 18);
    // reward for donated funds b/t $25-$99
    int256 rateB = 2 * (10 ** 18);
    // reward for donated funds over $100
    int256 rateC = 3 * (10 ** 18);

    /**
     * @param _registry address of the registry contract
     * @param _rateOfGood address of the rate of good contract
     */
    constructor(Registry _registry, RateOfGood _rateOfGood) public {
        require(_registry != address(0), "0x0 is not a valid address");
        require(_registry != address(this), "Contract address is not a valid address");
        require(_rateOfGood != address(0), "0x0 is not a valid address");
        require(_rateOfGood != address(this), "Contract address is not a valid address");
        registry = _registry;
        rateOfGood = _rateOfGood;
    }
}