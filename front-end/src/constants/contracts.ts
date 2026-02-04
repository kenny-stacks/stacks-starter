import { devnetWallets } from "@/lib/devnet-wallet-context";

const DEPLOYER_ADDRESS =
  process.env.NEXT_PUBLIC_STACKS_NETWORK === "devnet"
    ? devnetWallets[0].stxAddress
    : process.env.NEXT_PUBLIC_STACKS_NETWORK === "testnet"
    ? process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER_TESTNET_ADDRESS
    : process.env.NEXT_PUBLIC_CONTRACT_DEPLOYER_MAINNET_ADDRESS;

export const COUNTER_CONTRACT = {
  address: DEPLOYER_ADDRESS,
  name: "counter",
} as const;
