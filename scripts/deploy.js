const hre = require('hardhat');

async function main() {
  const OttoMarketplace = await hre.ethers.getContractFactory('OttoMarketplace');
  const ottoMarketplace = await OttoMarketplace.deploy();
  await ottoMarketplace.deployed();

  console.log('Market deployed to:', ottoMarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
