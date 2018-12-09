pragma solidity ^0.4.24;

import "../zeppelin/ownership/Ownable.sol";
import "./Registry.sol";
import "./RateOfGood.sol";

contract PlatformContract is Ownable {

    // the registry contract
    Registry public registry;

    // the rate of good contract
    RateOfGood public rateOfGood;

    /**
     * @dev Event for the registry contract address update
     * @param kontract the address of the new contract
     */
    event EventSetRegistryContract(address kontract);

    /**
     * @dev Event for rate of good contract address update
     * @param kontract the address of the new contract
     */
    event EventSetRateOfGoodContract(address kontract);

    modifier validAddress(address _address) {
        require(_address != address(0), "0x0 is not a valid address");
        require(_address != address(this), "Contract address is not a valid address");
        _;
    }

    /**
     * @dev sets the regitry contract address
     * @param _registry the new registry contract address
     */
    function setRegistry(Registry _registry) public validAddress(_registry) onlyOwner returns (bool) {
        registry = _registry;

        emit EventSetRegistryContract(_registry);

        return true;
    }

    /**
     * @dev sets the rate of good contract address
     * @param _rateOfGood the new rate of good contract address
     */
    function setRateOfGood(RateOfGood _rateOfGood) public validAddress(_rateOfGood) onlyOwner returns (bool) {
        rateOfGood = _rateOfGood;

        emit EventSetRateOfGoodContract(_rateOfGood);

        return true;
    }
}