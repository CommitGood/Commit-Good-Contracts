pragma solidity ^0.4.24;

import "./zeppelin/lifecycle/Pausable.sol";
import "./zeppelin/lifecycle/Destructible.sol";
import "./zeppelin/math/SafeMath.sol";
import "./CommitGoodToken.sol";

contract CurrencyGoodCampaign is Pausable, Destructible {
    using SafeMath for uint256;

    // Authorized buyer of the tokens
    mapping (address => bool) public buyer;

    // The token being sold
    CommitGoodToken public token;

    // Address where funds are collected
    address public wallet;

    // How many token units a buyer gets per wei
    uint256 public rate;

    /**
     * Event for token purchase logging
     * @param purchaser who paid for the tokens
     * @param beneficiary who got the tokens
     * @param value weis paid for purchase
     * @param amount amount of tokens purchased
     */
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);

    /**
     * @param _rate Number of token units a buyer gets per wei
     * @param _wallet Address where collected funds will be forwarded to
     * @param _buyer Address of the authorized buyer who will purchase tokens
     * @param _token Address of the token being sold
     */
    constructor(uint256 _rate, address _wallet, address _buyer, CommitGoodToken _token) public {
        require(_rate > 0, "Rate must be greater than 0");
        require(_wallet != address(0), "0x0 is not a valid address");
        require(_buyer != address(0), "0x0 is not a valid address");
        rate = _rate;
        wallet = _wallet;
        token = _token;
        buyer[_buyer] = true;
    }

    /**
     * @dev fallback function
     */
    function () external payable {
        revert("Default payment function is disabled");
    }

    modifier validBuyer(address _addr) {
        require(_addr != address(0), "0x0 is not a valid address");
        require(_addr != address(this), "Contract address is not a valid address");
        require(buyer[_addr], "Address does not match the buyer address");
        _;
    }

    /**
     * @dev sets the wei rate of the contract
     * @param _rate Number of token units a buyer gets per wei
     */
    function setRate(uint256 _rate) public onlyOwner {
        require(_rate > 0, "Rate must be greater than 0");
        rate = _rate;
    }

    /**
     * @dev low level token purchase
     * @param _beneficiary Address receiving the token purchase
     */
    function buyTokens(address _beneficiary) public payable whenNotPaused validBuyer(msg.sender) {
        uint256 weiAmount = msg.value;
        
        _preValidatePurchase(_beneficiary, weiAmount);
        
        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(weiAmount);

        _processPurchase(_beneficiary, tokens);

        emit TokenPurchase(msg.sender, _beneficiary, weiAmount, tokens);

        _forwardFunds();
    }

    /**
     * @dev Validation of an incoming purchase. Use require statements to revert state when conditions are not met. Use super to concatenate validations.
     * @param _beneficiary Address receiving the token purchase
     * @param _weiAmount Value in wei involved in the purchase
     */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal pure {
        require(_beneficiary != address(0), "0x0 is not a valid address");
        require(_weiAmount != 0, "Wei amount must not equal 0");
    }

    /**
     * @dev Override to extend the way in which ether is converted to tokens.
     * @param _weiAmount Value in wei to be converted into tokens
     * @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
        return _weiAmount.mul(rate);
    }

    /**
     * @dev Source of tokens. Override this method to modify the way in which the crowdsale ultimately gets and sends its tokens.
     * @param _beneficiary Address receiving the token purchase
     * @param _tokenAmount Number of tokens to be emitted
     */
    function _deliverTokens(address _beneficiary, uint256 _tokenAmount) internal {
        require(token.mint(_beneficiary, _tokenAmount), "Token mint was not successful");
    }

    /**
     * @dev Executed when a purchase has been validated and is ready to be executed. Not necessarily emits/sends tokens.
     * @param _beneficiary Address receiving the tokens
     * @param _tokenAmount Number of tokens to be purchased
     */
    function _processPurchase(address _beneficiary, uint256 _tokenAmount) internal {
        _deliverTokens(_beneficiary, _tokenAmount);
    }

    /**
     * @dev Determines how ETH is stored/forwarded on purchases.
     */
    function _forwardFunds() internal {
        wallet.transfer(msg.value);
    }
}