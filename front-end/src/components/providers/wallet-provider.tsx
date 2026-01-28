"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { connect, disconnect, isConnected, getLocalStorage } from "@stacks/connect"
import { DevnetWallet } from "@/lib/devnet-wallet-context"
import { NetworkType } from "@/lib/networks"

interface WalletContextType {
  // Connection state
  isConnected: boolean
  isConnecting: boolean

  // User data
  address: string | null
  network: NetworkType

  // Actions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void

  // Devnet specific
  isDevnet: boolean
  devnetWallet: DevnetWallet | null
  setDevnetWallet: (wallet: DevnetWallet | null) => void
}

const WalletContext = createContext<WalletContextType | null>(null)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Get network from environment, default to devnet
  const network = (process.env.NEXT_PUBLIC_NETWORK || "devnet") as NetworkType
  const isDevnet = network === "devnet"

  // State
  const [mounted, setMounted] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [leatherConnected, setLeatherConnected] = useState(false)
  const [devnetWallet, setDevnetWallet] = useState<DevnetWallet | null>(null)

  // Mount effect - check for existing Leather connection
  useEffect(() => {
    setMounted(true)
    if (!isDevnet) {
      setLeatherConnected(isConnected())
    }
  }, [isDevnet])

  // Leather wallet connection
  const connectWallet = useCallback(async () => {
    if (isDevnet) {
      console.warn("Connect wallet called on devnet - use setDevnetWallet instead")
      return
    }

    try {
      setIsConnecting(true)
      await connect()
      setLeatherConnected(isConnected())
    } catch (error) {
      console.error("Wallet connection failed:", error)
    } finally {
      setIsConnecting(false)
    }
  }, [isDevnet])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    if (isDevnet) {
      setDevnetWallet(null)
    } else {
      disconnect()
      setLeatherConnected(false)
    }
  }, [isDevnet])

  // Compute current address
  const address = useMemo(() => {
    if (!mounted) return null

    if (isDevnet) {
      return devnetWallet?.stxAddress || null
    }

    if (!leatherConnected) return null

    const data = getLocalStorage()
    const stxAddresses = data?.addresses?.stx || []

    // v8.x returns only 1 address for current network
    return stxAddresses.length > 0 ? stxAddresses[0].address : null
  }, [mounted, isDevnet, devnetWallet, leatherConnected])

  // Compute connection state
  const isConnectedValue = useMemo(() => {
    if (!mounted) return false
    return isDevnet ? devnetWallet !== null : leatherConnected
  }, [mounted, isDevnet, devnetWallet, leatherConnected])

  const contextValue = useMemo<WalletContextType>(
    () => ({
      isConnected: isConnectedValue,
      isConnecting,
      address,
      network,
      connectWallet,
      disconnectWallet,
      isDevnet,
      devnetWallet,
      setDevnetWallet,
    }),
    [
      isConnectedValue,
      isConnecting,
      address,
      network,
      connectWallet,
      disconnectWallet,
      isDevnet,
      devnetWallet,
    ]
  )

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
