import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { getApi, getStacksUrl } from "@/lib/stacks-api";
import { FUNDRAISING_CONTRACT } from "@/constants/contracts";
import { cvToJSON, hexToCV, cvToHex, principalCV } from "@stacks/transactions";
import { PriceData, satsToSbtc, ustxToStx } from "@/lib/currency-utils";

interface CampaignInfo {
  start: number;
  end: number;
  goal: number;
  totalStx: number;
  totalSbtc: number;
  usdValue: number;
  donationCount: number;
  isExpired: boolean;
  isWithdrawn: boolean;
  isCancelled: boolean;
}

export const useCampaignInfo = (
  currentPrices: PriceData | undefined
): UseQueryResult<CampaignInfo> => {
  const api = getApi(getStacksUrl()).smartContractsApi;

  return useQuery<CampaignInfo>({
    queryKey: ["campaignInfo"],
    queryFn: async () => {
      const response = await api.callReadOnlyFunction({
        contractAddress: FUNDRAISING_CONTRACT.address || "",
        contractName: FUNDRAISING_CONTRACT.name,
        functionName: "get-campaign-info",
        readOnlyFunctionArgs: {
          sender: FUNDRAISING_CONTRACT.address || "",
          arguments: [],
        },
      });
      if (response?.okay && response?.result) {
        const result = cvToJSON(hexToCV(response?.result || ""));
        if (result?.success) {
          const totalSbtc = parseInt(
            result?.value?.value?.totalSbtc?.value,
            10
          );
          const totalStx = parseInt(result?.value?.value?.totalStx?.value, 10);

          return {
            goal: parseInt(result?.value?.value?.goal?.value, 10),
            start: parseInt(result?.value?.value?.start?.value, 10),
            end: parseInt(result?.value?.value?.end?.value, 10),
            totalSbtc,
            totalStx,
            usdValue:
              Number(ustxToStx(totalStx)) * (currentPrices?.stx || 0) +
              satsToSbtc(totalSbtc) * (currentPrices?.sbtc || 0),
            donationCount: parseInt(
              result?.value?.value?.donationCount?.value,
              10
            ),
            isExpired: result?.value?.value?.isExpired?.value,
            isWithdrawn: result?.value?.value?.isWithdrawn?.value,
            isCancelled: result?.value?.value?.isCancelled?.value,
          };
        } else {
          throw new Error("Error fetching campaign info from blockchain");
        }
      } else {
        throw new Error(
          response?.cause || "Error fetching campaign info from blockchain"
        );
      }
    },
    refetchInterval: 10000,
    retry: false,
    enabled: !!(currentPrices?.stx && currentPrices?.sbtc),
  });
};

interface CampaignDonation {
  stxAmount: number;
  sbtcAmount: number;
}

export const useExistingDonation = (
  address?: string | null | undefined
): UseQueryResult<CampaignDonation> => {
  const api = getApi(getStacksUrl()).smartContractsApi;
  return useQuery<CampaignDonation>({
    queryKey: ["campaignDonations", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");

      const stxResponse = await api.callReadOnlyFunction({
        contractAddress: FUNDRAISING_CONTRACT.address || "",
        contractName: FUNDRAISING_CONTRACT.name,
        functionName: "get-stx-donation",
        readOnlyFunctionArgs: {
          sender: FUNDRAISING_CONTRACT.address || "",
          arguments: [cvToHex(principalCV(address))],
        },
      });

      const sbtcResponse = await api.callReadOnlyFunction({
        contractAddress: FUNDRAISING_CONTRACT.address || "",
        contractName: FUNDRAISING_CONTRACT.name,
        functionName: "get-sbtc-donation",
        readOnlyFunctionArgs: {
          sender: FUNDRAISING_CONTRACT.address || "",
          arguments: [cvToHex(principalCV(address))],
        },
      });

      if (stxResponse?.okay && sbtcResponse?.okay) {
        const stxResult = cvToJSON(hexToCV(stxResponse?.result || ""));
        const sbtcResult = cvToJSON(hexToCV(sbtcResponse?.result || ""));

        if (stxResult?.success && sbtcResult?.success) {
          return {
            stxAmount: parseInt(stxResult?.value?.value, 10),
            sbtcAmount: parseInt(sbtcResult?.value?.value, 10),
          };
        } else {
          throw new Error("Error fetching donation info from blockchain");
        }
      } else {
        throw new Error(
          stxResponse?.cause || sbtcResponse?.cause
            ? `${stxResponse?.cause}. ${sbtcResponse?.cause}`
            : "Error fetching donation info from blockchain"
        );
      }
    },
    enabled: !!address,
    refetchInterval: 10000,
    retry: false,
  });
};
