"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWallet } from "@/components/providers/wallet-provider"
import { useIncrementCounter, useDecrementCounter } from "@/hooks/counterQueries"
import { useTransactionStatus } from "@/hooks/useTransactionStatus"
import { Loader2 } from "lucide-react"

interface CounterDisplayProps {
  value?: number
  isLoading?: boolean
}

export function CounterDisplay({ value = 0, isLoading = false }: CounterDisplayProps) {
  const { isConnected } = useWallet()
  const [pendingTxId, setPendingTxId] = useState<string | null>(null)

  const incrementMutation = useIncrementCounter()
  const decrementMutation = useDecrementCounter()
  const { data: txStatus } = useTransactionStatus(pendingTxId)

  // Clear pending tx when confirmed or failed
  useEffect(() => {
    if (txStatus?.isConfirmed || txStatus?.isFailed) {
      setPendingTxId(null)
    }
  }, [txStatus?.isConfirmed, txStatus?.isFailed])

  const handleIncrement = async () => {
    try {
      const result = await incrementMutation.mutateAsync()
      setPendingTxId(result.txid)
    } catch {
      // Error handled by mutation onError
    }
  }

  const handleDecrement = async () => {
    try {
      const result = await decrementMutation.mutateAsync()
      setPendingTxId(result.txid)
    } catch {
      // Error handled by mutation onError
    }
  }

  const isPending = incrementMutation.isPending || decrementMutation.isPending || !!pendingTxId
  const buttonsDisabled = !isConnected || isPending

  if (isLoading) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-24" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Counter Value</CardTitle>
        <CardDescription>
          {pendingTxId ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-3 animate-spin" />
              Transaction pending...
            </span>
          ) : !isConnected ? (
            "Connect wallet to interact"
          ) : (
            "Current value from smart contract"
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-6xl font-bold tabular-nums">{value}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleDecrement}
          disabled={buttonsDisabled || value === 0}
        >
          {decrementMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          - Decrement
        </Button>
        <Button
          onClick={handleIncrement}
          disabled={buttonsDisabled}
        >
          {incrementMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          + Increment
        </Button>
      </CardFooter>
    </Card>
  )
}
