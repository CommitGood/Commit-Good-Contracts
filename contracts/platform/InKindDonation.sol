pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";
import "../zeppelin/math/SafeMath.sol";
import "./Registry.sol";
import "./RateOfGood.sol";

contract InKind is Destructible {
    using SafeMath for uint256;

    // the registry contract
    Registry public registry;

    // the rate of good contract
    RateOfGood public rateOfGood;

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
    event EventInKindDonationCampaign(address indexed charity, uint256 charityId, uint256 campaignId);

    event EventInKindDonationSent();

    event EventInKindDonationVerify();

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

    function inKindDonation() public onlyOwner {

    }

    function inKindDonationVerify() public onlyOwner {

    }
}