"use client"

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

interface CounterDisplayProps {
  value?: number
  isLoading?: boolean
}

export function CounterDisplay({ value = 0, isLoading = false }: CounterDisplayProps) {
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
        <CardDescription>Current value from smart contract</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-6xl font-bold tabular-nums">{value}</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" disabled>
          - Decrement
        </Button>
        <Button disabled>
          + Increment
        </Button>
      </CardFooter>
    </Card>
  )
}
