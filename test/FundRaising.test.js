const EVMRevert = require('./helpers/EVMRevert');
const RateOfGood = artifacts.require('./RateOfGood.sol');
const Registry = artifacts.require('./Registry.sol');
const FundRaising = artifacts.require('./FundRaising.sol');
const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('FundRaising', async ([_, owner, user, charity, unknownUser, unknownCharity]) => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const charityId = 100;
  const userId = 200;
  const campaignId = 300;
  const donation = 10;
  const goal = 100;

  beforeEach(async () => {
    this.registry = await Registry.new({ from: owner });
    this.rateOfGood = await RateOfGood.new({ from: owner });
    this.fundRaising = await FundRaising.new(this.registry.address, this.rateOfGood.address, { from: owner });

    this.registry.authorizeUser(user, true, { from: owner });
    this.registry.authorizeCharity(charity, true, { from: owner });
  });

  describe('Creating a valid contract', async () => {
    it('should fail with invalid addresses', async () => {
      await FundRaising.new(ZERO_ADDRESS, ZERO_ADDRESS, { from: owner }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('createFundRaiserCampaign', async () => {
    it('should fail if the charity address is invalid', async () => { 
      await this.fundRaising.createFundRaiserCampaign(unknownCharity, charityId, campaignId, goal, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity id is invalid', async () => {
      await this.fundRaising.createFundRaiserCampaign(charity, 0, campaignId, goal, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign id is invalid', async () => {
        await this.fundRaising.createFundRaiserCampaign(charity, charityId, 0, goal, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      const { logs } = await this.fundRaising.createFundRaiserCampaign(charity, charityId, campaignId, goal, { from: owner });
      const event = logs.find(e => e.event === 'EventCreateFundRaiserCampaign');
      should.exist(event);
      event.args.charity.should.equal(charity);
      event.args.charityId.should.be.bignumber.equal(charityId);
      event.args.campaignId.should.be.bignumber.equal(campaignId);
      event.args.goal.should.be.bignumber.equal(goal);
    });
  });

  describe('raiseFunds', async () => {
    it('should fail if the donator address is invalid', async () => {
      await this.fundRaising.raiseFunds(unknownUser, userId, charity, charityId, campaignId, donation, false, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the donator id is invalid', async () => {
      await this.fundRaising.raiseFunds(user, 0, charity, charityId, campaignId, donation, false, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity address is invalid', async () => {
      await this.fundRaising.raiseFunds(user, userId, unknownCharity, charityId, campaignId, donation, false, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity id is invalid', async () => {
      await this.fundRaising.raiseFunds(user, userId, charity, 0, campaignId, donation, false, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign id is invalid', async () => {
        await this.fundRaising.raiseFunds(user, userId, charity, charityId, 0, donation, false, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      const goalReached = true;
      const reward = 1 * (10 ** 18)
      const { logs } = await this.fundRaising.raiseFunds(user, userId, charity, charityId, campaignId, donation, goalReached, { from: owner });
      const event = logs.find(e => e.event === 'EventFundsDonated');
      should.exist(event);
      event.args.donator.should.equal(user);
      event.args.donatorId.should.be.bignumber.equal(userId);
      event.args.charity.should.equal(charity);
      event.args.charityId.should.be.bignumber.equal(charityId);
      event.args.campaignId.should.be.bignumber.equal(campaignId);
      event.args.amount.should.be.bignumber.equal(donation);
      event.args.goalReached.should.equal(goalReached);
      event.args.reward.should.be.bignumber.equal(reward);
    });
  });
});