pragma solidity ^0.4.23;

import "./zeppelin/token/ERC20/StandardToken.sol";
import "./zeppelin/ownership/Ownable.sol";
import "./zeppelin/math/SafeMath.sol";

/**
 * @title Commit Good token
 * @dev Commit Good ERC20 Token, that inherits from standard token.
 */
contract CommitGoodToken is StandardToken, Ownable {
    using SafeMath for uint256;

    string public symbol = "GOOD";
    string public name = "GOOD";
    uint8 public decimals = 18;

    uint256 public maxSupply = 200000000 * (10 ** uint256(decimals));
    mapping (address => bool) public mintAgents;
    bool public mintingFinished = false;

    event MintAgentChanged(address indexed addr, bool state);
    event Mint(address indexed to, uint256 amount);
    event MintFinished();

    modifier onlyMintAgent() {
        require(mintAgents[msg.sender]);
        _;
    }

    modifier canMint() {
        require(!mintingFinished);
        _;
    }

    modifier validAddress(address _addr) {
        require(_addr != address(0));
        require(_addr != address(this));
        _;
    }

    /**
     * @dev Owner can allow a contract to mint tokens.
     */
    function setMintAgent(address _addr, bool _state) public onlyOwner validAddress(_addr) {
        mintAgents[_addr] = _state;
        emit MintAgentChanged(_addr, _state);
    }

    /**
     * @dev Function to mint tokens
     * @param _addr The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(address _addr, uint256 _amount) public onlyMintAgent canMint validAddress(_addr) returns (bool) {
        totalSupply_ = totalSupply_.add(_amount);
        balances[_addr] = balances[_addr].add(_amount);
        emit Mint(_addr, _amount);
        emit Transfer(address(0), _addr, _amount);
        return true;
    }

    /**
     * @dev Function to stop minting new tokens.
     * @return True if the operation was successful.
     */
    function finishMinting() public onlyMintAgent canMint returns (bool) {
        mintingFinished = true;
        emit MintFinished();
        return true;
    }
}