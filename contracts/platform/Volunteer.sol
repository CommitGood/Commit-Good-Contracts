pragma solidity ^0.4.24;

import "../zeppelin/lifecycle/Destructible.sol";
import "../zeppelin/math/SafeMath.sol";
import "./Registry.sol";
import "./RateofGood.sol";
import "../CommitGoodToken.sol";

contract Volunteer is Destructible {
    using SafeMath for uint256;

    address public registry;
    address public token;
    address public rateOfGood;

    constructor(address _registry, address _token, address _rateOfGood) {
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

    struct UserVolunteer {
        uint256 time;
        uint256 campaignId;
    }

    struct CharityVolunteers {
        address charity;
        mapping(address => UserVolunteer) volunteers;
    }

    mapping(address => CharityVolunteers) charityVolunteers;

    event VolunteerSignUp(address indexed user, address indexed charity, uint256 campaignId);

    event VolunteerVerify(address indexed user, address indexed charity, uint256 campaignId, uint256 time);

    modifier isUser(address _address) {
        require(Registry(registry).checkUser(_address), "Must be a valid user");
        _;
    }

    modifier isCharity(address _address) {
        require(Registry(registry).checkCharity(_address), "Must be a valid charity");
        _;
    }

    function signUp(address _user, address _charity, uint256 _campaignId) public isUser(_user) isCharity(_charity) {
        charityVolunteers[_charity].volunteers[_user] = UserVolunteer(0, _campaignId);
        emit VolunteerSignUp(_user, _charity, _campaignId);
    }

    function verify(address _charity, address _user, uint256 _campaignId, uint256 _time) public isUser(_user) isCharity(_charity) {
        charityVolunteers[_charity].volunteers[_user] = UserVolunteer(_time, _campaignId);
        // rate of good * token per hour
        emit VolunteerVerify(_user, _charity, _campaignId, _time);
    }
}