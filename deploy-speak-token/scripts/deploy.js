const { ethers } = require("hardhat");

async function main() {
  const privateKey = process.env.TREASURY_PRIVATE_KEY;
  const configuredTreasury = process.env.TREASURY_PUBLIC_ADDRESS;
  if (!privateKey || !configuredTreasury) {
    throw new Error("Set TREASURY_PRIVATE_KEY and TREASURY_PUBLIC_ADDRESS in the deployment environment.");
  }

  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 56n) {
    throw new Error(`Mainnet deployment requires BSC chain ID 56; connected chain ID ${network.chainId}.`);
  }

  const expectedAddress = configuredTreasury.toLowerCase();
  const derivedAddress = new ethers.Wallet(privateKey).address.toLowerCase();

  if (derivedAddress !== expectedAddress) {
    throw new Error(`TREASURY_PRIVATE_KEY mismatch: expected ${expectedAddress}, derived ${derivedAddress}`);
  }

  const factory = await ethers.getContractFactory("SpeakToken");
  const token = await factory.deploy(derivedAddress);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  const treasuryBalance = await token.balanceOf(derivedAddress);

  console.log("EXPECTED_TREASURY_ADDRESS=" + expectedAddress);
  console.log("DERIVED_TREASURY_ADDRESS=" + derivedAddress);
  console.log("SPEAK_TOKEN_ADDRESS=" + tokenAddress);
  console.log("BALANCE_RAW=" + treasuryBalance.toString());
  console.log("BALANCE_SPEAK=" + ethers.formatEther(treasuryBalance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
