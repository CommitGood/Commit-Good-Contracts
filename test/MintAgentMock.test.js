const assertRevert = require('./helpers/assertRevert');
const CommitGoodToken = artifacts.require('./CommitGoodToken.sol');
const MintAgentMock = artifacts.require('./mocks/MintAgentMock.sol');

contract('MintAgentMock', async ([owner, recipient]) => {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    beforeEach(async () => {
        this.token = await CommitGoodToken.new({ from: owner });
        this.mintAgentMock = await MintAgentMock.new(this.token.address);
        await this.token.setMintAgent(this.mintAgentMock.address, true, { from: owner });
    });

    describe('mint agent mock', async () => {
        const amount = 100;

        describe('mint tokens', async () => {
            describe('when recipient is a valid address', async () => {
                it('can mint tokens using the token contract', async () => {
                    await this.mintAgentMock.mintTokens(recipient, amount)
                    const balance = await this.token.balanceOf(recipient);
                    assert.equal(balance, amount);
                });
            });

            describe('when recipient is a zero address', async () => {
                it('reverts', async () => {
                    await assertRevert(this.mintAgentMock.mintTokens(ZERO_ADDRESS, amount));
                });
            });

            describe('when recipient is the token address', async () => {
                it('reverts', async () => {
                    await assertRevert(this.mintAgentMock.mintTokens(this.token.address, amount));
                });
            });
        });
    });
});