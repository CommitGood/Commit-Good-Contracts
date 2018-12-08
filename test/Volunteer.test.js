const EVMRevert = require('./helpers/EVMRevert');
const RateOfGood = artifacts.require('./RateOfGood.sol');
const Registry = artifacts.require('./Registry.sol');
const Volunteeer = artifacts.require('./Volunteer.sol');
const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('Volunteer', async ([_, owner, user, charity, unknownUser, unknownCharity]) => {
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
      await Volunteeer.new(ZERO_ADDRESS, ZERO_ADDRESS, { from: owner }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('createVolunteerCampaign', async () => {
    it('should fail if the charity is not registered', async () => {
      await this.volunteer.createVolunteerCampaign(unknownCharity, charityId, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity id is invalid', async () => {
      await this.volunteer.createVolunteerCampaign(charity, 0, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign id is invalid', async () => {
      await this.volunteer.createVolunteerCampaign(charity, charityId, 0, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if executed by non-owner', async () => {
      await this.volunteer.createVolunteerCampaign(charity, charityId, campaignId, { from: unknownUser }).should.be.rejectedWith(EVMRevert);  
    });

    it('emits an event', async () => {
      const { logs } = await this.volunteer.createVolunteerCampaign(charity, charityId, campaignId, { from: owner });
      const event = logs.find(e => e.event === 'EventVolunteerCampaign');
      should.exist(event);
      event.args.charity.should.equal(charity);
      event.args.charityId.should.be.bignumber.equal(charityId);
      event.args.campaignId.should.be.bignumber.equal(campaignId);
    });
  });

  describe('volunteerSignUp', async () => {
    it('should fail if the user address is invalid', async () => {
      await this.volunteer.volunteerSignUp(unknownUser, userId, charity, charityId, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the user id is invalid', async () => {
      await this.volunteer.volunteerSignUp(user, 0, charity, charityId, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity address is invalid', async () => {
      await this.volunteer.volunteerSignUp(user, userId, unknownCharity, charityId, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity id is invalid', async () => {
      await this.volunteer.volunteerSignUp(user, userId, charity, 0, campaignId, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign id is invalid', async () => {
      await this.volunteer.volunteerSignUp(user, userId, charity, charityId, 0, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      const { logs } = await this.volunteer.volunteerSignUp(user, userId, charity, charityId, campaignId, { from: owner });
      const event = logs.find(e => e.event === 'EventVolunteerSignUp');
      should.exist(event);
      event.args.user.should.equal(user);
      event.args.userId.should.be.bignumber.equal(userId);
      event.args.charity.should.equal(charity);
      event.args.charityId.should.be.bignumber.equal(charityId);
      event.args.campaignId.should.be.bignumber.equal(campaignId);
    });
  });

  describe('volunteerVerify', async () => {
    const hours = 3;

    it('should fail if the user address is invalid', async () => {
      await this.volunteer.volunteerVerify(unknownUser, userId, charity, charityId, campaignId, hours, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the user id is invalid', async () => {
      await this.volunteer.volunteerVerify(user, 0, charity, charityId, campaignId, hours, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity address is invalid', async () => {
      await this.volunteer.volunteerVerify(user, userId, unknownCharity, charityId, campaignId, hours, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the charity id is invalid', async () => {
      await this.volunteer.volunteerVerify(user, userId, charity, 0, campaignId, hours, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the campaign id is invalid', async () => {
      await this.volunteer.volunteerVerify(user, userId, charity, charityId, 0, hours, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      const { logs } = await this.volunteer.volunteerVerify(user, userId, charity, charityId, campaignId, hours, { from: owner });
      const event = logs.find(e => e.event === 'EventVolunteerVerify');
      should.exist(event);
      event.args.user.should.equal(user);
      event.args.userId.should.be.bignumber.equal(userId);
      event.args.charity.should.equal(charity);
      event.args.charityId.should.be.bignumber.equal(charityId);
      event.args.campaignId.should.be.bignumber.equal(campaignId);
      event.args.time.should.be.bignumber.equal(hours);
    });

    it('should return output greater than 0 if the user volunteered enough hours', async () => {
      const tx = await this.volunteer.volunteerVerify(user, userId, charity, charityId, campaignId, hours, { from: owner });
    });
  });
});