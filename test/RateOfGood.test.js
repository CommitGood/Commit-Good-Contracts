const EVMRevert = require('./helpers/EVMRevert');
const RateOfGood = artifacts.require('./RateOfGood.sol');
const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('RateOfGood', async ([_, owner, unknownUser]) => {
  beforeEach(async () => {
    this.rateOfGood = await RateOfGood.new({ from: owner });
  });

  const value = -1;

  describe('setInKindRoG', async () => {
    it('should fail if executed by non-owner', async () => {
      await this.rateOfGood.setInKindRoG(-1, { from: unknownUser }).should.be.rejectedWith(EVMRevert);  
    });

    it('emits an event', async () => {
      const { logs } = await await this.rateOfGood.setInKindRoG(value, { from: owner });
      const event = logs.find(e => e.event === 'EventSetInKindRateOfGood');
      should.exist(event);
      event.args.value.should.be.bignumber.equal(value);
    });
  });

  describe('setVolunteerRoG', async () => {
    it('should fail if executed by non-owner', async () => {
      await this.rateOfGood.setVolunteerRoG(-1, { from: unknownUser }).should.be.rejectedWith(EVMRevert);  
    });

    it('emits an event', async () => {
      const { logs } = await await this.rateOfGood.setVolunteerRoG(value, { from: owner });
      const event = logs.find(e => e.event === 'EventSetVolunteerRateOfGood');
      should.exist(event);
      event.args.value.should.be.bignumber.equal(value);
    });
  });

  describe('setDeliveryRoG', async () => {
    it('should fail if executed by non-owner', async () => {
      await this.rateOfGood.setDeliveryRoG(-1, { from: unknownUser }).should.be.rejectedWith(EVMRevert);  
    });

    it('emits an event', async () => {
      const { logs } = await await this.rateOfGood.setDeliveryRoG(value, { from: owner });
      const event = logs.find(e => e.event === 'EventSetDeliveryRateOfGood');
      should.exist(event);
      event.args.value.should.be.bignumber.equal(value);
    });
  });

  describe('setFundRaisingRoG', async () => {
    it('should fail if executed by a non-owner', async () => {
      await this.rateOfGood.setFundRaisingRoG(-1, { from: unknownUser }).should.be.rejectedWith(EVMRevert);  
    });

    it('emits an event', async () => {
      const { logs } = await await this.rateOfGood.setFundRaisingRoG(value, { from: owner });
      const event = logs.find(e => e.event === 'EventSetFundRaisingRateOfGood');
      should.exist(event);
      event.args.value.should.be.bignumber.equal(value);
    });
  });
});