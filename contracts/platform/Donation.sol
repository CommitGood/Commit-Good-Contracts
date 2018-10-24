pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";
import "./Registry.sol";
import "../CommitGoodToken.sol";

contract Donation is Destructible {
    // the registry contract
    Registry public registry;

    // the token contract
    CommitGoodToken public token;

    /**
     * @param _registry address of the registry contract
     * @param _token address of the token contract
     */
    constructor(Registry _registry, CommitGoodToken _token) public {
        require(_registry != address(0), "0x0 is not a valid address");
        require(_registry != address(this), "Contract address is not a valid address");
        require(_token != address(0), "0x0 is not a valid address");
        require(_token != address(this), "Contract address is not a valid address");
        registry = _registry;
        token = _token;
    }

    /**
     * @dev emits an event for a donation
     * @param user public wallet address of the volunteer
     * @param userId app generated unique id of the volunteer
     * @param charity public wallet address of the charity
     * @param charityId app generated unique id of the charity
     * @param donation the amount donated to the charity
     * @param reward the reward given to the user based on the amount of the donation
     */
    event UserDonation(address indexed user, uint256 userId, address indexed charity, uint256 charityId, uint256 donation, uint256 reward);

    modifier isUser(address _address) {
        require(registry.checkUser(_address), "Must be a valid user");
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
     * @dev donates tokens to a charity from a user account
     * @param _user public wallet address of the volunteer
     * @param _userId app generated unique id of the volunteer
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _donation the amount donated to the charity
     * @param _reward the reward given to the user based on the amount of the donation
     */
    function donate(
        address _user, 
        uint256 _userId, 
        address _charity, 
        uint256 _charityId, 
        uint256 _donation,
        uint256 _reward) public isUser(_user) isCharity(_charity) validId(_userId) validId(_charityId) returns (bool) {
        require(_donation > 0,"Donation must be greater than zero");
        require(token.mint(_user, _reward), "Unable to mint new tokens");
        emit UserDonation(_user, _userId, _charity, _charityId, _donation, _reward);
        return true;
    }
}