import { useQuery } from "@tanstack/react-query"
import { getApi, getStacksUrl } from "@/lib/stacks-api"

export type TxStatus = "pending" | "success" | "abort_by_response" | "abort_by_post_condition"

interface TransactionStatusResult {
  status: TxStatus
  blockHeight?: number
  isConfirmed: boolean
  isFailed: boolean
}

export const useTransactionStatus = (txid: string | null) => {
  const client = getApi(getStacksUrl())

  return useQuery<TransactionStatusResult>({
    queryKey: ["transactionStatus", txid],
    queryFn: async () => {
      if (!txid) throw new Error("No transaction ID")

      const { data, error } = await client.GET("/extended/v1/tx/{tx_id}", {
        params: { path: { tx_id: txid } },
      })

      if (error) {
        throw new Error("Error fetching transaction")
      }

      const tx = data as {
        tx_status: TxStatus
        block_height?: number
      }
      const status = tx.tx_status
      const isConfirmed = status === "success"
      const isFailed = status.includes("abort")

      return {
        status,
        blockHeight: tx.block_height,
        isConfirmed,
        isFailed,
      }
    },
    enabled: !!txid,
    refetchInterval: (query) => {
      // Stop polling once transaction reaches terminal state
      const data = query.state.data
      if (data?.isConfirmed || data?.isFailed) {
        return false
      }
      return 3000 // Poll every 3 seconds while pending
    },
    retry: false,
  })
}
