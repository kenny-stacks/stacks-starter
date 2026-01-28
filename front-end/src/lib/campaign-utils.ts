import { FUNDRAISING_CONTRACT, SBTC_CONTRACT } from "@/constants/contracts";
import { ContractCallRegularOptions } from "@stacks/connect";
import { Network } from "./contract-utils";
import {
  AnchorMode,
  FungiblePostCondition,
  Pc,
  PostConditionMode,
  uintCV,
} from "@stacks/transactions";

interface ContributeParams {
  address: string;
  amount: number;
}

export const getContributeStxTx = (
  network: Network,
  params: ContributeParams // Send amount in microstacks
): ContractCallRegularOptions => {
  const { address, amount } = params;

  return {
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    contractAddress: FUNDRAISING_CONTRACT.address || "",
    contractName: FUNDRAISING_CONTRACT.name,
    network,
    functionName: "donate-stx",
    functionArgs: [uintCV(amount)],
    postConditions: [Pc.principal(address).willSendEq(amount).ustx()],
  };
};

export const getContributeSbtcTx = (
  network: Network,
  params: ContributeParams // Send amount in sats
): ContractCallRegularOptions => {
  const { address, amount } = params;

  const postCondition: FungiblePostCondition = {
    type: "ft-postcondition",
    address,
    condition: "eq",
    asset: `${SBTC_CONTRACT.address}.${SBTC_CONTRACT.name}::sbtc-token`,
    amount,
  };

  return {
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    contractAddress: FUNDRAISING_CONTRACT.address || "",
    contractName: FUNDRAISING_CONTRACT.name,
    network,
    functionName: "donate-sbtc",
    functionArgs: [uintCV(amount)],
    postConditions: [postCondition],
  };
};

export const getInitializeTx = (
  network: Network,
  address: string,
  goalInUSD: number
): ContractCallRegularOptions => {
  return {
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    contractAddress: FUNDRAISING_CONTRACT.address || "",
    contractName: FUNDRAISING_CONTRACT.name,
    network,
    functionName: "initialize-campaign",
    functionArgs: [uintCV(goalInUSD), uintCV(0)],
    postConditions: [Pc.principal(address).willSendEq(0).ustx()],
  };
};

export const getCancelTx = (
  network: Network,
  address: string
): ContractCallRegularOptions => {
  return {
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    contractAddress: FUNDRAISING_CONTRACT.address || "",
    contractName: FUNDRAISING_CONTRACT.name,
    network,
    functionName: "cancel-campaign",
    functionArgs: [],
    postConditions: [Pc.principal(address).willSendEq(0).ustx()],
  };
};

export const getRefundTx = (
  network: Network,
  address: string
): ContractCallRegularOptions => {
  return {
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    contractAddress: FUNDRAISING_CONTRACT.address || "",
    contractName: FUNDRAISING_CONTRACT.name,
    network,
    functionName: "refund",
    functionArgs: [],
    postConditions: [Pc.principal(address).willSendEq(0).ustx()],
  };
};

export const getWithdrawTx = (
  network: Network,
  address: string
): ContractCallRegularOptions => {
  return {
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Deny,
    contractAddress: FUNDRAISING_CONTRACT.address || "",
    contractName: FUNDRAISING_CONTRACT.name,
    network,
    functionName: "withdraw",
    functionArgs: [],
    postConditions: [Pc.principal(address).willSendEq(0).ustx()],
  };
};
