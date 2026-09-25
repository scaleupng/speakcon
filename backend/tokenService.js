import "dotenv/config";
import { ethers } from "ethers";

const rpcUrl = process.env.BSC_RPC_URL;
const treasuryPrivateKey = process.env.TREASURY_PRIVATE_KEY;
const tokenAddress = process.env.SPEAK_TOKEN_ADDRESS;
const treasuryAddress = process.env.TREASURY_PUBLIC_ADDRESS;

function requireConfig(value, name) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getProvider() {
  return new ethers.JsonRpcProvider(requireConfig(rpcUrl, "BSC_RPC_URL"));
}

function getWallet() {
  return new ethers.Wallet(requireConfig(treasuryPrivateKey, "TREASURY_PRIVATE_KEY"), getProvider());
}

function getTokenContract(signerOrProvider = getWallet()) {
  const address = requireConfig(tokenAddress, "SPEAK_TOKEN_ADDRESS");
  const abi = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function burn(uint256 amount)",
    "function burnScheduled(uint256 amount)",
    "function burnRemainingScheduled()",
    "function scheduledBurned() view returns (uint256)",
    "function totalSupply() view returns (uint256)",
  ];

  return new ethers.Contract(address, abi, signerOrProvider);
}

export function formatTokenAmount(amount, decimals = 18) {
  return ethers.formatUnits(amount, decimals);
}

export async function getBalance(address) {
  const contract = getTokenContract(getProvider());
  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(address);
  return {
    raw: balance.toString(),
    amount: formatTokenAmount(balance, decimals),
    decimals,
  };
}

export async function transferTokens(to, amount) {
  const contract = getTokenContract();
  const decimals = await contract.decimals();
  const transaction = await contract.transfer(to, ethers.parseUnits(String(amount), decimals));
  return transaction.wait();
}

/**
 * Transfer the conference reward from the treasury wallet.
 * The treasury wallet signs the transactions and therefore pays BSC gas.
 */
function buildRewards(userAddress, referrerAddress, userAmount, referrerAmount) {
  const rewards = [{ address: userAddress, amount: String(userAmount ?? (referrerAddress ? 1000 : 500)) }];
  if (referrerAddress && Number(referrerAmount ?? 2000) > 0) {
    rewards.push({ address: referrerAddress, amount: String(referrerAmount ?? 2000) });
  }
  return rewards;
}

export async function sendClaimTransactions(userAddress, referrerAddress = null, userAmount = null, referrerAmount = null) {
  if (!ethers.isAddress(userAddress)) throw new Error("Invalid user wallet address");
  if (referrerAddress && !ethers.isAddress(referrerAddress)) throw new Error("Invalid referrer wallet address");

  const wallet = getWallet();
  const signerAddress = await wallet.getAddress();
  if (signerAddress.toLowerCase() !== requireConfig(treasuryAddress, "TREASURY_PUBLIC_ADDRESS").toLowerCase()) {
    throw new Error("TREASURY_PRIVATE_KEY does not match the configured treasury address");
  }

  const contract = getTokenContract(wallet);
  const decimals = await contract.decimals();
  const rewards = buildRewards(userAddress, referrerAddress, userAmount, referrerAmount);

  const transactions = [];
  for (const reward of rewards) {
    const transaction = await contract.transfer(
      reward.address,
      ethers.parseUnits(reward.amount, decimals),
    );
    transactions.push({ address: reward.address, amount: reward.amount, hash: transaction.hash });
  }

  return { treasuryAddress: signerAddress, transactions };
}

export async function confirmClaimTransactions(transactions) {
  const provider = getProvider();
  const receipts = await Promise.all(transactions.map(async (transaction) => {
    const receipt = await provider.waitForTransaction(transaction.hash);
    if (!receipt || receipt.status !== 1) throw new Error(`Transaction failed: ${transaction.hash}`);
    return { ...transaction, hash: receipt.hash };
  }));
  return { receipts };
}

export const claimRewards = sendClaimTransactions;
export const processConferenceRewards = sendClaimTransactions;

export async function burnOwnTokens(amount) {
  const contract = getTokenContract();
  const decimals = await contract.decimals();
  const transaction = await contract.burn(ethers.parseUnits(String(amount), decimals));
  return transaction.wait();
}

export async function burnScheduledTokens(amount) {
  const contract = getTokenContract();
  const decimals = await contract.decimals();
  const transaction = await contract.burnScheduled(ethers.parseUnits(String(amount), decimals));
  return transaction.wait();
}

export async function burnRemainingScheduledTokens() {
  const contract = getTokenContract();
  const transaction = await contract.burnRemainingScheduled();
  return transaction.wait();
}

export async function getTokenSummary() {
  const contract = getTokenContract(getProvider());
  const [decimals, totalSupply, scheduledBurned] = await Promise.all([
    contract.decimals(),
    contract.totalSupply(),
    contract.scheduledBurned(),
  ]);

  return {
    totalSupply: formatTokenAmount(totalSupply, decimals),
    scheduledBurned: formatTokenAmount(scheduledBurned, decimals),
    decimals,
  };
}

if (process.argv[2] === "--claim-rewards" || process.argv[2] === "--confirm-claim-rewards") {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => { input += chunk; });
  process.stdin.on("end", async () => {
    try {
      const payload = JSON.parse(input);
      const result = process.argv[2] === "--confirm-claim-rewards"
        ? await confirmClaimTransactions(payload.transactions || [])
        : await sendClaimTransactions(payload.userAddress, payload.referrerAddress || null, payload.userAmount || null, payload.referrerAmount || null);
      process.stdout.write(JSON.stringify(result));
    } catch (error) {
      process.stderr.write(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });
}
