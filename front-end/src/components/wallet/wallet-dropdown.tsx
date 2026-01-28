"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet } from "@/components/providers/wallet-provider"
import { formatStxAddress } from "@/lib/address-utils"
import { toast } from "sonner"
import { Copy, LogOut } from "lucide-react"

export function WalletDropdown() {
  const { address, disconnectWallet } = useWallet()

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
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="mr-2 size-4" />
          <span className="font-mono text-xs truncate">{address}</span>
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
