import { useQuery, useMutation, useQueryClient, UseQueryResult } from "@tanstack/react-query"
import { getApi, getStacksUrl } from "@/lib/stacks-api"
import { cvToJSON, hexToCV, PostConditionMode } from "@stacks/transactions"
import { COUNTER_CONTRACT } from "@/constants/contracts"
import { useWallet } from "@/components/providers/wallet-provider"
import { executeContractCall, openContractCall } from "@/lib/contract-utils"
import { toast } from "sonner"

export const useCounterValue = (): UseQueryResult<number> => {
  const api = getApi(getStacksUrl()).smartContractsApi

  return useQuery<number>({
    queryKey: ["counterValue"],
    queryFn: async () => {
      const response = await api.callReadOnlyFunction({
        contractAddress: COUNTER_CONTRACT.address || "",
        contractName: COUNTER_CONTRACT.name,
        functionName: "get-count",
        readOnlyFunctionArgs: {
          sender: COUNTER_CONTRACT.address || "",
          arguments: [],
        },
      })

      if (response?.okay && response?.result) {
        const result = cvToJSON(hexToCV(response.result))
        // get-count returns (ok uint), so check success and extract value
        if (result?.success) {
          return parseInt(result.value.value, 10)
        } else {
          throw new Error("Contract returned error response")
        }
      } else {
        throw new Error(response?.cause || "Error fetching counter value")
      }
    },
    refetchInterval: 10000, // Poll every 10 seconds
    retry: 3, // Retry 3 times to handle devnet block 2 delay
  })
}

export const useIncrementCounter = () => {
  const { isDevnet, devnetWallet, isConnected } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!isConnected) {
        throw new Error("Wallet not connected")
      }

      const txOptions = {
        contractAddress: COUNTER_CONTRACT.address || "",
        contractName: COUNTER_CONTRACT.name,
        functionName: "increment",
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
      }

      if (isDevnet) {
        // Devnet: Direct signing without wallet extension
        return await executeContractCall(txOptions, devnetWallet)
      } else {
        // Testnet/Mainnet: Use Leather wallet
        const result = await openContractCall(txOptions)
        return { txid: result.txid || "" }
      }
    },
    onSuccess: (data) => {
      toast.success("Transaction submitted", {
        description: `TX: ${data.txid.slice(0, 10)}...`,
      })
      // Invalidate counter query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["counterValue"] })
    },
    onError: (error: Error) => {
      toast.error("Transaction failed", {
        description: error.message,
      })
    },
  })
}

export const useDecrementCounter = () => {
  const { isDevnet, devnetWallet, isConnected } = useWallet()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!isConnected) {
        throw new Error("Wallet not connected")
      }

      const txOptions = {
        contractAddress: COUNTER_CONTRACT.address || "",
        contractName: COUNTER_CONTRACT.name,
        functionName: "decrement",
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
      }

      if (isDevnet) {
        return await executeContractCall(txOptions, devnetWallet)
      } else {
        const result = await openContractCall(txOptions)
        return { txid: result.txid || "" }
      }
    },
    onSuccess: (data) => {
      toast.success("Transaction submitted", {
        description: `TX: ${data.txid.slice(0, 10)}...`,
      })
      queryClient.invalidateQueries({ queryKey: ["counterValue"] })
    },
    onError: (error: Error) => {
      toast.error("Transaction failed", {
        description: error.message,
      })
    },
  })
}
