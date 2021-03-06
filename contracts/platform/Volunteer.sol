pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";
import "./Registry.sol";
import "./RateOfGood.sol";
import "./PlatformContract.sol";

contract Volunteer is PlatformContract, Destructible {

    // default maximum of tokens per valid verification
    int256 rate = 1 * (10 ** 18);

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
     * @dev event for a newly created campaign
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     */
    event EventVolunteerCampaign(address indexed charity, uint256 charityId, uint256 campaignId);

    /**
     * @dev event for a volunteer sign up
     * @param volunteer public wallet address of the volunteer
     * @param volunteerId app generated unique id of the volunteer
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     */
    event EventVolunteerSignUp(address indexed volunteer, uint256 volunteerId, address indexed charity, uint256 charityId, uint256 campaignId);

    /**
     * @dev event for volunteer verification
     * @param volunteer public wallet address of the volunteer
     * @param volunteerId app generated unique id of the volunteer
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     * @param time the amount of time volunteered
     * @param reward the reward amount
     */
    event EventVolunteerVerify(address indexed volunteer, uint256 volunteerId, address indexed charity, uint256 charityId, uint256 campaignId, uint256 time, int256 reward);

    modifier isVolunteer(address _address) {
        require(registry.checkUser(_address), "Must be a valid volunteer");
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
     * @dev creates the volunteer campaign
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     */
    function createVolunteerCampaign(
        address _charity, 
        uint256 _charityId, 
        uint256 _campaignId) public isCharity(_charity) validId(_charityId) validId(_campaignId) onlyOwner returns (bool) {
        
        emit EventVolunteerCampaign(_charity, _charityId, _campaignId);

        return true;
    }

    /**
     * @dev applies that a user will volunteer for a charity
     * @param _volunteer public wallet address of the volunteer
     * @param _volunteerId app generated unique id of the volunteer
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     */
    function volunteerSignUp(
        address _volunteer, 
        uint256 _volunteerId, 
        address _charity, 
        uint256 _charityId, 
        uint256 _campaignId) public isVolunteer(_volunteer) isCharity(_charity) validId(_volunteerId) validId(_charityId) validId(_campaignId) onlyOwner returns(bool) {
        
        emit EventVolunteerSignUp(_volunteer, _volunteerId, _charity, _charityId, _campaignId);

        return true;
    }

    /**
     * @dev commits that the user volunteered for a charity
     * @param _volunteer public wallet address of the volunteer
     * @param _volunteerId app generated unique id of the volunteer
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     * @param _time the amount of time volunteered
     */
    function volunteerVerify(
        address _volunteer, 
        uint256 _volunteerId, 
        address _charity, 
        uint256 _charityId, 
        uint256 _campaignId, 
        uint256 _time) public isVolunteer(_volunteer) isCharity(_charity) validId(_volunteerId) validId(_charityId) validId(_campaignId) onlyOwner returns(bool) {
        int256 reward = 0; 

        if (_time * 1 hours >= 1 hours) {
            reward = rate + rateOfGood.getVolunteerRoG();
        }
        
        emit EventVolunteerVerify(_volunteer, _volunteerId, _charity, _charityId, _campaignId, _time, reward);
        
        return true;
    }
}