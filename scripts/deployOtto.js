const hre = require('hardhat');

async function main() {
  const Allowable = await hre.ethers.getContractFactory('Allowable');
  const allowable = await Allowable.deploy();
  await allowable.deployed();
  const allowContract = Allowable.attach(allowable.address);

  console.log('Allowable deployed to:', allowable.address);

  const OttoStorage = await hre.ethers.getContractFactory('OttoStorage');
  const ottoStorage = await OttoStorage.deploy(allowable.address, '0x4f1401d78d87B1025423F4f7a478F3164cf3B2F8');
  await ottoStorage.deployed();
  await allowContract.allowAccess(ottoStorage.address);

  console.log('OttoStorage deployed to:', ottoStorage.address);

  const OttoRoyalty = await hre.ethers.getContractFactory('OttoRoyalty');
  const ottoRoyalty = await OttoRoyalty.deploy(allowable.address);
  await ottoRoyalty.deployed();
  await allowContract.allowAccess(ottoRoyalty.address);

  console.log('OttoRoyalty deployed to:', ottoRoyalty.address);

  const OttoMarketplace = await hre.ethers.getContractFactory('OttoMarketplace');
  const ottoMarketplace = await OttoMarketplace.deploy(ottoStorage.address, ottoRoyalty.address);
  await ottoMarketplace.deployed();
  await allowContract.allowAccess(ottoMarketplace.address);

  console.log('OttoMarket deployed to:', ottoMarketplace.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
