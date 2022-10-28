const hre = require('hardhat');

const StorageAddress = '0x68B1D87F95878fE05B998F19b66F4baba5De1aed';
const MarketAddress = '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c';

async function main() {
  const OttoStorage = await hre.ethers.getContractFactory('OttoStorage');
  const ottoContract = OttoStorage.attach(StorageAddress);

  console.log('OttoStorage attached to:', StorageAddress);

  const OttoMarketplace = await hre.ethers.getContractFactory('OttoMarketplace');
  const ottoMarketplace = await OttoMarketplace.deploy(StorageAddress);
  await ottoMarketplace.deployed();

  await ottoContract.denyAccess(MarketAddress);
  await ottoContract.allowAccess(ottoMarketplace.address);

  console.log('OttoMarket deployed to:', ottoMarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
