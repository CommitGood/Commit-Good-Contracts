const assertRevert = require('./helpers/assertRevert');
const CommitGoodToken = artifacts.require('./CommitGoodToken.sol');

contract('CommitGoodToken', async ([owner, recipient, anotherAccount, mintAgent, invalidMintAgent, unknownMintAgent]) => {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    beforeEach(async () => {
        this.token = await CommitGoodToken.new({ from: owner });
    });

    describe('init', async () => {
        it('should start with no tokens', async () => {
            assert.equal(await this.token.totalSupply(), 0);
        });
    });

    describe('increase approval', async () => {
        const amount = 100;

        describe('when the spender is not the zero address', async () => {
            const spender = recipient;

            describe('when the sender has enough balance', async () => {
                it('emits an approval event', async () => {
                    const { logs } = await this.token.increaseApproval(spender, amount, { from: owner });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, owner);
                    assert.equal(logs[0].args.spender, spender);
                    assert(logs[0].args.value.eq(amount));
                });

                describe('when there was no approved amount before', async () => {
                    it('approves the requested amount', async () => {
                        await this.token.increaseApproval(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, amount);
                    });
                });

                describe('when the spender had an approved amount', async () => {
                    beforeEach(async () => {
                        await this.token.approve(spender, 1, { from: owner });
                    });

                    it('increases the spender allowance adding the requested amount', async () => {
                        await this.token.increaseApproval(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, amount + 1);
                    });
                });
            });

            describe('when the sender does not have enough balance', () => {
                const amount = 101;

                it('emits an approval event', async () => {
                    const { logs } = await this.token.increaseApproval(spender, amount, { from: owner });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, owner);
                    assert.equal(logs[0].args.spender, spender);
                    assert(logs[0].args.value.eq(amount));
                });

                describe('when there was no approved amount before', async () => {
                    it('approves the requested amount', async () => {
                        await this.token.increaseApproval(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, amount);
                    });
                });

                describe('when the spender had an approved amount', async () => {
                    beforeEach(async () => {
                        await this.token.approve(spender, 1, { from: owner });
                    });

                    it('increases the spender allowance adding the requested amount', async () => {
                        await this.token.increaseApproval(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, amount + 1);
                    });
                });
            });
        });

        describe('when the spender is the zero address', async () => {
            const spender = ZERO_ADDRESS;
      
            it('approves the requested amount', async () => {
                await this.token.increaseApproval(spender, amount, { from: owner });
        
                const allowance = await this.token.allowance(owner, spender);
                assert.equal(allowance, amount);
            });
      
            it('emits an approval event', async () => {
                const { logs } = await this.token.increaseApproval(spender, amount, { from: owner });
        
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'Approval');
                assert.equal(logs[0].args.owner, owner);
                assert.equal(logs[0].args.spender, spender);
                assert(logs[0].args.value.eq(amount));
            });
          });
    });

    describe('decrease approval', async () => {
        describe('when the spender is not the zero address', async () => {
            const spender = recipient;

            describe('when the sender has enough balance', async () => {
                const amount = 100;

                it('emits an approval event', async () => {
                    const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, owner);
                    assert.equal(logs[0].args.spender, spender);
                    assert(logs[0].args.value.eq(0));
                });

                describe('when there was no approved amount before', async () => {
                    it('keeps the allowance to zero', async () => {
                        await this.token.decreaseApproval(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, 0);
                    });
                });

                describe('when the spender had an approved amount', async () => {
                    beforeEach(async () => {
                        await this.token.approve(spender, amount + 1, { from: owner });
                    });

                    it('decreases the spender allowance subtracting the requested amount', async () => {
                        await this.token.decreaseApproval(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, 1);
                    });
                });
            });

            describe('when the sender does not have enough balance', async () => {
                const amount = 101;

                it('emits an approval event', async () => {
                    const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, owner);
                    assert.equal(logs[0].args.spender, spender);
                    assert(logs[0].args.value.eq(0));
                });

                describe('when there was no approved amount before', async () => {
                    it('keeps the allowance to zero', async () => {
                        await this.token.decreaseApproval(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, 0);
                    });
                });

                describe('when the spender had an approved amount', async () => {
                    beforeEach(async () => {
                        await this.token.approve(spender, amount + 1, { from: owner });
                    });

                    it('decreases the spender allowance subtracting the requested amount', async () => {
                        await this.token.decreaseApproval(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, 1);
                    });
                });
            });
        });

        describe('when the spender is the zero address', async () => {
            const amount = 100;
            const spender = ZERO_ADDRESS;
      
            it('decreases the requested amount', async () => {
                await this.token.decreaseApproval(spender, amount, { from: owner });
        
                const allowance = await this.token.allowance(owner, spender);
                assert.equal(allowance, 0);
            });
      
            it('emits an approval event', async () => {
                const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner });
        
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'Approval');
                assert.equal(logs[0].args.owner, owner);
                assert.equal(logs[0].args.spender, spender);
                assert(logs[0].args.value.eq(0));
            });
        });
    });

    describe('transfer from', async () => {
        const spender = recipient;

        describe('when the recipient is not the zero address', async () => {
            const to = anotherAccount;

            describe('when the spender has enough approved balance', async () => {
                beforeEach(async () => {
                    await this.token.approve(spender, 100, { from: owner });
                });

                describe('when the owner has enough balance', async () => {
                    const amount = 100;

                    beforeEach(async () => {
                        await this.token.setMintAgent(mintAgent, true, { from: owner });
                        await this.token.mint(owner, amount, { from: mintAgent });
                    });

                    it('transfers the requested amount', async () => {
                        await this.token.transferFrom(owner, to, amount, { from: spender });

                        const totalSupply = await this.token.totalSupply();
                        const difference = totalSupply.minus(amount);
                        const senderBalance = await this.token.balanceOf(owner);

                        assert.equal(senderBalance.c[0], difference.c[0]);

                        const recipientBalance = await this.token.balanceOf(to);
                        assert.equal(recipientBalance, amount);
                    });

                    it('decreases the spender allowance', async () => {
                        await this.token.transferFrom(owner, to, amount, { from: spender });

                        const allowance = await this.token.allowance(owner, spender);
                        assert(allowance.eq(0));
                    });

                    it('emits a transfer event', async () => {
                        const { logs } = await this.token.transferFrom(owner, to, amount, { from: spender });

                        assert.equal(logs.length, 1);
                        assert.equal(logs[0].event, 'Transfer');
                        assert.equal(logs[0].args.from, owner);
                        assert.equal(logs[0].args.to, to);
                        assert(logs[0].args.value.eq(amount));
                    });
                });

                describe('when the owner does not have enough balance', async () => {
                    const amount = 101;

                    beforeEach(async () => {
                        await this.token.setMintAgent(mintAgent, true, { from: owner });
                        await this.token.mint(owner, amount - 1, { from: mintAgent });
                    });

                    it('reverts', async () => {
                        await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
                    });
                });
            });

            describe('when the spender does not have enough approved balance', async () => {
                beforeEach(async () => {
                    await this.token.approve(spender, 99, { from: owner });
                });

                describe('when the owner has enough balance', async () => {
                    const amount = 100;

                    it('reverts', async () => {
                        await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
                    });
                });

                describe('when the owner does not have enough balance', async () => {
                    const amount = 101;

                    beforeEach(async () => {
                        await this.token.setMintAgent(mintAgent, true, { from: owner });
                        await this.token.mint(owner, amount - 1, { from: mintAgent });
                    });

                    it('reverts', async () => {
                        await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
                    });
                });
            });
        });

        describe('when the recipient is the zero address', async () => {
            const amount = 100;
            const to = ZERO_ADDRESS;

            beforeEach(async () => {
                await this.token.approve(spender, amount, { from: owner });
            });

            it('reverts', async () => {
                await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }));
            });
        });
    });

    describe('approve', async () => {
        describe('when the spender is not the zero address', async () => {
            const spender = recipient;

            describe('when the sender has enough balance', async () => {
                const amount = 100;

                it('emits an approval event', async () => {
                    const { logs } = await this.token.approve(spender, amount, { from: owner });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, owner);
                    assert.equal(logs[0].args.spender, spender);
                    assert(logs[0].args.value.eq(amount));
                });

                describe('when there was no approved amount before', async () => {
                    it('approves the requested amount', async () => {
                        await this.token.approve(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, amount);
                    });
                });

                describe('when the spender had an approved amount', async () => {
                    beforeEach(async () => {
                        await this.token.approve(spender, 1, { from: owner });
                    });

                    it('approves the requested amount and replaces the previous one', async () => {
                        await this.token.approve(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, amount);
                    });
                });
            });

            describe('when the sender does not have enough balance', async () => {
                const amount = 101;

                it('emits an approval event', async () => {
                    const { logs } = await this.token.approve(spender, amount, { from: owner });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Approval');
                    assert.equal(logs[0].args.owner, owner);
                    assert.equal(logs[0].args.spender, spender);
                    assert(logs[0].args.value.eq(amount));
                });

                describe('when there was no approved amount before', async () => {
                    it('approves the requested amount', async () => {
                        await this.token.approve(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, amount);
                    });
                });

                describe('when the spender had an approved amount', async () => {
                    beforeEach(async () => {
                        await this.token.approve(spender, 1, { from: owner });
                    });

                    it('approves the requested amount and replaces the previous one', async () => {
                        await this.token.approve(spender, amount, { from: owner });

                        const allowance = await this.token.allowance(owner, spender);
                        assert.equal(allowance, amount);
                    });
                });
            });
        });

        describe('when the spender is the zero address', async () => {
            const amount = 100;
            const spender = ZERO_ADDRESS;
      
            it('approves the requested amount', async () => {
                await this.token.approve(spender, amount, { from: owner });
        
                const allowance = await this.token.allowance(owner, spender);
                assert.equal(allowance, amount);
            });
      
            it('emits an approval event', async () => {
                const { logs } = await this.token.approve(spender, amount, { from: owner });
        
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'Approval');
                assert.equal(logs[0].args.owner, owner);
                assert.equal(logs[0].args.spender, spender);
                assert(logs[0].args.value.eq(amount));
            });
          });
    });

    describe('transfer', () => {
        describe('when the recipient is not the zero address', async () => {
            const to = recipient;

            describe('when the sender does not have enough balance', async () => {
                const amount = 101;

                it('reverts', async () => {
                    await assertRevert(this.token.transfer(to, amount, { from: anotherAccount }));
                });
            });

            describe('when the sender has enough balance', async () => {
                const amount = 100;

                beforeEach(async () => {
                    await this.token.setMintAgent(mintAgent, true, { from: owner });
                    await this.token.mint(owner, amount, { from: mintAgent });
                });

                it('transfers the requested amount', async () => {
                    await this.token.transfer(to, amount, { from: owner });
                    const recipientBalance = await this.token.balanceOf(to);
                    const ownerBalance = await this.token.balanceOf(owner);
                    assert.equal(recipientBalance, amount);
                    assert.equal(ownerBalance, 0);
                });

                it('emits a transfer event', async () => {
                    const { logs } = await this.token.transfer(to, amount, { from: owner });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'Transfer');
                    assert.equal(logs[0].args.from, owner);
                    assert.equal(logs[0].args.to, to);
                    assert(logs[0].args.value.eq(amount));
                });
            });
        });

        describe('when the recipient is the zero address', async () => {
            const to = ZERO_ADDRESS;

            it('reverts', async () => {
                await assertRevert(this.token.transfer(to, 100, { from: owner }));
            });
        });
    });

    describe('balanceOf', async () => {
        describe('when the requested account has no tokens', async () => {
            it('returns zero', async () => {
                const balance = await this.token.balanceOf(anotherAccount);

                assert.equal(balance, 0);
            });
        });
    });

    describe('token fields return values', async () => {
        describe('when the token fields are read', async () => {
            it('symbol is GOOD', async () => {
                assert.equal(await this.token.symbol(), 'GOOD');
            });

            it('name is GOOD', async () => {
                assert.equal(await this.token.name(), 'GOOD');
            });

            it('decimals is 18', async () => {
                assert.equal(await this.token.decimals(), 18);
            });
        });
    });

    describe('set mint agent', async () => {
        describe('when non-owner', async () => {
            it('should prevent non-owners from setting mint agent', async () => {
                assert.isTrue(owner !== anotherAccount);
                await assertRevert(this.token.setMintAgent(mintAgent, true, { from: anotherAccount }));
            });
        });

        describe('when owner', async () => {
            it('should not allow zero address', async () => {
                await assertRevert(this.token.setMintAgent(ZERO_ADDRESS, true, { from: owner }));
            })

            it('should not allow itself to be a mint agent', async () => {
                await assertRevert(this.token.setMintAgent(this.token.address, true, { from: owner }));
            });

            it('should have mint agent set to true', async () => {
                await this.token.setMintAgent(mintAgent, true, { from: owner });
                const state = await this.token.mintAgents(mintAgent);
                assert.isTrue(state);
            });

            it('should set multiple mint agents', async () => {
                await this.token.setMintAgent(mintAgent, true, { from: owner });
                await this.token.setMintAgent(owner, true, { from: owner });
                const stateA = await this.token.mintAgents(mintAgent);
                const stateB = await this.token.mintAgents(owner);
                assert.isTrue(stateA);
                assert.isTrue(stateB);
            });

            it('should have mint agent set to false', async () => {
                await this.token.setMintAgent(mintAgent, false, { from: owner });
                const state = await this.token.mintAgents(mintAgent);
                assert.isFalse(state);
            });

            it('emits a mint agent changed event', async () => {
                const { logs } = await this.token.setMintAgent(mintAgent, true, { from: owner });
                assert.equal(logs.length, 1);
                assert.equal(logs[0].event, 'MintAgentChanged');
                assert.equal(logs[0].args.addr, mintAgent);
                assert.isTrue(logs[0].args.state);
            });
        });
    });

    describe('minting finished', async () => {
        describe('when the token is not finished', async () => {
            it('returns false', async () => {
                const mintingFinished = await this.token.mintingFinished();
                assert.isFalse(mintingFinished);
            });
        });

        describe('when the token is finished', async () => {
            it('returns true', async () => {
                await this.token.setMintAgent(mintAgent, true, { from: owner });
                await this.token.finishMinting({ from: mintAgent });
                const mintingFinished = await this.token.mintingFinished();
                assert.isTrue(mintingFinished);
            });
        });
    });

    describe('finish minting', async () => {
        describe('when the sender is a valid token mint agent', async () => {
            beforeEach(async () => {
                await this.token.setMintAgent(mintAgent, true, { from: owner });
            });

            const from = mintAgent;

            describe('when the token was not finished', async () => {
                it('finishes token minting', async () => {
                    await this.token.finishMinting({ from: mintAgent });

                    const mintingFinished = await this.token.mintingFinished();
                    assert.isTrue(mintingFinished);
                });

                it('emits a mint finished event', async () => {
                    const { logs } = await this.token.finishMinting({ from: mintAgent });

                    assert.equal(logs.length, 1);
                    assert.equal(logs[0].event, 'MintFinished');
                });
            });

            describe('when the token was already finished', async () => {
                it('reverts', async () => {
                    await this.token.finishMinting({ from: mintAgent });
                    await assertRevert(this.token.finishMinting({ from: mintAgent }));
                });
            });
        });

        describe('when the sender is not a valid or known token mint agent', async () => {
            beforeEach(async () => {
                await this.token.setMintAgent(invalidMintAgent, false, { from: owner });
            });

            describe('when the token was not finished', async () => {
                it('reverts', async () => {
                    await assertRevert(this.token.finishMinting({ from: invalidMintAgent }));
                    await assertRevert(this.token.finishMinting({ from: unknownMintAgent }));
                });
            });

            describe('when the token was already finished', async () => {
                it('reverts', async () => {
                    await this.token.setMintAgent(mintAgent, true, { from: owner });
                    await this.token.finishMinting({ from: mintAgent });
                    await assertRevert(this.token.finishMinting({ from: invalidMintAgent }));
                    await assertRevert(this.token.finishMinting({ from: unknownMintAgent }));
                });
            });
        });
    });

    describe('mint', async () => {
        const amount = 100;

        describe('when the sender is a valid token mint agent', async () => {
            const fromAgent = mintAgent;
            const fromOwner = owner;

            beforeEach(async () => {
                await this.token.setMintAgent(mintAgent, true, { from: owner });
                await this.token.setMintAgent(owner, true, { from: owner });
            });

            describe('when destination is not valid', async () => {
                it('reverts a zero address', async () => {
                    await assertRevert(this.token.mint(ZERO_ADDRESS, amount, { from: mintAgent }));
                });

                it('reverts if the address is from itself', async () => {
                    await assertRevert(this.token.mint(this.token.address, amount, { from: mintAgent }));
                });
            });

            describe('when the token is not finished minting', async () => {
                it('mints the requested amount', async () => {
                    await this.token.mint(recipient, amount, { from: owner });
                    await this.token.mint(recipient, amount, { from: mintAgent });
                    const balance = await this.token.balanceOf(recipient);
                    assert.equal(balance, amount + amount);
                });

                it('emits a mint finished event', async () => {
                    const { logs } = await this.token.mint(recipient, amount, { from: mintAgent });

                    assert.equal(logs.length, 2);
                    
                    assert.equal(logs[0].event, 'Mint');
                    assert.equal(logs[0].args.to, recipient);
                    assert.equal(logs[0].args.amount, amount);
                    
                    assert.equal(logs[1].event, 'Transfer');
                    assert.equal(logs[1].args.to, recipient);
                    assert.equal(logs[1].args.from, ZERO_ADDRESS);
                    assert.equal(logs[1].args.value, amount);
                });
            });

            describe('when the token minting is finished', async () => {
                it('reverts', async () => {
                    await this.token.finishMinting({ fromAgent });
                    await assertRevert(this.token.mint(recipient, amount, { from: mintAgent }));
                });
            });
        });

        describe('when the sender is not a valid or known token mint agent', async () => {
            beforeEach(async () => {
                await this.token.setMintAgent(invalidMintAgent, false, { from: owner });
                await this.token.setMintAgent(mintAgent, true, { from: owner });
            });

            describe('when the token was not finished', async () => {
                it('reverts', async () => {
                    await assertRevert(this.token.mint(recipient, amount, { from: invalidMintAgent }));
                });
            });

            describe('when the token was already finished', async () => {
                it('reverts', async () => {
                    await this.token.finishMinting({ from: mintAgent });
                    await assertRevert(this.token.mint(recipient, amount, { from: invalidMintAgent }));
                    await assertRevert(this.token.mint(recipient, amount, { from: unknownMintAgent }));
                });
            });
        });
    });
});