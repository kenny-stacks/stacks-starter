import { STACKS_TESTNET, StacksNetwork } from "@stacks/network";

export const DEVNET_STACKS_BLOCKCHAIN_API_URL = "http://localhost:3999";

export const DEVNET_NETWORK: StacksNetwork = {
  ...STACKS_TESTNET,
  client: { baseUrl: DEVNET_STACKS_BLOCKCHAIN_API_URL },
};
