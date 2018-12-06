pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";
import "../zeppelin/math/SafeMath.sol";
import "./Registry.sol";
import "./RateOfGood.sol";

contract VolunteerService is Destructible {
    using SafeMath for uint256;

    // the registry contract
    Registry public registry;

    // the rate of good contract
    RateOfGood public rateOfGood;

    // default maximum of tokens per valid verification
    int256 rate = 1;

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
     * @param user public wallet address of the volunteer
     * @param userId app generated unique id of the volunteer
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     */
    event EventVolunteerSignUp(address indexed user, uint256 userId, address indexed charity, uint256 charityId, uint256 campaignId);

    /**
     * @dev event for volunteer verification
     * @param user public wallet address of the volunteer
     * @param userId app generated unique id of the volunteer
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     * @param time the amount of time volunteered
     */
    event EventVolunteerVerify(address indexed user, uint256 userId, address indexed charity, uint256 charityId, uint256 campaignId, uint256 time);

    struct VolunteerUser {
        uint256 time; // the amount of time the volunteer worked
        uint256 id; // user id in the database
        address user; // user public wallet address
        bool exists; // used to check if the volunteer exists
    }

    struct VolunteerCampaign {
        address charity; // charity public wallet address
        uint256 charityId; // charity id in the database
        uint256 campaignId; // campaign id in the database
        bool exists; // used to check if the campaign exists
        mapping(uint256 => VolunteerUser) volunteers; // maps the campaign is to volunteers
    }

    // maps charities to volunteer campaigns
    mapping(uint256 => mapping(uint256 => VolunteerCampaign)) volunteerCampaigns;

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

    modifier validCampaign(uint256 _charityId, uint256 _campaignId) {
        require(volunteerCampaigns[_charityId][_campaignId].exists, "Campaign must exist");
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
        if (volunteerCampaigns[_charityId][_campaignId].exists) {
            revert("Campaign already exists");
        }

        volunteerCampaigns[_charityId][_campaignId] = VolunteerCampaign(_charity, _charityId, _campaignId, true);
        
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
        uint256 _campaignId) public isVolunteer(_volunteer) isCharity(_charity) validId(_volunteerId) validId(_charityId) validId(_campaignId) validCampaign(_charityId, _campaignId) onlyOwner returns(bool) {
        
        if (volunteerCampaigns[_charityId][_campaignId].volunteers[_volunteerId].exists) {
            revert("Volunteer already exists");
        }

        volunteerCampaigns[_charityId][_campaignId].volunteers[_volunteerId] = VolunteerUser(0, _volunteerId, _volunteer, true);
        
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
        uint256 _time) public onlyOwner returns(int256) {
        require(volunteerCampaigns[_charityId][_campaignId].volunteers[_volunteerId].exists, "Volunteer must exist");

        volunteerCampaigns[_charityId][_campaignId].volunteers[_volunteerId] = VolunteerUser(_time, _volunteerId, _volunteer, true);

        int256 output = 0; 

        // if (_time * 1 hours >= 1 hours) {
        //     // example rate of good
        //     int256 rog = -3;
        //     int256 adjustment = rog * (10 ** 16);
        //     int256 reward = rate * (10 ** 18);
        //     output = reward + adjustment;
        // }
        
        emit EventVolunteerVerify(_volunteer, _volunteerId, _charity, _charityId, _campaignId, _time);
        
        return output;
    }
}