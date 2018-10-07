const EVMRevert = require('./helpers/EVMRevert');
const Volunteeer = artifacts.require('./Volunteer.sol');

const should = require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('Volunteer', async ([owner, user, charity, nonOwner]) => {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    // token mock
    // registry mock
    // rate of good mock
});