const EVMRevert = require('./helpers/EVMRevert');
const CommitGoodToken = artifacts.require('./CommitGoodToken.sol');
const RateOfGood = artifacts.require('./RateOfGood.sol');
const Registry = artifacts.require('./Registry.sol');
const Volunteeer = artifacts.require('./Volunteer.sol');

const should = require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('Volunteer', async ([owner, user, charity, nonOwner, unknownUser, unknownCharity]) => {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    beforeEach(async () => {
      this.token = await CommitGoodToken.new({ from: owner });
      this.registry = await Registry.new({ from: owner });
      this.rateOfGood = await RateOfGood.new({ from: owner });
      this.volunteer = await Volunteeer.new(this.registry.address, this.token.address, this.rateOfGood.address, { from: owner });
    });

    describe('Creating a valid contract', async () => {
      it('should fail with invalid addresses', async () => {
        await Volunteeer.new(ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, { from: owner }).should.be.rejectedWith(EVMRevert);
      });
    });

    describe('signUp', async () => {

    });

    describe('verify', async () => {

    });
});