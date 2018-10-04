pragma solidity ^0.4.25;

import "../zeppelin/ownership/Ownable.sol";
import "../zeppelin/lifecycle/Destructible.sol";

contract Registry is Ownable, Destructible {

    // Authorized users in the system
    mapping (address => bool) users;

    // Authroized charities in the system
    mapping (address => bool) charities;

    /**
     * Event for authorizations
     * @param registrar address of the account to be authorized
     * @param role type of account either "user" or "charity"
     * @param enabled boolean value that denotes the authorization
     */
    event Authorize(address indexed registrar, string role, bool enabled);

    /**
     * @dev Checks to see if a user is authorized in the system
     * @param _address the address of the user
     * @return A boolean value of the users authorization status
     */
    function checkUser(address _address) public view returns (bool) {
        return users[_address];
    }

    /**
     * @dev Checks to see if a charity is authorized in the system
     * @param _address the address of the charity
     * @return A boolean value of the charity's authorization status
     */
    function checkCharity(address _address) public view returns (bool) {
        return charities[_address];
    }

    /**
     * @dev Sets the authorization status of a user
     * @param _address the address of the user
     * @param _enable the authorization status of a user
     */
    function authorizeUser(address _address, bool _enable) public onlyOwner {
        users[_address] = _enable;
        emit Authorize(_address, "user", _enable);
    }

    /**
     * @dev Sets the authorization status of a charity
     * @param _address the address of the charity
     * @param _enable the authorization status of a charity
     */
    function authroizeCharity(address _address, bool _enable) public onlyOwner {
        charities[_address] = _enable;
        emit Authorize(_address, "charity", _enable);
    }
}