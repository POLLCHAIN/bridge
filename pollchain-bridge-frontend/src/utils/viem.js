import { bsc, mainnet } from "viem/chains";
import { createPublicClient, http } from "viem";
import { CONSTANTS } from "./constants";

export const publicClientConfig = {
  [CONSTANTS.BSC_CHAIN_ID]: createPublicClient({
    chain: bsc,
    transport: http(import.meta.env.VITE_BSC_RPC_URL ?? ""),
  }),
  [CONSTANTS.ETHEREUM_CHAIN_ID]: createPublicClient({
    transport: http(import.meta.env.VITE_ETHEREUM_RPC_URL ?? ""),
    chain: mainnet,
  }),
};
