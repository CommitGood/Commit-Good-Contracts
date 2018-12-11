const EVMRevert = require('./helpers/EVMRevert');
const RateOfGood = artifacts.require('./RateOfGood.sol');
const Registry = artifacts.require('./Registry.sol');
const InKindDonation = artifacts.require('./InKindDonation.sol');
const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('InKindDonation', async ([_, owner, user, charity, unknownUser, unknownCharity]) => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const charityId = 100;
  const campaignId = 200;
  const userId = 300;

  beforeEach(async () => {
    this.registry = await Registry.new({ from: owner });
    this.rateOfGood = await RateOfGood.new({ from: owner });
    this.inKindDonation = await InKindDonation.new(this.registry.address, this.rateOfGood.address, { from: owner });

    this.registry.authorizeUser(user, true, { from: owner });
    this.registry.authorizeCharity(charity, true, { from: owner });
  });

  describe('Creating a valid contract', async () => {
    it('should fail with invalid addresses', async () => {
      await InKindDonation.new(ZERO_ADDRESS, ZERO_ADDRESS, { from: owner }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('createInKindDonationCampaign', async () => {
    it('should fail if the charity is not registered', async () => {
      await this.inKindDonation.createInKindDonationCampaign(unknownCharity, charityId, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity id is invalid', async () => {
      await this.inKindDonation.createInKindDonationCampaign(charity, 0, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign id is invalid', async () => {
      await this.inKindDonation.createInKindDonationCampaign(charity, charityId, 0, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if executed by non-owner', async () => {
      await this.inKindDonation.createInKindDonationCampaign(charity, charityId, campaignId, { from: unknownUser }).should.be.rejectedWith(EVMRevert);  
    });

    it('emits an event', async () => {
      const { logs } = await this.inKindDonation.createInKindDonationCampaign(charity, charityId, campaignId, { from: owner });
      const event = logs.find(e => e.event === 'EventInKindDonationCampaign');
      should.exist(event);
      event.args.charity.should.equal(charity);
      event.args.charityId.should.be.bignumber.equal(charityId);
      event.args.campaignId.should.be.bignumber.equal(campaignId);
    });
  });

  describe('inKindDonation', async () => {
    it('should fail if the user address is invalid', async () => {
      await this.inKindDonation.inKindDonation(unknownUser, userId, charity, charityId, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the user id is invalid', async () => {
      await this.inKindDonation.inKindDonation(user, 0, charity, charityId, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity address is invalid', async () => {
      await this.inKindDonation.inKindDonation(user, userId, unknownCharity, charityId, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity id is invalid', async () => {
      await this.inKindDonation.inKindDonation(user, userId, charity, 0, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign id is invalid', async () => {
      await this.inKindDonation.inKindDonation(user, userId, charity, charityId, 0, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      const { logs } = await this.inKindDonation.inKindDonation(user, userId, charity, charityId, campaignId, { from: owner });
      const event = logs.find(e => e.event === 'EventInKindDonation');
      should.exist(event);
      event.args.user.should.equal(user);
      event.args.userId.should.be.bignumber.equal(userId);
      event.args.charity.should.equal(charity);
      event.args.charityId.should.be.bignumber.equal(charityId);
      event.args.campaignId.should.be.bignumber.equal(campaignId);
    });
  });

  describe('inKindDonationVerify', async () => {
    const donation = 100;

    it('should fail if the user address is invalid', async () => {
      await this.inKindDonation.inKindDonationVerify(unknownUser, userId, charity, charityId, campaignId, donation, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the user id is invalid', async () => {
      await this.inKindDonation.inKindDonationVerify(user, 0, charity, charityId, campaignId, donation, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity address is invalid', async () => {
      await this.inKindDonation.inKindDonationVerify(user, userId, unknownCharity, charityId, campaignId, donation, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity id is invalid', async () => {
      await this.inKindDonation.inKindDonationVerify(user, userId, charity, 0, campaignId, donation, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign id is invalid', async () => {
      await this.inKindDonation.inKindDonationVerify(user, userId, charity, charityId, 0, donation, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      const reward = 3 * (10 ** 18);
      const { logs } = await this.inKindDonation.inKindDonationVerify(user, userId, charity, charityId, campaignId, donation, { from: owner });
      const event = logs.find(e => e.event === 'EventInKindDonationVerify');
      should.exist(event);
      event.args.user.should.equal(user);
      event.args.userId.should.be.bignumber.equal(userId);
      event.args.charity.should.equal(charity);
      event.args.charityId.should.be.bignumber.equal(charityId);
      event.args.campaignId.should.be.bignumber.equal(campaignId);
      event.args.donation.should.be.bignumber.equal(donation);
      event.args.reward.should.be.bignumber.equal(reward);
    });
  });
});