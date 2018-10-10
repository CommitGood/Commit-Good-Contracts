const EVMRevert = require('./helpers/EVMRevert');
const Registry = artifacts.require('./Registry.sol');

const should = require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('Registry', async ([owner, user, charity, nonOwner]) => {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    
    beforeEach(async () => {
        this.registry = await Registry.new({ from: owner });
    });

    describe('authorizeUser', async () => {
        it('emits an event', async () => {
            const { logs } = await this.registry.authorizeUser(user, true, { from: owner });
            const event = logs.find(e => e.event === 'Authorize');
            assert.equal(logs.length, 1);
            should.exist(event);
            event.args.registrar.should.equal(user);
            event.args.role.should.equal("user");
            assert.isTrue(event.args.enabled);
        });

        it('rejects a zero address', async () => {
            await this.registry.authorizeUser(ZERO_ADDRESS, true).should.be.rejectedWith(EVMRevert);
        });

        it('rejects a non-owner', async () => {
            await this.registry.authorizeUser(user, true, { from: nonOwner }).should.be.rejectedWith(EVMRevert);
        });
    });

    describe('authorizeCharity', async () => {
        it('emits an event', async () => {
            const { logs } = await this.registry.authorizeCharity(charity, true, { from: owner });
            const event = logs.find(e => e.event === 'Authorize');
            assert.equal(logs.length, 1);
            should.exist(event);
            event.args.registrar.should.equal(charity);
            event.args.role.should.equal("charity");
            assert.isTrue(event.args.enabled);
        });

        it('rejects a zero address', async () => {
            await this.registry.authorizeCharity(ZERO_ADDRESS, true).should.be.rejectedWith(EVMRevert);
        });

        it('rejects a non-owner', async () => {
            await this.registry.authorizeCharity(charity, true, { from: nonOwner }).should.be.rejectedWith(EVMRevert);
        });
    });

    describe('checkUser', async () => {
        it('rejects an invalid address', async () => {
            await this.registry.checkUser(ZERO_ADDRESS).should.be.rejectedWith(EVMRevert);
        });

        it('returns a boolean', async () => {
            await this.registry.authorizeUser(user, true, { from: owner });
            const result = await this.registry.checkUser(user);
            assert.isTrue(result);
        });
    });

    describe('checkCharity', async () => {
        it('rejects an invalid address', async () => {
            await this.registry.checkCharity(ZERO_ADDRESS).should.be.rejectedWith(EVMRevert);
        });

        it('returns a boolean', async () => {
            await this.registry.authorizeCharity(charity, true, { from: owner });
            const result = await this.registry.checkCharity(charity);
            assert.isTrue(result);
        });
    });
});