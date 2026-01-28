"use client"

import { Navbar } from "@/components/navbar"
import { CounterDisplay } from "@/components/counter-display"
import { NetworkIndicator } from "@/components/network-indicator"
import { useWallet } from "@/components/providers/wallet-provider"
import { useCounterValue } from "@/hooks/counterQueries"

export default function Home() {
  const { network } = useWallet()
  const { data: counterValue, isLoading, isError } = useCounterValue()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Network:</span>
            <NetworkIndicator network={network} />
          </div>
          <CounterDisplay
            value={isError ? 0 : counterValue}
            isLoading={isLoading}
          />
          {isError && (
            <p className="text-sm text-destructive">
              Failed to fetch counter value. Is devnet running?
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
