# SPEAK Token Deployment

This project includes a BEP-20 compatible `$SPEAK` token in `contracts/SpeakToken.sol`.

- Name: `SPEAK`
- Symbol: `SPEAK`
- Initial supply: `1,000,000,000 SPEAK`
- Decimals: `18`
- Scheduled burn cap: `100,000,000 SPEAK`
- Burn availability: `2027-01-01 00:00:00 UTC`

The contract is owner-controlled. The owner can call `burnScheduled` or `burnRemainingScheduled` after the start date. Token holders can burn their own tokens through the inherited `burn` function.

## Deploy to BSC Testnet

### Prerequisites

1. Install Node.js 18 or newer.
2. Install Hardhat and OpenZeppelin Contracts in a separate deployment project:

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

3. Add `contracts/SpeakToken.sol` to that Hardhat project's `contracts` directory.
4. Create a BSC testnet wallet and fund it with test BNB from a BSC testnet faucet.
5. Never commit a private key or seed phrase.

### Environment variables

Create a `.env` file in the deployment project:

```env
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
DEPLOYER_PRIVATE_KEY=your_testnet_private_key_without_0x
BSCSCAN_API_KEY=optional_bscscan_api_key
```

Add `.env` to `.gitignore`.

### Hardhat network configuration

In `hardhat.config.js`:

```js
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 97,
    },
  },
};
```

### Deployment script

Create `scripts/deploy.js`:

```js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const Token = await ethers.getContractFactory("SpeakToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();

  console.log("Deployer:", deployer.address);
  console.log("SPEAK token:", await token.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Compile and deploy:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network bscTestnet
```

Save the deployed address as `SPEAK_TOKEN_ADDRESS` for the backend service. Verify the contract on BscScan using the deployed constructor argument, which is the deployer/initial owner address.

## Backend token service

The backend service uses ethers.js v6. Install its dependencies from the backend directory:

```bash
cd backend
npm install
```

Set these backend environment variables:

```env
BSC_RPC_URL=https://data-seed-prebsc-1-s1.bnbchain.org:8545
TREASURY_PRIVATE_KEY=the_private_key_for_the_treasury_wallet_without_0x
SPEAK_TOKEN_ADDRESS=0xYourDeployedTokenAddress
```

The configured treasury public address is `0xEEB7d5598502fFf0E821F9c64F8fA51906747c54`. The `TREASURY_PRIVATE_KEY` must derive that exact address. It signs reward transfers, so the treasury pays the BSC gas fees. Keep it server-side and never expose it to the frontend.
