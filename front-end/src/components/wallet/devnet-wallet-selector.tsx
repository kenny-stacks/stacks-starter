"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { devnetWallets, type DevnetWallet } from "@/lib/devnet-wallet-context"
import { useWallet } from "@/components/providers/wallet-provider"
import { formatStxAddress } from "@/lib/address-utils"
import { cn } from "@/lib/utils"
import { useStxBalance, useSbtcBalance } from "@/hooks/balanceQueries"

function DevnetWalletItem({
  wallet,
  isSelected,
  onSelect,
}: {
  wallet: DevnetWallet
  isSelected: boolean
  onSelect: () => void
}) {
  const { data: stxBalance, isLoading: stxLoading } = useStxBalance(wallet.stxAddress)
  const { data: sbtcBalance, isLoading: sbtcLoading } = useSbtcBalance(wallet.stxAddress)

  return (
    <DropdownMenuItem
      onClick={onSelect}
      className={cn(isSelected && "bg-accent")}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{wallet.label}</span>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-mono">{formatStxAddress(wallet.stxAddress)}</span>
          <span>·</span>
          <span>{stxLoading ? "—" : `${stxBalance} STX`}</span>
          <span>·</span>
          <span>{sbtcLoading ? "—" : `${sbtcBalance} sBTC`}</span>
        </div>
      </div>
    </DropdownMenuItem>
  )
}

export function DevnetWalletSelector() {
  const { devnetWallet, setDevnetWallet } = useWallet()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {devnetWallet ? formatStxAddress(devnetWallet.stxAddress) : "Select Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {devnetWallets.map((wallet) => (
          <DevnetWalletItem
            key={wallet.stxAddress}
            wallet={wallet}
            isSelected={devnetWallet?.stxAddress === wallet.stxAddress}
            onSelect={() => setDevnetWallet(wallet)}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
