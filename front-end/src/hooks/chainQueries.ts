import { getApi, getStacksUrl } from "@/lib/stacks-api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useCurrentBtcBlock = (): UseQueryResult<number> => {
  const client = getApi(getStacksUrl());

  return useQuery<number>({
    queryKey: ["currentBlock"],
    queryFn: async () => {
      const { data, error } = await client.GET("/extended/v2/blocks/", {
        params: { query: { limit: 1 } },
      });

      if (error) {
        throw new Error("Error fetching blocks from API");
      }

      const latestBlockHeight = data?.results?.[0]?.burn_block_height;
      if (latestBlockHeight) {
        return latestBlockHeight;
      } else {
        throw new Error("Error fetching current block height from on-chain");
      }
    },
    refetchInterval: 10000,
  });
};
