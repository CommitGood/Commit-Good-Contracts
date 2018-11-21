pragma solidity ^0.4.25;
pragma experimental ABIEncoderV2;

import "../zeppelin/lifecycle/Destructible.sol";
import "./VolunteerService.sol";

contract VolunteerVerifier is Destructible {
    
    struct Identity {
        uint256 id;
        address wallet;
    }

    struct VolunteerCampagin {
        uint256 id;
        Identity charity;
    }

    struct VolunteerSignUp {
        uint256 charityId;
        address charityAddress;
        uint256 campaignId;
        Identity volunteer;
    }

    struct VolunteerVerify {
        uint256 volunteerId;
        address volunteerAddress;
        uint256 campaignId;
        uint256 time;
        Identity charity;
    }

    string private constant IDENTITY_TYPE = "Identity(uint256 id,address wallet)";
    string private constant VOLUNTEER_CAMPAIGN_TYPE = "VolunteerCampagin(uint256 id,Identity charity)Identity(uint256 id,address wallet)";
    string private constant VOLUNTEER_SIGN_UP_TYPE = "VolunteerSignUp(uint256 chairtyId,address charityAddress,uint256 campaignId,Identity volunteer)Identity(uint256 id,address wallet)";
    string private constant VOLUNTEER_VERIFY_TYPE = "VolunteerVerify(uint256 volunteerId,address volunteerAddress,uint256 campaignId,uint256 time,Identity charity)Identity(uint256 id,address wallet)";

    uint256 constant chainId = 1;
    address private verifyingContract; // set by the constructor
    bytes32 constant salt = 0xfc2d3e431f53c7c1d23171b0912d30daf71e5213960358f16fd8268d5c3e2f92;
    string private constant EIP712_DOMAIN = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)";

    bytes32 private EIP712_DOMAIN_TYPEHASH = keccak256(abi.encodePacked(EIP712_DOMAIN));
    bytes32 private IDENTITY_TYPEHASH = keccak256(abi.encodePacked(IDENTITY_TYPE));
    bytes32 private VOLUNTEER_CAMPAIGN_TYPEHASH = keccak256(abi.encodePacked(VOLUNTEER_CAMPAIGN_TYPE));
    bytes32 private VOLUNTEER_SIGN_UP_TYPEHASH = keccak256(abi.encodePacked(VOLUNTEER_SIGN_UP_TYPE));
    bytes32 private VOLUNTEER_VERIFY_TYPEHASH = keccak256(abi.encodePacked(VOLUNTEER_VERIFY_TYPE));
    bytes32 private DOMAIN_SEPARATOR = keccak256(abi.encode(EIP712_DOMAIN_TYPEHASH, keccak256("Commit Good"), keccak256("1"), chainId, verifyingContract, salt));

    // the voluteer service contract
    VolunteerService public volunteerService;

    constructor(VolunteerService _volunteerService) public {
        verifyingContract = this;
        volunteerService = _volunteerService;
    }

    function hashIdentity(Identity identity) private view returns (bytes32) {
        return keccak256(abi.encode(IDENTITY_TYPEHASH, identity.id, identity.wallet));
    }

    function hashVolunteerCampaign(VolunteerCampagin memory volunteerCampaign) private view returns (bytes32) {
        return keccak256(abi.encodePacked("\\x19\\x01", DOMAIN_SEPARATOR, keccak256(abi.encode(VOLUNTEER_CAMPAIGN_TYPEHASH, volunteerCampaign.id, hashIdentity(volunteerCampaign.charity)))));
    }

    function hashVolunteerSignUp(VolunteerSignUp memory volunteerSignUp) private view returns (bytes32) {
        return keccak256(abi.encodePacked("\\x19\\x01", DOMAIN_SEPARATOR, keccak256(abi.encode(VOLUNTEER_SIGN_UP_TYPEHASH, volunteerSignUp.charityId, volunteerSignUp.charityAddress, volunteerSignUp.campaignId, hashIdentity(volunteerSignUp.volunteer)))));
    }

    function hashVolunteerVerify(VolunteerVerify memory volunteerVerify) private view returns (bytes32) {
        return keccak256(abi.encodePacked("\\x19\\x01", DOMAIN_SEPARATOR, keccak256(abi.encode(VOLUNTEER_VERIFY_TYPEHASH, volunteerVerify.volunteerId, volunteerVerify.volunteerAddress, volunteerVerify.campaignId, volunteerVerify.time, hashIdentity(volunteerVerify.charity)))));
    }

    function validateVolunteerCampagin(
        address signer,
        VolunteerCampagin memory volunteerCampaign,
        uint8 sigV, 
        bytes32 sigR, 
        bytes32 sigS) public view returns (bool) {
        return signer == ecrecover(hashVolunteerCampaign(volunteerCampaign), sigV, sigR, sigS);
    }

    function validateVolunteerSignUp(
        address signer,
        VolunteerSignUp memory volunteerSignUp,
        uint8 sigV,
        bytes32 sigR,
        bytes32 sigS) public view returns (bool) {
        return signer == ecrecover(hashVolunteerSignUp(volunteerSignUp), sigV, sigR, sigS);
    }

    function validateVolunteerVerify(
        address signer,
        VolunteerVerify memory volunteerVerify,
        uint8 sigV,
        bytes32 sigR,
        bytes32 sigS) public view returns (bool) {
        return signer == ecrecover(hashVolunteerVerify(volunteerVerify), sigV, sigR, sigS);
    }
    
    function createVolunteerCampaign(
        address signer, 
        VolunteerCampagin volunteerCampaign, 
        uint8 sigV, 
        bytes32 sigR, 
        bytes32 sigS) public view returns (bool) {
        require(validateVolunteerCampagin(signer, volunteerCampaign, sigV, sigR, sigS), "Invalid signer for the transaction");
        require(volunteerService.createVolunteerCampaign(volunteerCampaign.charity.wallet, volunteerCampaign.charity.id, volunteerCampaign.id), "Unable to create volunteer campaign");
        return true;
    }

    function volunteerSignUp(
        address signer, 
        VolunteerSignUp signUp, 
        uint8 sigV, 
        bytes32 sigR, 
        bytes32 sigS) public view returns (bool) {
        require(validateVolunteerSignUp(signer, signUp, sigV, sigR, sigS), "Invalid signer for the transaction");
        require(volunteerService.volunteerSignUp(signUp.volunteer.wallet, signUp.volunteer.id, signUp.charityAddress, signUp.charityId, signUp.campaignId), "Unable to sign up for volunteer campaign");
        return true;
    }

    function volunteerVerify(
        address signer, 
        VolunteerVerify verify, 
        uint8 sigV, 
        bytes32 sigR, 
        bytes32 sigS) public view returns (bool) {
        require(validateVolunteerVerify(signer, verify, sigV, sigR, sigS), "Invalid signer for the transaction");
        require(volunteerService.volunteerVerify(verify.volunteerAddress, verify.volunteerId, verify.charity.wallet, verify.charity.id, verify.campaignId, verify.time), "Unable to verify volunteer");
        return true;
    }
}