const EVMRevert = require('./helpers/EVMRevert');
const RateOfGood = artifacts.require('./RateOfGood.sol');
const Registry = artifacts.require('./Registry.sol');
const Delivery = artifacts.require('./Delivery.sol');
const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('Delivery', async ([_, owner, courier, recipient, unknownCourier, unknownRecipient]) => {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  const recipientId = 100;
  const courierId = 200;
  const itemDescription = "Unit test item";

  beforeEach(async () => {
    this.registry = await Registry.new({ from: owner });
    this.rateOfGood = await RateOfGood.new({ from: owner });
    this.delivery = await Delivery.new(this.registry.address, this.rateOfGood.address, { from: owner });

    this.registry.authorizeUser(courier, true, { from: owner });
    this.registry.authorizeUser(recipient, true, { from: owner });
  });

  describe('Creating a valid contract', async () => {
    it('should fail with invalid addresses', async () => {
      await Delivery.new(ZERO_ADDRESS, ZERO_ADDRESS, { from: owner }).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('deliveryRequested', async () => {
    it('should fail if the recipient address is invalid', async () => { 
      await this.delivery.deliveryRequested(unknownRecipient, recipientId, itemDescription, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the recipient id is invalid', async () => {
      await this.delivery.deliveryRequested(recipient, 0, itemDescription, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      const { logs } = await this.delivery.deliveryRequested(recipient, recipientId, itemDescription, { from: owner });
      const event = logs.find(e => e.event === 'EventDeliveryRequested');
      should.exist(event);
      event.args.recipient.should.equal(recipient);
      event.args.recipientId.should.be.bignumber.equal(recipientId);
      event.args.itemDescription.should.equal(itemDescription);
    });
  });

  describe('deliveryVerify', async () => {
    it('should fail if the courier address is invalid', async () => {
      await this.delivery.deliveryVerify(unknownCourier, courierId, recipient, recipientId, itemDescription, 1, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the courier id is invalid', async () => {
      await this.delivery.deliveryVerify(courier, 0, recipient, recipientId, itemDescription, 1, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the recipient address is invalid', async () => {
      await this.delivery.deliveryVerify(courier, courierId, unknownRecipient, recipientId, itemDescription, 1, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if the recipient id is invalid', async () => {
      await this.delivery.deliveryVerify(courier, courierId, recipient, 0, itemDescription, 1, { from: owner }).should.be.rejectedWith(EVMRevert);
    });

    it('emits an event', async () => {
      const totalWeight = 1;
      const reward = 25 * (10 ** 18);
      const { logs } = await this.delivery.deliveryVerify(courier, courierId, recipient, recipientId, itemDescription, totalWeight, { from: owner });
      const event = logs.find(e => e.event === 'EventDeliveryVerify');
      should.exist(event);
      event.args.courier.should.equal(courier);
      event.args.courierId.should.be.bignumber.equal(courierId);
      event.args.recipient.should.equal(recipient);
      event.args.recipientId.should.be.bignumber.equal(recipientId);
      event.args.itemDescription.should.equal(itemDescription);
      event.args.totalWeight.should.be.bignumber.equal(totalWeight);
      event.args.reward.should.be.bignumber.equal(reward);
    });
  });
});