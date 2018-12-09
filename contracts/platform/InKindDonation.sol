pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";
import "./Registry.sol";
import "./RateOfGood.sol";
import "./PlatformContract.sol";

contract InKindDonation is PlatformContract, Destructible {

    // default maximum of tokens per valid verification
    int256 rate = 3 * (10 ** 18);

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
     * @dev event for a newly created in kind donation campaign
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     */
    event EventInKindDonationCampaign(address indexed charity, uint256 charityId, uint256 campaignId);

    /**
     * @dev event for a in kind donation
     * @param user public wallet address of the donator
     * @param userId app generated unique id of the donator
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     */
    event EventInKindDonation(address indexed user, uint256 userId, address indexed charity, uint256 charityId, uint256 campaignId);

    /**
     * @dev event for volunteer verification
     * @param user public wallet address of the volunteer
     * @param userId app generated unique id of the volunteer
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     * @param donation the estimated amount by the charity of the in kind donation
     */
    event EventInKindDonationVerify(address indexed user, uint256 userId, address indexed charity, uint256 charityId, uint256 campaignId, uint256 donation);

    modifier isDonater(address _address) {
        require(registry.checkUser(_address), "Must be a valid donater");
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
     * @dev creates the in kind donation campaign
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     */
    function createInKindDonationCampaign(
        address _charity, 
        uint256 _charityId, 
        uint256 _campaignId) public isCharity(_charity) validId(_charityId) validId(_campaignId) onlyOwner returns (bool) {

        emit EventInKindDonationCampaign(_charity, _charityId, _campaignId);

        return true;
    }

    /**
     * @dev applies that a user will donate to a charity
     * @param _donater public wallet address of the donater
     * @param _donaterId app generated unique id of the donater
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     */
    function inKindDonation(
        address _donater,
        uint256 _donaterId,
        address _charity,
        uint256 _charityId,
        uint256 _campaignId) public isDonater(_donater) isCharity(_charity) validId(_donaterId) validId(_charityId) validId(_campaignId) onlyOwner returns (bool) {

        emit EventInKindDonation(_donater, _donaterId, _charity, _charityId, _campaignId);

        return true;
    }

    /**
     * @dev commits that the user donated to a charity
     * @param _donater public wallet address of the donater
     * @param _donaterId app generated unique id of the donater
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     * @param _donation the estimated amount by the charity of the in kind donation
     */
    function inKindDonationVerify(
        address _donater, 
        uint256 _donaterId, 
        address _charity, 
        uint256 _charityId, 
        uint256 _campaignId, 
        uint256 _donation) public isDonater(_donater) isCharity(_charity) validId(_donaterId) validId(_charityId) validId(_campaignId) onlyOwner returns (int256) {
        int256 output = 0;

        if (_donation >= 100) {
            output = rate + rateOfGood.getVolunteerRoG();
        }

        emit EventInKindDonationVerify(_donater, _donaterId, _charity, _charityId, _campaignId, _donation);
        
        return output;
    }
}