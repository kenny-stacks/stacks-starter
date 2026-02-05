import { DEVNET_STACKS_BLOCKCHAIN_API_URL } from "@/constants/devnet";
import { createClient } from "@stacks/blockchain-api-client";
import { STACKS_TESTNET, STACKS_DEVNET, STACKS_MAINNET } from "@stacks/network";
import { Network } from "./contract-utils";

type HTTPHeaders = Record<string, string>;

export const STACKS_API_MAINNET_URL = "https://api.mainnet.hiro.so";
export const STACKS_API_TESTNET_URL = "https://api.testnet.hiro.so";

export function getStacksUrl() {
  if (process.env.NEXT_PUBLIC_STACKS_NETWORK === "devnet") {
    return DEVNET_STACKS_BLOCKCHAIN_API_URL;
  } else if (process.env.NEXT_PUBLIC_STACKS_NETWORK === "testnet") {
    return STACKS_API_TESTNET_URL;
  } else {
    return STACKS_API_MAINNET_URL;
  }
}

export function getStacksNetworkString(): Network {
  return (process.env.NEXT_PUBLIC_STACKS_NETWORK || "devnet") as Network;
}

export function getStacksNetwork() {
  if (process.env.NEXT_PUBLIC_STACKS_NETWORK === "devnet") {
    return STACKS_DEVNET;
  } else if (process.env.NEXT_PUBLIC_STACKS_NETWORK === "testnet") {
    return STACKS_TESTNET;
  } else {
    return STACKS_MAINNET;
  }
}

export type StacksApiClient = ReturnType<typeof createClient>;

export const getApi = (stacksApiUrl: string, headers?: HTTPHeaders): StacksApiClient => {
  const client = createClient({ baseUrl: stacksApiUrl });

  if (headers) {
    client.use({
      onRequest({ request }) {
        Object.entries(headers).forEach(([key, value]) => {
          request.headers.set(key, value);
        });
        return request;
      },
    });
  }

  return client;
};
