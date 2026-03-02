import { getApi, getStacksUrl } from "@/lib/stacks-api";
import { ustxToStx } from "@/lib/currency-utils";
import { satsToSbtc } from "@/lib/currency-utils";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

export const useStxBalance = (
  address: string | null
): UseQueryResult<number> => {
  const client = getApi(getStacksUrl());

  return useQuery<number>({
    queryKey: ["stxBalance", address],
    queryFn: async () => {
      const { data, error } = await client.GET(
        "/extended/v2/addresses/{principal}/balances/stx",
        {
          params: { path: { principal: address! } },
        }
      );

      if (error) {
        throw new Error("Error fetching STX balance");
      }

      return ustxToStx(data.balance) as number;
    },
    enabled: !!address,
    refetchInterval: 10000,
  });
};

export const useSbtcBalance = (
  address: string | null
): UseQueryResult<number> => {
  const client = getApi(getStacksUrl());

  return useQuery<number>({
    queryKey: ["sbtcBalance", address],
    queryFn: async () => {
      const { data, error } = await client.GET(
        "/extended/v2/addresses/{principal}/balances/ft",
        {
          params: { path: { principal: address! } },
        }
      );

      if (error) {
        throw new Error("Error fetching sBTC balance");
      }

      const sbtcEntry = data.results?.find((ft) =>
        ft.token.includes("sbtc-token")
      );

      if (!sbtcEntry) return 0;

      return satsToSbtc(Number(sbtcEntry.balance));
    },
    enabled: !!address,
    refetchInterval: 10000,
  });
};
