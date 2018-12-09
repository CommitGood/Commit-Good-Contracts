pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";
import "./Registry.sol";
import "./RateOfGood.sol";
import "./PlatformContract.sol";

contract Delivery is PlatformContract, Destructible {

    // reward rate for delivery items under 50lbs and w/n 20 miles
    int256 rateA = 25 * (10 ** 18);

    // reward rate for delivery items over 50lbs and w/n 20 miles
    int256 rateB = 50 * (10 ** 18);

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

    /**
     * @dev event for delivery request of an item
     * @param recipient the public wallet address of the recipient
     * @param recipientId app generated unique id of the recipient
     * @param itemDescription the item description
     */
    event EventDeliveryRequested(address indexed recipient, uint256 recipientId, string itemDescription);

    /**
     * @dev event for delivery verification
     * @param courier the public wallet address of the courier
     * @param courierId app generated unique id of the courier
     * @param recipient the public wallet address of the recipient
     * @param recipientId app generated unique id of the recipient
     * @param itemDescription the item description
     * @param totalWeight the total weight of the item delivered
     */
    event EventDeliveryVerify(address courier, uint256 courierId, address recipient, uint256 recipientId, string itemDescription, uint256 totalWeight);

    modifier isCourier(address _address) {
        require(registry.checkUser(_address), "Must be an authorized courier");
        _;
    }

    modifier isRecipient(address _address) {
        require(registry.checkUser(_address) || registry.checkCharity(_address), "Must be an authorized recipient");
        _;
    }

    modifier validId(uint256 _id) {
        require(_id > 0, "Id must be greater than zero");
        _;
    }

    /**
     * @dev applies that a reipient requires an item delivery
     * @param _recipient the public wallet address of the recipient
     * @param _recipientId app generated unique id of the recipient
     * @param _itemDescription the item description
     */
    function deliveryRequested(
        address _recipient, 
        uint256 _recipientId, 
        string _itemDescription) public isRecipient(_recipient) validId(_recipientId) onlyOwner returns (bool) {

        emit EventDeliveryRequested(_recipient, _recipientId, _itemDescription);

        return true;
    }

    /**
     * @dev commits that a courier delivered a requested item
     * @param _courier the public wallet address of the courier
     * @param _courierId app generated unique id of the courier
     * @param _recipient the public wallet address of the recipient
     * @param _recipientId app generated unique id of the recipient
     * @param _itemDescription the item description
     * @param _totalWeight the total weight of the item delivered
     */
    function deliveryVerify(
        address _courier, 
        uint256 _courierId, 
        address _recipient, 
        uint256 _recipientId, 
        string _itemDescription,
        uint256 _totalWeight) public isCourier(_courier) validId(_courierId) isRecipient(_recipient) validId(_recipientId) onlyOwner returns (int256) {
        
        int256 output = 0;

        if (_totalWeight >= 50) {
            output = rateB + rateOfGood.getDeliveryRoG();
        } else {
            output = rateA + rateOfGood.getDeliveryRoG();
        }

        emit EventDeliveryVerify(_courier, _courierId, _recipient, _recipientId, _itemDescription, _totalWeight);

        return output;
    }
}