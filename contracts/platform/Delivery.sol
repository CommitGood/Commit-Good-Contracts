pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";
import "../zeppelin/math/SafeMath.sol";
import "./Registry.sol";
import "./RateOfGood.sol";
import "./PlatformContract.sol";

contract Delivery is PlatformContract, Destructible {
    using SafeMath for uint256;

    // reward rate for delivery items under 50lbs and w/n 20 miles
    int256 rateA = 25;

    // reward rate for delivery items over 50lbs and w/n 20 miles
    int256 rateB = 50;

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