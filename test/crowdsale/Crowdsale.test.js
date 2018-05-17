const ether = require('../helpers/ether');
const latestTime = require('../helpers/latestTime');
const timer = require('../helpers/increaseTime');

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Crowdsale = artifacts.require('./CommitGoodCrowdsale.sol');
const CommitGoodToken = artifacts.require('./CommitGoodToken.sol');
const WhiteListRegistry = artifacts.require('./WhiteListRegistry.sol');

contract('As Crowdsale', async ([investor, wallet, owner]) => {
  const rate = new BigNumber(1);
  const value = ether(6);
  const cap = ether(100);
  const tokenSupply = new BigNumber('1e22');
  const expectedTokenAmount = rate.mul(value);

  beforeEach(async () => {
    this.openingTime = latestTime() + timer.duration.weeks(1);
    const closingTime = this.openingTime + timer.duration.weeks(1);
    this.whiteListRegistry = await WhiteListRegistry.new();
    this.token = await CommitGoodToken.new({ from: owner });
    this.crowdsale = await Crowdsale.new(this.openingTime, closingTime, rate, wallet, cap, this.token.address, this.whiteListRegistry.address);
    await this.token.setMintAgent(this.crowdsale.address, true, { from: owner });
    await this.whiteListRegistry.addToWhiteList(investor, ether(1));
  });

  describe('accepting payments', async () => {
    it('should accept payments', async () => {
      await timer.increaseTimeTo(this.openingTime);
      await this.crowdsale.buyTokens(investor, { value: value, from: investor }).should.be.fulfilled;
    });
  });

  describe('high-level purchase', async () => {
    beforeEach(async () => {
      await timer.increaseTimeTo(this.openingTime);
    });

    it('should log purchase', async () => {
      const { logs } = await this.crowdsale.sendTransaction({ value, from: investor });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.purchaser.should.equal(investor);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to sender', async () => {
      await this.crowdsale.sendTransaction({ value, from: investor });
      let balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to wallet', async () => {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.sendTransaction({ value, from: investor });
      const post = web3.eth.getBalance(wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });
  });

  describe('low-level purchase', async () => {
    beforeEach(async () => {
      await timer.increaseTimeTo(this.openingTime);
    });
    it('should log purchase', async () => {
      const { logs } = await this.crowdsale.buyTokens(investor, { value: value, from: investor });
      const event = logs.find(e => e.event === 'TokenPurchase');
      should.exist(event);
      event.args.purchaser.should.equal(investor);
      event.args.beneficiary.should.equal(investor);
      event.args.value.should.be.bignumber.equal(value);
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should assign tokens to beneficiary', async () => {
      await this.crowdsale.buyTokens(investor, { value: value, from: investor });
      const balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount);
    });

    it('should forward funds to wallet', async () => {
      const pre = web3.eth.getBalance(wallet);
      await this.crowdsale.buyTokens(investor, { value: value, from: investor });
      const post = web3.eth.getBalance(wallet);
      post.minus(pre).should.be.bignumber.equal(value);
    });
  });
});
