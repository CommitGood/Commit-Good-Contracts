pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";
import "./Registry.sol";
import "./RateOfGood.sol";
import "./PlatformContract.sol";

contract FundRaising is PlatformContract, Destructible {

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

    /**
     * @dev event for fund raiser campaign creation
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     * @param goal the fund raising goal
     */
    event EventCreateFundRaiserCampaign(address charity, uint256 charityId, uint256 campaignId, uint256 goal);

    /**
     * @dev event for when a fund raiser campaign recieves a donation
     * @param donator public wallet address of the donator
     * @param donatorId app generated unique id of the donator
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     * @param amount the amount donated
     * @param goalReached lets us know if the goal was reached
     */
    event EventFundsDonated(address donator, uint256 donatorId, address charity, uint256 charityId, uint256 campaignId, uint256 amount, bool goalReached);

    modifier isDonator(address _address) {
        require(registry.checkUser(_address), "Must be a valid donator");
        _;
    }

    modifier isCharity(address _address) {
        require(registry.checkCharity(_address), "Must be a valid charity");
        _;
    }

    modifier validId(uint256 _id) {
        require(_id > 0, "Id must be greater than zero");
        _;
    }

    /**
     * @dev creates the fund raiser campaign creation
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     * @param _goal the fund raising goal
     */
    function createFundRaiserCampaign(
        address _charity, 
        uint256 _charityId, 
        uint256 _campaignId,
        uint256 _goal) public isCharity(_charity) validId(_charityId) validId(_campaignId) onlyOwner returns (bool) {

        emit EventCreateFundRaiserCampaign(_charity, _charityId, _campaignId, _goal);

        return true;
    }

    /**
     * @dev apply a donation to a fund raiser campaign
     * @param _donator public wallet address of the donator
     * @param _donatorId app generated unique id of the donator
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     * @param _amount the amount donated
     * @param _goalReached lets us know if the goal was reached
     */
    function raiseFunds(
        address _donator, 
        uint256 _donatorId, 
        address _charity, 
        uint256 _charityId, 
        uint256 _campaignId, 
        uint256 _amount,
        bool _goalReached) public isDonator(_donator) validId(_donatorId) isCharity(_charity) validId(_charityId) validId(_campaignId) onlyOwner returns (int256) {
        int256 output = 0;

        if (_amount >= 10 && _amount <= 24) {
            output = rateA + rateOfGood.getFundRaisingRoG();
        } else if (_amount >= 25 && _amount <= 99) {
            output = rateB + rateOfGood.getFundRaisingRoG();
        } else {
            output = rateC + rateOfGood.getFundRaisingRoG();
        }

        emit EventFundsDonated(_donator, _donatorId, _charity, _charityId, _campaignId, _amount, _goalReached);

        return output;
    }
}