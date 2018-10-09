pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";
import "../zeppelin/math/SafeMath.sol";
import "./Registry.sol";
import "./RateOfGood.sol";
import "../CommitGoodToken.sol";

contract Volunteer is Destructible {
    using SafeMath for uint256;

    // the registry contract
    Registry public registry;

    // the token contract
    CommitGoodToken public token;

    // the rate of good contract
    RateOfGood public rateOfGood;

    // default maximum of tokens per verification
    uint256 reward = 3;

    /**
     * @param _registry address of the registry contract
     * @param _token address of the token contract
     * @param _rateOfGood address of the rate of good contract
     */
    constructor(Registry _registry, CommitGoodToken _token, RateOfGood _rateOfGood) {
        require(_registry != address(0), "0x0 is not a valid address");
        require(_registry != address(this), "Contract address is not a valid address");
        require(_token != address(0), "0x0 is not a valid address");
        require(_token != address(this), "Contract address is not a valid address");
        require(_rateOfGood != address(0), "0x0 is not a valid address");
        require(_rateOfGood != address(this), "Contract address is not a valid address");
        registry = _registry;
        token = _token;
        rateOfGood = _rateOfGood;
    }

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
        mapping(uint256 => mapping(uint256 => VolunteerUser)) volunteers; // maps the campaign is to volunteers
    }

    // maps charities and thier volunteer campaigns
    mapping(uint256 => VolunteerCampaign) volunteerCampaigns;

    /**
     * @dev event for a volunteer sign up
     * @param user public wallet address of the volunteer
     * @param userId app generated unique id of the volunteer
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     */
    event VolunteerSignUp(address indexed user, uint256 userId, address indexed charity, uint256 charityId, uint256 campaignId);

    /**
     * @dev event for volunteer verification
     * @param user public wallet address of the volunteer
     * @param userId app generated unique id of the volunteer
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     * @param time the amount of time volunteered
     */
    event VolunteerVerify(address indexed user, uint256 userId, address indexed charity, uint256 charityId, uint256 campaignId, uint256 time);

    modifier isUser(address _address) {
        require(registry.checkUser(_address), "Must be a valid user");
        _;
    }

    modifier isCharity(address _address) {
        require(registry.checkCharity(_address), "Must be a valid charity");
        _;
    }

    /**
     * @dev applies that a user will volunteer for a charity
     * @param _user public wallet address of the volunteer
     * @param _userId app generated unique id of the volunteer
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     */
    function signUp(
        address _user, 
        uint256 _userId, 
        address _charity, 
        uint256 _charityId, 
        uint256 _campaignId) public isUser(_user) isCharity(_charity) {
        
        if (volunteerCampaigns[_charityId].exists == false) {
            volunteerCampaigns[_charityId] = VolunteerCampaign(_charity, _charityId, _campaignId, true);
        }

        volunteerCampaigns[_charityId].volunteers[_campaignId][_userId] = VolunteerUser(0, _userId, _user, true);
        emit VolunteerSignUp(_user, _userId, _charity, _charityId, _campaignId);
    }

    /**
     * @dev commits that the user volunteered for a charity
     * @param _user public wallet address of the volunteer
     * @param _userId app generated unique id of the volunteer
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     * @param _time the amount of time volunteered
     */
    function verify(
        address _user, 
        uint256 _userId, 
        address _charity, 
        uint256 _charityId, 
        uint256 _campaignId, 
        uint256 _time) public isUser(_user) isCharity(_charity) {        
        require(volunteerCampaigns[_charityId].exists, "Campaign must exist");
        require(volunteerCampaigns[_charityId].volunteers[_campaignId][_userId].exists, "Volunteer must exist");

        volunteerCampaigns[_charityId].volunteers[_campaignId][_userId] = VolunteerUser(_time, _userId, _user, true);
        
        require(_time > 1 hours, "Not enough time volunteered for a reward");
        require(token.mint(_user, reward), "Unable to mint new tokens");
     
        emit VolunteerVerify(_user, _userId, _charity, _charityId, _campaignId, _time);
    }
}