const EVMRevert = require('./helpers/EVMRevert');
const PlatformContract = artifacts.require('./PlatformContract.sol');
const Registry = artifacts.require('./Registry.sol');
const RateOfGood = artifacts.require('./RateOfGood.sol');

const should = require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('PlatformContract', async ([_, owner, unknownUser]) => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  
  beforeEach(async () => {
    this.platformContract = await PlatformContract.new({ from: owner });
  });

  describe('setRegistry', async () => {
    it('should fail if the address is invalid', async () => {
      await this.platformContract.setRegistry(ZERO_ADDRESS, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the address is the contract address', async () => {
        await this.platformContract.setRegistry(this.platformContract.address, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if executed by a non-owner', async () => {
        this.registry = await Registry.new({ from: unknownUser });
        await this.platformContract.setRegistry(this.registry.address, { from: unknownUser }).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      this.registry = await Registry.new({ from: owner });
      const { logs } = await this.platformContract.setRegistry(this.registry.address, { from: owner });
      const event = logs.find(e => e.event === 'EventSetRegistryContract');
      should.exist(event);
      event.args.kontract.should.equal(this.registry.address);
    });
  });

  describe('setRateOfGood', async () => {
    it('should fail if the address is invalid', async () => {
      await this.platformContract.setRateOfGood(ZERO_ADDRESS, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the address is the contract address', async () => {
        await this.platformContract.setRateOfGood(this.platformContract.address, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if executed by a non-owner', async () => {
        this.rateOfGood = await RateOfGood.new({ from: unknownUser });
        await this.platformContract.setRateOfGood(this.rateOfGood.address, { from: unknownUser }).should.be.rejectedWith(EVMRevert);
    }); 

    it('emits an event', async () => {
      this.rateOfGood = await RateOfGood.new({ from: owner });
      const { logs } = await this.platformContract.setRateOfGood(this.rateOfGood.address, { from: owner });
      const event = logs.find(e => e.event === 'EventSetRateOfGoodContract');
      should.exist(event);
      event.args.kontract.should.equal(this.rateOfGood.address);
    });
  });
});