const CommitGoodToken = artifacts.require("CommitGoodToken");
const Registry = artifacts.require("Registry");
const RateOfGood = artifacts.require("RateOfGood");
const Delivery = artifacts.require("Delivery");
const FundRaising = artifacts.require("FundRaising");
const InKindDonation = artifacts.require("InKindDonation");
const Volunteer = artifacts.require("Volunteer");

module.exports = deployer => {
    deployer.deploy(Registry)
        .then(() => Registry.deployed())
        .then(instance => instance.authorizeCharity("0xf25726eae1221097469EcD7C741f7e206520A5dd", true))
        .then(() => deployer.deploy(RateOfGood))
        .then(() => RateOfGood.deployed())
        .then(() => deployer.deploy(Delivery, Registry.address, RateOfGood.address))
        .then(() => Delivery.deployed())
        .then(() => deployer.deploy(FundRaising, Registry.address, RateOfGood.address))
        .then(() => FundRaising.deployed())
        .then(() => deployer.deploy(InKindDonation, Registry.address, RateOfGood.address))
        .then(() => InKindDonation.deployed())
        .then(() => deployer.deploy(Volunteer, Registry.address, RateOfGood.address))
        .then(() => Volunteer.deployed())
        .then(() => deployer.deploy(CommitGoodToken))
        .then(() => CommitGoodToken.deployed())
        .then(instance => {
            instance.setMintAgent(Delivery.address, true);
            instance.setMintAgent(FundRaising.address, true);
            instance.setMintAgent(InKindDonation.address, true);
            instance.setMintAgent(Volunteer.address, true);
        });
}