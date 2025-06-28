const { bsc, mainnet } = require("viem/chains");
const { CONSTANTS } = require("../misc/constants");
const { createPublicClient, createWalletClient, http } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");

const publicClientConfig = {
  [CONSTANTS.BSC_CHAIN_ID]: createPublicClient({
    chain: bsc,
    transport: http(),
  }),
  [CONSTANTS.ETHEREUM_CHAIN_ID]: createPublicClient({
    transport: http(CONSTANTS.ETHEREUM_RPC_URL),
    chain: mainnet,
  }),
};

const validatorClientConfig = {
  [CONSTANTS.BSC_CHAIN_ID]: createWalletClient({
    chain: bsc,
    transport: http(),
    account: privateKeyToAccount(process.env.VALIDATOR_PRIVATE_KEY),
  }),
  [CONSTANTS.ETHEREUM_CHAIN_ID]: createWalletClient({
    chain: mainnet,
    transport: http(),
    account: privateKeyToAccount(process.env.VALIDATOR_PRIVATE_KEY),
  }),
};

module.exports = { publicClientConfig, validatorClientConfig };
