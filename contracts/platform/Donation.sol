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
     * @param amount the amount donated to the charity
     */
    event UserDonation(address indexed user, uint256 userId, address indexed charity, uint256 charityId, uint256 amount);

    modifier isUser(address _address) {
        require(registry.checkUser(_address), "Must be a valid user");
        _;
    }

    modifier isCharity(address _address) {
        require(registry.checkCharity(_address), "Must be a valid charity");
        _;
    }

    /**
     * @dev donates tokens to a charity from a user account
     * @param _user public wallet address of the volunteer
     * @param _userId app generated unique id of the volunteer
     * @param _charity public wallet address of the charity
     * @param _charityId app generated unique id of the charity
     * @param _amount the amount donated to the charity
     */
    function donate(
        address _user, 
        uint256 _userId, 
        address _charity, 
        uint256 _charityId, 
        uint256 _amount) public isUser(_user) isCharity(_charity) returns (bool) {
        require(token.transferFrom(_user, _charity, _amount), "Unable to transfer tokens from account");
        emit UserDonation(_user, _userId, _charity, _charityId, _amount);
        return true;
    }
}