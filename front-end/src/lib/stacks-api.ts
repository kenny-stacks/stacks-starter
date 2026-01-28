import { DEVNET_STACKS_BLOCKCHAIN_API_URL } from "@/constants/devnet";
import {
  Configuration,
  SmartContractsApi,
  AccountsApi,
  InfoApi,
  TransactionsApi,
  MicroblocksApi,
  BlocksApi,
  FaucetsApi,
  FeesApi,
  SearchApi,
  RosettaApi,
  FungibleTokensApi,
  NonFungibleTokensApi,
  ConfigurationParameters,
} from "@stacks/blockchain-api-client";
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

function createConfig(
  stacksApiUrl: string,
  headers?: HTTPHeaders
): Configuration {
  const configParams: ConfigurationParameters = {
    basePath: stacksApiUrl,
    headers,
    fetchApi: fetch,
  };
  return new Configuration(configParams);
}

export function apiClients(config: Configuration) {
  const smartContractsApi = new SmartContractsApi(config);
  const accountsApi = new AccountsApi(config);
  const infoApi = new InfoApi(config);
  const transactionsApi = new TransactionsApi(config);
  const microblocksApi = new MicroblocksApi(config);
  const blocksApi = new BlocksApi(config);
  const faucetsApi = new FaucetsApi(config);
  const feesApi = new FeesApi(config);
  const searchApi = new SearchApi(config);
  const rosettaApi = new RosettaApi(config);
  const fungibleTokensApi = new FungibleTokensApi(config);
  const nonFungibleTokensApi = new NonFungibleTokensApi(config);

  return {
    smartContractsApi,
    accountsApi,
    infoApi,
    transactionsApi,
    microblocksApi,
    blocksApi,
    faucetsApi,
    feesApi,
    searchApi,
    rosettaApi,
    fungibleTokensApi,
    nonFungibleTokensApi,
    config,
  };
}

export const getApi = (stacksApiUrl: string, headers?: HTTPHeaders) => {
  const config = createConfig(stacksApiUrl, headers);
  return apiClients(config);
};
