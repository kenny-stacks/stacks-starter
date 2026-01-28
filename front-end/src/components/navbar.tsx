"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { useWallet } from "@/components/providers/wallet-provider"
import { ConnectButton } from "@/components/wallet/connect-button"
import { WalletDropdown } from "@/components/wallet/wallet-dropdown"

export function Navbar() {
  const { isConnected } = useWallet()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="font-semibold">Stacks Starter</div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isConnected ? <WalletDropdown /> : <ConnectButton />}
        </div>
      </div>
    </nav>
  )
}
