const ether = require('./helpers/ether');
const EVMRevert = require('./helpers/EVMRevert');
const WhiteListRegistry = artifacts.require('./WhiteListRegistry.sol');

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('WhiteListRegistry', async ([owner, added, removed, nonOwner]) => {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const min = ether(10);

    beforeEach(async () => {
        this.registry = await WhiteListRegistry.new({ from: owner });
    });

    describe('addToWhiteList', async () => {
        it('emits an event', async () => {
            const { logs } = await this.registry.addToWhiteList(added, min, { from: owner });
            const event = logs.find(e => e.event === 'AddedToWhiteList');            
            assert.equal(logs.length, 1);
            should.exist(event);
            event.args.contributor.should.equal(added);
            event.args.minCap.should.be.bignumber.equal(min);
        });

        it('rejects a zero address', async () => {
            await this.registry.addToWhiteList(ZERO_ADDRESS, min).should.be.rejectedWith(EVMRevert);
        });

        it('rejects a non-owner', async () => {
            await this.registry.addToWhiteList(added, min, { from: nonOwner }).should.be.rejectedWith(EVMRevert);
        });

        it('adds to the white list', async () => {
            await this.registry.addToWhiteList(added, min, { from: owner });
            const isWhiteListed = await this.registry.isWhiteListed(added);
            assert.isTrue(isWhiteListed);
        });
    });

    describe('removeFromWhiteList', async () => {
        it('emits an event', async () => {
            await this.registry.addToWhiteList(removed, min, { from: owner });
            const { logs } = await this.registry.removeFromWhiteList(removed, { from: owner });
            const event = logs.find(e => e.event === 'RemovedFromWhiteList');            
            assert.equal(logs.length, 1);
            should.exist(event);
            event.args._contributor.should.equal(removed);
        });

        it('rejects a zero address', async () => {
            await this.registry.removeFromWhiteList(ZERO_ADDRESS).should.be.rejectedWith(EVMRevert);
        });

        it('rejects a non-owner', async () => {
            await this.registry.removeFromWhiteList(removed, { from: nonOwner }).should.be.rejectedWith(EVMRevert);
        });

        it('removes from the white list', async () => {
            await this.registry.addToWhiteList(removed, min, { from: owner });
            await this.registry.removeFromWhiteList(removed, { from: owner });
            const isWhiteListed = await this.registry.isWhiteListed(removed);
            assert.isFalse(isWhiteListed);
        });
    });

    describe('isAmountAllowed', async () => {
        it('validates the amount', async () => {
            await this.registry.addToWhiteList(added, min, { from: owner });
            const valid = await this.registry.isAmountAllowed(added, min);
            const invalid = await this.registry.isAmountAllowed(added, min.minus(ether(1)));
            assert.isTrue(valid);
            assert.isFalse(invalid);
        });
    });
});