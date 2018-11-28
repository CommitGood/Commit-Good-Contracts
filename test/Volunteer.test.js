const EVMRevert = require('./helpers/EVMRevert');
const RateOfGood = artifacts.require('./RateOfGood.sol');
const Registry = artifacts.require('./Registry.sol');
const Volunteeer = artifacts.require('./Volunteer.sol');
const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('Volunteer', async ([owner, user, charity, unknownUser, unknownCharity]) => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const charityId = 100;
  const campaignId = 200;
  const userId = 300;

  beforeEach(async () => {
    this.registry = await Registry.new({ from: owner });
    this.rateOfGood = await RateOfGood.new({ from: owner });
    this.volunteer = await Volunteeer.new(this.registry.address, this.rateOfGood.address, { from: owner });

    this.registry.authorizeUser(user, true, { from: owner });
    this.registry.authorizeCharity(charity, true, { from: owner });
  });

  describe('Creating a valid contract', async () => {
    it('should fail with invalid addresses', async () => {
      await Volunteeer.new(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, { from: owner }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('createVolunteerCampaign', async () => {
    it('should fail if the charity is not registered', async () => {
      await this.volunteer.createVolunteerCampaign(unknownCharity, charityId, campaignId).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity id is invalid', async () => {
      await this.volunteer.createVolunteerCampaign(charity, 0, campaignId).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign id is invalid', async () => {
      await this.volunteer.createVolunteerCampaign(charity, charityId, 0).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign already exists', async () => {
      await this.volunteer.createVolunteerCampaign(charity, charityId, campaignId);
      await this.volunteer.createVolunteerCampaign(charity, charityId, campaignId).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      const { logs } = await this.volunteer.createVolunteerCampaign(charity, charityId, campaignId);
      const event = logs.find(e => e.event === 'CreateVolunteerCampaign');
      should.exist(event);
      event.args.charity.should.equal(charity);
      event.args.charityId.should.be.bignumber.equal(charityId);
      event.args.campaignId.should.be.bignumber.equal(campaignId);
    });
  });

  describe('signUp', async () => {
    beforeEach(async () => {
      await this.volunteer.createVolunteerCampaign(charity, charityId, campaignId);
    });

    it('should fail if the user address is invalid', async () => {
      await this.volunteer.signUp(unknownUser, userId, charity, charityId, campaignId).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the user id is invalid', async () => {
      await this.volunteer.signUp(user, 0, charity, charityId, campaignId).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity address is invalid', async () => {
      await this.volunteer.signUp(user, userId, unknownCharity, charityId, campaignId).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity id is invalid', async () => {
      await this.volunteer.signUp(user, userId, charity, 0, campaignId).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign id is invalid', async () => {
      await this.volunteer.signUp(user, userId, charity, charityId, 0).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign doesn\'t exist', async () => {
      await this.volunteer.signUp(user, userId, charity, charityId, 999).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      const { logs } = await this.volunteer.signUp(user, userId, charity, charityId, campaignId);
      const event = logs.find(e => e.event === 'VolunteerSignUp');
      should.exist(event);
      event.args.user.should.equal(user);
      event.args.userId.should.be.bignumber.equal(userId);
      event.args.charity.should.equal(charity);
      event.args.charityId.should.be.bignumber.equal(charityId);
      event.args.campaignId.should.be.bignumber.equal(campaignId);
    });
  });

  describe('verify', async () => {
    const hours = 3;

    beforeEach(async () => {
      await this.volunteer.createVolunteerCampaign(charity, charityId, campaignId);
      await this.volunteer.signUp(user, userId, charity, charityId, campaignId);
    });

    it('should fail if the user address is invalid', async () => {
      await this.volunteer.verify(unknownUser, userId, charity, charityId, campaignId, hours).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the user id is invalid', async () => {
      await this.volunteer.verify(user, 0, charity, charityId, campaignId, hours).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity address is invalid', async () => {
      await this.volunteer.verify(user, userId, unknownCharity, charityId, campaignId, hours).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity id is invalid', async () => {
      await this.volunteer.verify(user, userId, charity, 0, campaignId, hours).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign id is invalid', async () => {
      await this.volunteer.verify(user, userId, charity, charityId, 0, hours).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign doesn\'t exist', async () => {
      await this.volunteer.verify(user, userId, charity, charityId, 999, hours).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the user doesn\'t exist', async () => {
      await this.volunteer.verify(user, 999, charity, charityId, campaignId, hours).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      const { logs } = await this.volunteer.verify(user, userId, charity, charityId, campaignId, hours);
      const event = logs.find(e => e.event === 'VolunteerVerify');
      should.exist(event);
      event.args.user.should.equal(user);
      event.args.userId.should.be.bignumber.equal(userId);
      event.args.charity.should.equal(charity);
      event.args.charityId.should.be.bignumber.equal(charityId);
      event.args.campaignId.should.be.bignumber.equal(campaignId);
      event.args.time.should.be.bignumber.equal(hours);
    });

    it('should return output greater than 0 if the user volunteered enough hours', async () => {
      const tx = await this.volunteer.verify(user, userId, charity, charityId, campaignId, hours);
    });
  });
});