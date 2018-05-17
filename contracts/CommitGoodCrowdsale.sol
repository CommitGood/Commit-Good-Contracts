pragma solidity ^0.4.23;

import "./zeppelin/math/SafeMath.sol";
import "./zeppelin/crowdsale/Crowdsale.sol";
import "./zeppelin/ownership/Ownable.sol";
import "./WhiteListRegistry.sol";
import "./CommitGoodToken.sol";

contract CommitGoodCrowdsale is Crowdsale, Ownable {
    using SafeMath for uint256;

    uint256 public cap;
    uint256 public openingTime;
    uint256 public closingTime;

    address public whiteListAddress;

    // solium-disable-next-line max-len
    constructor(uint256 _openingTime, uint256 _closingTime, uint256 _rate, address _wallet, uint256 _cap, CommitGoodToken _token, address _whiteListAddress) public Crowdsale(_rate, _wallet, _token) {
		//As goal needs to be met for a successful crowdsale
		//the value needs to less or equal than a cap which is limit for accepted funds
        require(_cap > 0);
		// solium-disable-next-line security/no-block-members
        require(_openingTime >= now);
        require(_closingTime >= _openingTime);

        openingTime = _openingTime;
        closingTime = _closingTime;
        cap = _cap;
        whiteListAddress = _whiteListAddress;
    }

	/**
   	 * @dev Checks whether the cap has been reached. 
     * @return Whether the cap was reached
     */
    function capReached() public view returns (bool) {
        return weiRaised >= cap;
    }

	/**
   	 * @dev Checks whether the period in which the crowdsale is open has already elapsed.
   	 * @return Whether crowdsale period has elapsed
   	 */
    function hasClosed() public view returns (bool) {
        // solium-disable-next-line security/no-block-members
        return block.timestamp > closingTime;
    }

    /**
   	 * @dev Extend parent behavior requiring purchase to respect the funding cap.
   	 * @param _beneficiary Token purchaser
   	 * @param _weiAmount Amount of wei contributed
   	 */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal {
        super._preValidatePurchase(_beneficiary, _weiAmount);
        // solium-disable-next-line security/no-block-members
        require(now >= openingTime && now <= closingTime);
        require(weiRaised.add(_weiAmount) <= cap);
        require(WhiteListRegistry(whiteListAddress).isAmountAllowed(_beneficiary, _weiAmount));
    }

    /**
     * @dev Source of tokens in which the crowdsale ultimately gets and sends its tokens.
     * @param _beneficiary Address performing the token purchase
     * @param _tokenAmount Number of tokens to be emitted
     */
    function _deliverTokens(address _beneficiary, uint256 _tokenAmount) internal {
        require(CommitGoodToken(token).mint(_beneficiary, _tokenAmount));
    }
}