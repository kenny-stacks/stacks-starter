import { Navbar } from "@/components/navbar"
import { CounterDisplay } from "@/components/counter-display"
import { NetworkIndicator } from "@/components/network-indicator"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Network:</span>
            <NetworkIndicator network="devnet" />
          </div>
          <CounterDisplay value={0} />
        </div>
      </main>
    </div>
  )
}
