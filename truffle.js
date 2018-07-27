const HDWalletProvider = require("truffle-hdwallet-provider");
const dotenv = require("dotenv").config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    },
    ropsten: {
      provider: new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA_ROPSTEN, 1),
      from: process.env.ADDRESS_ROPSTEN,
      network_id: 3,
      gas: 4600000
    },
    live: {
      provider: new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA_LIVE),
      from: process.env.ADDRESS_LIVE,
      network_id: 1
    }
  },
  solc: {
		optimizer: {
			enabled: true,
			runs: 200
		}
	},
  // mocha: {
  //   reporter: 'eth-gas-reporter',
  //   reporterOptions : {
  //     currency: 'USD'
  //   }
  // }
};