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
