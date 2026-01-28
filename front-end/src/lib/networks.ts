export type NetworkType = "devnet" | "testnet" | "mainnet"

export interface NetworkConfig {
  name: NetworkType
  label: string
  variant: "default" | "secondary" | "outline" | "destructive"
}

export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  devnet: { name: "devnet", label: "Devnet", variant: "outline" },
  testnet: { name: "testnet", label: "Testnet", variant: "secondary" },
  mainnet: { name: "mainnet", label: "Mainnet", variant: "default" },
}

export function getNetworkConfig(network: NetworkType): NetworkConfig {
  return NETWORKS[network]
}
