/**
 * Contract configuration for Grid of the Day
 * 
 * These values are set after deployment.
 * Run: npx hardhat run scripts/deploy.ts --network baseSepolia
 */

// Contract addresses (update after deployment)
export const CONTRACT_ADDRESSES = {
  badges: process.env.NEXT_PUBLIC_CONTRACT_BADGES || '',
  frames: process.env.NEXT_PUBLIC_CONTRACT_FRAMES || '',
};

// Chain IDs
export const CHAIN_IDS = {
  baseSepolia: 84532,
  base: 8453,
};

// Current chain
export const CURRENT_CHAIN_ID = 
  process.env.NEXT_PUBLIC_CHAIN_ID === '8453' 
    ? CHAIN_IDS.base 
    : CHAIN_IDS.baseSepolia;

// Check if contracts are deployed
export function areContractsDeployed(): boolean {
  return !!(CONTRACT_ADDRESSES.badges && CONTRACT_ADDRESSES.frames);
}

// ABIs (simplified for client use)
export const BADGES_ABI = [
  {
    inputs: [
      { name: "dayId", type: "uint256" },
      { name: "signature", type: "bytes" }
    ],
    name: "claimDaily",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "streakDays", type: "uint256" },
      { name: "signature", type: "bytes" }
    ],
    name: "claimStreakBadge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "player", type: "address" },
      { name: "tokenId", type: "uint256" }
    ],
    name: "hasClaimed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" }
    ],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const FRAMES_ABI = [
  {
    inputs: [
      { name: "frameId", type: "uint256" },
      { name: "signature", type: "bytes" }
    ],
    name: "mintFrame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "player", type: "address" },
      { name: "frameId", type: "uint256" }
    ],
    name: "hasMinted",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" }
    ],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;
