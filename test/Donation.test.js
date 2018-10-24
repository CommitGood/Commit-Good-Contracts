const EVMRevert = require('./helpers/EVMRevert');
const CommitGoodToken = artifacts.require('./CommitGoodToken.sol');
const Registry = artifacts.require('./Registry.sol');
const Donation = artifacts.require('./Donation.sol');
const BigNumber = web3.BigNumber;

const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(BigNumber))
    .should();

contract('Donation', async ([owner, user, charity, unknownUser, unknownCharity, mintAgent]) => {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const charityId = 100;
    const userId = 200;

    beforeEach(async () => {
        this.token = await CommitGoodToken.new({ from: owner });
        this.registry = await Registry.new({ from: owner });
        this.donation = await Donation.new(this.registry.address, this.token.address, { from: owner });
        this.registry.authorizeUser(user, true, { from: owner });
        this.registry.authorizeCharity(charity, true, { from: owner });
        await this.token.setMintAgent(this.donation.address, true, { from: owner });
    });

    describe('Creating a valid contract', async () => {
        it('should fail with invalid addresses', async () => {
            await Donation.new(ZERO_ADDRESS, ZERO_ADDRESS, { from: owner }).should.be.rejectedWith(EVMRevert);
        });
    });

    describe('donate', async () => {
        describe('validation', async () => { 
            it('should fail if the charity is not registered', async () => {
                await this.donation.donate(user, userId, unknownCharity, charityId, 1).should.be.rejectedWith(EVMRevert);
            });

            it('should fail if the user is not registered', async () => {
                await this.donation.donate(unknownUser, userId, charity, charityId, 1).should.be.rejectedWith(EVMRevert);
            });

            it('should fail if the charity id is invalid', async () => {
                await this.donation.donate(user, userId, charity, 0, 1).should.be.rejectedWith(EVMRevert);
            });

            it('should fail if the user id is invalid', async () => {
                await this.donation.donate(user, 0, charity, charityId, 1).should.be.rejectedWith(EVMRevert);
            });

            it('should fail if the donation amount is less than 1', async () => {
                await this.donation.donate(user, userId, charity, charityId, 0).should.be.rejectedWith(EVMRevert);
            });
        });

        describe('valid donations', async () => {
            const donation = 50;
            const reward = 3;

            it('emits an event', async () => {
                const { logs } = await this.donation.donate(user, userId, charity, charityId, donation, reward);
                const event = logs.find(e => e.event === 'UserDonation');
                should.exist(event);
                event.args.user.should.equal(user);
                event.args.userId.should.be.bignumber.equal(userId);
                event.args.charity.should.equal(charity);
                event.args.charityId.should.be.bignumber.equal(charityId);
                event.args.donation.should.be.bignumber.equal(donation);
                event.args.reward.should.be.bignumber.equal(reward);
            });

            it('should mint tokens', async () => {
                await this.donation.donate(user, userId, charity, charityId, donation, reward);
                const balance = await this.token.balanceOf(user);
                assert.equal(balance, reward);
            });
        });
    });
});