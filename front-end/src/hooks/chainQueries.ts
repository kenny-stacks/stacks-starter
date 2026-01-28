import { getApi, getStacksUrl } from "@/lib/stacks-api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useCurrentBtcBlock = (): UseQueryResult<number> => {
  const api = getApi(getStacksUrl()).blocksApi;
  return useQuery<number>({
    queryKey: ["currentBlock"],
    queryFn: async () => {
      const response = await api.getBlocks({ limit: 1 });

      const latestBlockHeight = response?.results?.[0]?.burn_block_height;
      if (latestBlockHeight) {
        return latestBlockHeight;
      } else {
        throw new Error("Error fetching current block height from on-chain");
      }
    },
    refetchInterval: 10000,
  });
};
