pragma solidity ^0.4.23;

import "../CommitGoodToken.sol";

contract MintAgentMock {

    CommitGoodToken public token;

    constructor(CommitGoodToken _token) public {
        token = _token;
    }

    function mintTokens(address _addr, uint256 _amount) public {
        require(CommitGoodToken(token).mint(_addr, _amount));
    }
}