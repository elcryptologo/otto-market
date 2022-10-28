
const fs = require('fs');

require('@nomiclabs/hardhat-waffle');

const privateKey = fs.readFileSync('.secret').toString().trim();

module.exports = {
  networks: {
    buidlerevm: {
      url: 'http://localhost:3000',
      gas: 'auto',
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
    },
    testnet: {
      url: 'http://localhost:3000',
      gasPrice: 20000000000,
    },
    settings: {
      url: 'http://localhost:3000',
      optimizer: {
        enabled: true,
        runs: 200,
        details: {
          yul: false,
        },
      },
    },
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
    },
    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com',
      accounts: [privateKey],
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/bed4fdcc76bb4978a9a3103ef0946f64',
      accounts: [privateKey],
    },
    mainnet: {
      chainId: 137,
      url: 'https://rpc.ankr.com/polygon',
      accounts: [privateKey],
    },
  },
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
};

