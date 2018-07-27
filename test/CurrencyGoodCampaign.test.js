const ether = require('./helpers/ether');
const EVMRevert = require('./helpers/EVMRevert');
const CommitGoodToken = artifacts.require('./CommitGoodToken.sol');
const CurrencyGoodCampaign = artifacts.require('./CurrencyGoodCampaign.sol');
const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('CurrencyGoodCampaign', async ([_, owner, buyer, receiver, invalidBuyer, wallet]) => {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const rate = new BigNumber(1);
    const value = ether(6);
    const expectedTokenAmount = rate.mul(value);

    beforeEach(async () => {
        this.token = await CommitGoodToken.new({ from: owner });
        this.campaign = await CurrencyGoodCampaign.new(rate, wallet, buyer, this.token.address, { from: owner });
    });

    describe('creating a valid contract', async () => {
        it('should fail with zero rate', async () => {
            await CurrencyGoodCampaign.new(0, wallet, buyer, this.token.address, { from: owner }).should.be.rejectedWith(EVMRevert);
        });
    });

    describe('accepting payments', async () => {
        it('should fail with default send', async () => {
            await this.campaign.send(value).should.be.rejectedWith(EVMRevert);
        });

        it('should fail with an invalid buyer', async () => {
            await this.campaign.buyTokens(receiver, { value: value, from: invalidBuyer }).should.be.rejectedWith(EVMRevert);
        });

        it('should fail with zero address', async () => {
            await this.campaign.buyTokens(receiver, { value: value, from: ZERO_ADDRESS }).should.be.rejectedWith('sender account not recognized');
        });

        it('should accept payments', async () => {
            await this.token.setMintAgent(this.campaign.address, true, { from: owner });
            await this.campaign.buyTokens(receiver, { value: value, from: buyer }).should.be.fulfilled;
        });

        it('should log purchase', async () => {
            await this.token.setMintAgent(this.campaign.address, true, { from: owner });
            const { logs } = await this.campaign.buyTokens(receiver, { value: value, from: buyer });
            const event = logs.find(e => e.event === 'TokenPurchase');
            should.exist(event);
            event.args.purchaser.should.equal(buyer);
            event.args.beneficiary.should.equal(receiver);
            event.args.value.should.be.bignumber.equal(value);
            event.args.amount.should.be.bignumber.equal(expectedTokenAmount);
        });
      
        it('should assign tokens to beneficiary', async () => {
            await this.token.setMintAgent(this.campaign.address, true, { from: owner });
            await this.campaign.buyTokens(receiver, { value: value, from: buyer });
            const balance = await this.token.balanceOf(receiver);
            balance.should.be.bignumber.equal(expectedTokenAmount);
        });
      
        it('should forward funds to wallet', async () => {
            await this.token.setMintAgent(this.campaign.address, true, { from: owner });
            const pre = web3.eth.getBalance(wallet);
            await this.campaign.buyTokens(receiver, { value: value, from: buyer });
            const post = web3.eth.getBalance(wallet);
            post.minus(pre).should.be.bignumber.equal(value);
        });
    });

    describe('pausing campaign', async () => {
        it('should not unpause a campaign that is not paused', async () => {
            await this.campaign.unpause({ from: owner }).should.be.rejectedWith(EVMRevert);
        });

        it('should pause a campaign', async () => {
            const { logs } = await this.campaign.pause({ from: owner });
            const event = logs.find(e => e.event === 'Pause');
            should.exist(event);
        });

        it('should unpause a campaign', async () => {
            await this.campaign.pause({ from: owner });
            const { logs } = await this.campaign.unpause({ from: owner });
            const event = logs.find(e => e.event === 'Unpause');
            should.exist(event);
        });

        it('should not pause a campaign that is already paused', async () => {
            const { logs } = await this.campaign.pause({ from: owner });
            const event = logs.find(e => e.event === 'Pause');
            should.exist(event);
            await this.campaign.pause({ from: owner }).should.be.rejectedWith(EVMRevert);
        });

        it('paused campaign should reject payments', async () => {
            await this.campaign.pause({ from: owner });
            await this.campaign.buyTokens(receiver, { value: value, from: buyer }).should.be.rejectedWith(EVMRevert);
        });
    });
});