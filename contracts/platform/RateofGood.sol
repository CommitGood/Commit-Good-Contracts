pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";

contract RateOfGood is Destructible {

    int256 inKindRoG = 0;
    int256 volunteerRoG = 0;
    int256 deliveryRoG = 0;
}