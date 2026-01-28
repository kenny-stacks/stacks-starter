import { devnetWallets } from "@/lib/devnet-wallet-context";

const CONTRACT_NAME = "fundraising";

const DEPLOYER_ADDRESS =
  process.env.NEXT_PUBLIC_STACKS_NETWORK === "devnet"
    ? devnetWallets[0].stxAddress
    : process.env.NEXT_PUBLIC_STACKS_NETWORK === "testnet"
    ? process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER_TESTNET_ADDRESS
    : process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER_MAINNET_ADDRESS;

export const FUNDRAISING_CONTRACT = {
  address: DEPLOYER_ADDRESS,
  name: CONTRACT_NAME,
} as const;

const sbtcMainnetAddress = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4";

export const SBTC_CONTRACT = {
  address:
    process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet"
      ? sbtcMainnetAddress
      : DEPLOYER_ADDRESS,
  name: "sbtc-token",
} as const;

export const getContractIdentifier = () => {
  return `${FUNDRAISING_CONTRACT.address}.${FUNDRAISING_CONTRACT.name}`;
};
