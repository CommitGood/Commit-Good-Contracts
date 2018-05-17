const ether = require('../helpers/ether');
const EVMRevert = require('../helpers/EVMRevert');
const latestTime = require('../helpers/latestTime');
const increaseTime = require('../helpers/increaseTime');
const timer = require('../helpers/increaseTime');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const CappedCrowdsale = artifacts.require('./CommitGoodCrowdsale.sol');
const SimpleToken = artifacts.require('./SimpleToken.sol');
const WhiteListRegistry = artifacts.require('./WhiteListRegistry.sol');

contract('As Capped Crowdsale', async ([wallet, investor]) => {
  const rate = new BigNumber(1);
  const cap = ether(10);
  const lessThanCap = ether(6);
  const tokenSupply = new BigNumber('1e22');

  beforeEach(async () => {
    this.openingTime = latestTime() + increaseTime.duration.weeks(1);
    this.closingTime = this.openingTime + increaseTime.duration.weeks(1);
    this.whiteListRegistry = await WhiteListRegistry.new();
    this.token = await SimpleToken.new();
    this.crowdsale = await CappedCrowdsale.new(this.openingTime, this.closingTime, rate, wallet, cap, this.token.address, this.whiteListRegistry.address);
    await this.token.transfer(this.crowdsale.address, tokenSupply);
    await this.whiteListRegistry.addToWhiteList(wallet, ether(1));
  });

  describe('creating a valid crowdsale', async () => {
    it('should fail with zero cap', async () => {
      await CappedCrowdsale.new(this.openingTime, this.closingTime, rate, wallet, 0, this.token.address, this.whiteListRegistry.address).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('accepting payments', async () => {
    beforeEach(async () => {
      await timer.increaseTimeTo(this.openingTime);
    });

    it('should accept payments within cap', async () => {
      await this.crowdsale.send(cap.minus(lessThanCap)).should.be.fulfilled;
      await this.crowdsale.send(lessThanCap).should.be.fulfilled;
    });

    it('should reject payments outside cap', async () => {
      await this.crowdsale.send(cap);
      await this.crowdsale.send(1).should.be.rejectedWith(EVMRevert);
    });

    it('should reject payments that exceed cap', async () => {
      await this.crowdsale.send(cap.plus(1)).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('ending', async () => {
    beforeEach(async () => {
      await timer.increaseTimeTo(this.openingTime);
    });

    it('should not reach cap if sent under cap', async () => {
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
      await this.crowdsale.send(lessThanCap);
      capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
    });

    it('should not reach cap if sent just under cap', async () => {
      await this.crowdsale.send(cap.minus(1));
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(false);
    });

    it('should reach cap if cap sent', async () => {
      await this.crowdsale.send(cap);
      let capReached = await this.crowdsale.capReached();
      capReached.should.equal(true);
    });
  });
});
