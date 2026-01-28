"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/providers/wallet-provider"
import { DevnetWalletSelector } from "./devnet-wallet-selector"

export function ConnectButton() {
  const { isDevnet, isConnecting, connectWallet } = useWallet()

  // On devnet, show wallet selector instead of connect button
  if (isDevnet) {
    return <DevnetWalletSelector />
  }

  // On testnet/mainnet, show Leather connect button
  return (
    <Button
      variant="outline"
      onClick={connectWallet}
      disabled={isConnecting}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
