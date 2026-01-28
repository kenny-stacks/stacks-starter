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
  const api = getApi(getStacksUrl()).transactionsApi

  return useQuery<TransactionStatusResult>({
    queryKey: ["transactionStatus", txid],
    queryFn: async () => {
      if (!txid) throw new Error("No transaction ID")

      const tx = await api.getTransactionById({ txId: txid }) as {
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
