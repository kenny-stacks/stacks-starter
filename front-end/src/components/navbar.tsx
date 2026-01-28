"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="font-semibold">Stacks Starter</div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline">Connect Wallet</Button>
        </div>
      </div>
    </nav>
  )
}
