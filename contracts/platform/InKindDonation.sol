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
     * @param donor public wallet address of the donor
     * @param donorId app generated unique id of the donor
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     */
    event EventInKindDonation(address indexed donor, uint256 donorId, address indexed charity, uint256 charityId, uint256 campaignId);

    /**
     * @dev event for volunteer verification
     * @param donor public wallet address of the donor
     * @param donorId app generated unique id of the donor
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param campaignId app generated unique id of the campaign
     * @param amount the estimated amount by the charity of the in kind donation
     * @param reward the reward amount
     */
    event EventInKindDonationVerify(address indexed donor, uint256 donorId, address indexed charity, uint256 charityId, uint256 campaignId, uint256 amount, int256 reward);

    modifier isDonor(address _address) {
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
     * @param _donor public wallet address of the donor
     * @param _donorId app generated unique id of the donor
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     */
    function inKindDonation(
        address _donor,
        uint256 _donorId,
        address _charity,
        uint256 _charityId,
        uint256 _campaignId) public isDonor(_donor) isCharity(_charity) validId(_donorId) validId(_charityId) validId(_campaignId) onlyOwner returns (bool) {

        emit EventInKindDonation(_donor, _donorId, _charity, _charityId, _campaignId);

        return true;
    }

    /**
     * @dev commits that the user donated to a charity
     * @param _donor public wallet address of the donor
     * @param _donorId app generated unique id of the donor
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _campaignId app generated unique id of the campaign
     * @param _amount the estimated amount by the charity of the in kind donation
     */
    function inKindDonationVerify(
        address _donor, 
        uint256 _donorId, 
        address _charity, 
        uint256 _charityId, 
        uint256 _campaignId, 
        uint256 _amount) public isDonor(_donor) isCharity(_charity) validId(_donorId) validId(_charityId) validId(_campaignId) onlyOwner returns (bool) {
        int256 reward = 0;

        if (_amount >= 100) {
            reward = rate + rateOfGood.getInKindRoG();
        }

        emit EventInKindDonationVerify(_donor, _donorId, _charity, _charityId, _campaignId, _amount, reward);
        
        return true;
    }
}