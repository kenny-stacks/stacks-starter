"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { devnetWallets } from "@/lib/devnet-wallet-context"
import { useWallet } from "@/components/providers/wallet-provider"
import { formatStxAddress } from "@/lib/address-utils"
import { cn } from "@/lib/utils"

export function DevnetWalletSelector() {
  const { devnetWallet, setDevnetWallet } = useWallet()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {devnetWallet ? formatStxAddress(devnetWallet.stxAddress) : "Select Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {devnetWallets.map((wallet) => {
          const isSelected = devnetWallet?.stxAddress === wallet.stxAddress
          return (
            <DropdownMenuItem
              key={wallet.stxAddress}
              onClick={() => setDevnetWallet(wallet)}
              className={cn(
                isSelected && "bg-accent"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium">{wallet.label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatStxAddress(wallet.stxAddress)}
                </span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
