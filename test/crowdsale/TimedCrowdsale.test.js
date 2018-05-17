const advanceBlock = require('../helpers/advanceToBlock');
const ether = require('../helpers/ether');
const EVMRevert = require('../helpers/EVMRevert');
const latestTime = require('../helpers/latestTime');
const timer = require('../helpers/increaseTime');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const TimedCrowdsale = artifacts.require('./CommitGoodCrowdsale.sol');
const SimpleToken = artifacts.require('./SimpleToken.sol');
const WhiteListRegistry = artifacts.require('./WhiteListRegistry.sol');

contract('As TimedCrowdsale', async ([investor, wallet]) => {
  const rate = new BigNumber(1);
  const value = ether(6);
  const cap = ether(100);
  const tokenSupply = new BigNumber('1e22');

  before(async () => {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await advanceBlock.advanceBlock();
  });

  beforeEach(async () => {
    this.openingTime = latestTime() + timer.duration.weeks(1);
    this.closingTime = this.openingTime + timer.duration.weeks(1);
    this.afterClosingTime = this.closingTime + timer.duration.seconds(1);
    this.whiteListRegistry = await WhiteListRegistry.new();
    this.token = await SimpleToken.new();
    this.crowdsale = await TimedCrowdsale.new(this.openingTime, this.closingTime, rate, wallet, cap, this.token.address, this.whiteListRegistry.address);
    await this.token.transfer(this.crowdsale.address, tokenSupply);
    await this.whiteListRegistry.addToWhiteList(investor, ether(1));
  });

  it('should be ended only after end', async () => {
    let ended = await this.crowdsale.hasClosed();
    ended.should.equal(false);
    await timer.increaseTimeTo(this.afterClosingTime);
    ended = await this.crowdsale.hasClosed();
    ended.should.equal(true);
  });

  describe('accepting payments', async () => {
    it('should reject payments before start', async () => {
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(investor, { value: value, from: investor }).should.be.rejectedWith(EVMRevert);
    });

    it('should accept payments after start', async () => {
      await timer.increaseTimeTo(this.openingTime);
      await this.crowdsale.send(value).should.be.fulfilled;
      await this.crowdsale.buyTokens(investor, { value: value, from: investor }).should.be.fulfilled;
    });

    it('should reject payments after end', async () => {
      await timer.increaseTimeTo(this.afterClosingTime);
      await this.crowdsale.send(value).should.be.rejectedWith(EVMRevert);
      await this.crowdsale.buyTokens(investor, { value: value, from: investor }).should.be.rejectedWith(EVMRevert);
    });
  });
});
