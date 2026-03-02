"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "@/components/providers/wallet-provider"
import { formatStxAddress } from "@/lib/address-utils"
import { toast } from "sonner"
import { Copy, LogOut } from "lucide-react"
import { useStxBalance, useSbtcBalance } from "@/hooks/balanceQueries"

export function WalletDropdown() {
  const { address, disconnectWallet } = useWallet()
  const { data: stxBalance, isLoading: stxLoading } = useStxBalance(address || null)
  const { data: sbtcBalance, isLoading: sbtcLoading } = useSbtcBalance(address || null)

  const copyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      toast.success("Address copied to clipboard")
    } catch {
      toast.error("Failed to copy address")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {formatStxAddress(address || "")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="text-sm font-medium">
            {stxLoading ? "—" : `${stxBalance} STX`}
          </span>
          <span className="text-sm font-medium">
            {sbtcLoading ? "—" : `${sbtcBalance} sBTC`}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="mr-2 size-4" />
          <span className="truncate font-mono text-xs">{address}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet}>
          <LogOut className="mr-2 size-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
