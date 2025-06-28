const { parseEther, keccak256, encodeAbiParameters } = require("viem");
const { CONSTANTS } = require("../misc/constants");
const { publicClientConfig, validatorClientConfig } = require("../config/viem");

function generateDepositHash(
  userAddress,
  tokenAddress,
  amount,
  targetChainId,
  nonce,
  sourceChainId
) {
  return keccak256(
    encodeAbiParameters(
      [
        { type: "address" },
        { type: "address" },
        { type: "uint256" },
        { type: "uint256" },
        { type: "uint256" },
        { type: "uint256" },
      ],
      [
        userAddress,
        tokenAddress,
        parseEther(amount.toString()),
        BigInt(targetChainId),
        BigInt(nonce),
        BigInt(sourceChainId),
      ]
    )
  );
}

async function generateDepositData(
  userAddress,
  amount,
  targetChainId,
  deadlineMinutes = 60
) {
  try {
    const sourceChainId =
      targetChainId === CONSTANTS.BSC_CHAIN_ID
        ? CONSTANTS.ETHEREUM_CHAIN_ID
        : CONSTANTS.BSC_CHAIN_ID;

    const partnerChainPoolBalance = await getPartnerChainPoolBalance(
      targetChainId
    );

    console.log(
      `Partner Chain Pool Balance on Chain ${targetChainId}: ${partnerChainPoolBalance}`
    );
    if (partnerChainPoolBalance < parseEther(amount.toString())) {
      throw new Error(
        "Insufficient balance in partner chain pool for the transfer"
      );
    }

    const deadline = BigInt(
      Math.floor(Date.now() / 1000) + deadlineMinutes * 60
    );

    const depositMessage = {
      user: userAddress,
      token:
        sourceChainId === CONSTANTS.BSC_CHAIN_ID
          ? CONSTANTS.BSC_POLLCHAIN_ADDRESS
          : CONSTANTS.ETHEREUM_POLLCHAIN_ADDRESS,
      amount: parseEther(amount.toString()),
      targetChainId: BigInt(targetChainId),
      deadline: deadline,
    };

    const nonce = await publicClientConfig[sourceChainId].readContract({
      address:
        sourceChainId === CONSTANTS.ETHEREUM_CHAIN_ID
          ? CONSTANTS.ETHEREUM_BRIDGE_ADDRESS
          : CONSTANTS.BSC_BRIDGE_ADDRESS,
      abi: CONSTANTS.BRIDGE_ABI,
      functionName: "getDepositNonce",
      args: [userAddress],
    });

    const depositHash = generateDepositHash(
      depositMessage.user,
      depositMessage.token,
      amount,
      targetChainId,
      nonce,
      sourceChainId
    );

    const signature = await validatorClientConfig[
      sourceChainId === CONSTANTS.BSC_CHAIN_ID
        ? CONSTANTS.BSC_CHAIN_ID
        : CONSTANTS.ETHEREUM_CHAIN_ID
    ].signMessage({
      message: { raw: depositHash },
    });

    return {
      message: {
        ...depositMessage,
        amount: amount.toString(),
        nonce: nonce.toString(),
        targetChainId: targetChainId.toString(),
        deadline: deadline.toString(),
      },
      signature: signature,
      hash: depositHash,
    };
  } catch (error) {
    console.error("Error generating deposit message:", error);
    throw error;
  }
}

async function generateTransferData(
  userAddress,
  amount,
  nonce,
  sourceChainId,
  deadlineMinutes = 60
) {
  console.log(
    `Generating transfer data for user: ${userAddress}, amount: ${amount}, sourceChainId: ${sourceChainId}, nonce: ${nonce}, deadlineMinutes: ${deadlineMinutes}`
  );
  try {
    const targetChainId =
      sourceChainId === CONSTANTS.BSC_CHAIN_ID
        ? CONSTANTS.ETHEREUM_CHAIN_ID
        : CONSTANTS.BSC_CHAIN_ID;

    var depositHash = generateDepositHash(
      userAddress,
      sourceChainId === CONSTANTS.BSC_CHAIN_ID
        ? CONSTANTS.BSC_POLLCHAIN_ADDRESS
        : CONSTANTS.ETHEREUM_POLLCHAIN_ADDRESS,
      amount,
      targetChainId,
      nonce,
      sourceChainId
    );

    const hasDepositOnSource = await publicClientConfig[
      sourceChainId
    ].readContract({
      address:
        sourceChainId === CONSTANTS.ETHEREUM_CHAIN_ID
          ? CONSTANTS.ETHEREUM_BRIDGE_ADDRESS
          : CONSTANTS.BSC_BRIDGE_ADDRESS,
      abi: CONSTANTS.BRIDGE_ABI,
      functionName: "isDepositProcessed",
      args: [userAddress, depositHash],
    });

    const hasBeenClaimed = await publicClientConfig[targetChainId].readContract(
      {
        address:
          targetChainId === CONSTANTS.ETHEREUM_CHAIN_ID
            ? CONSTANTS.ETHEREUM_BRIDGE_ADDRESS
            : CONSTANTS.BSC_BRIDGE_ADDRESS,
        abi: CONSTANTS.BRIDGE_ABI,
        functionName: "isClaimProcessed",
        args: [userAddress, depositHash],
      }
    );

    if (hasBeenClaimed) {
      throw new Error("Tokens already claimed");
    }

    if (!hasDepositOnSource) {
      throw new Error("Deposit not found on source chain");
    }
    const deadline = BigInt(
      Math.floor(Date.now() / 1000) + deadlineMinutes * 60
    );
    const transferMessage = {
      recipient: userAddress,
      token:
        targetChainId === CONSTANTS.BSC_CHAIN_ID
          ? CONSTANTS.BSC_POLLCHAIN_ADDRESS
          : CONSTANTS.ETHEREUM_POLLCHAIN_ADDRESS,
      amount: parseEther(amount.toString()),
      sourceChainId: BigInt(sourceChainId),
      deadline: deadline,
      depositHash: depositHash,
    };
    const transferHash = keccak256(
      encodeAbiParameters(
        [
          { type: "address" },
          { type: "address" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "bytes32" },
          { type: "uint256" },
        ],
        [
          transferMessage.recipient,
          transferMessage.token,
          transferMessage.amount,
          transferMessage.sourceChainId,
          transferMessage.deadline,
          transferMessage.depositHash,
          BigInt(targetChainId),
        ]
      )
    );
    const signature = await validatorClientConfig[
      targetChainId === CONSTANTS.BSC_CHAIN_ID
        ? CONSTANTS.BSC_CHAIN_ID
        : CONSTANTS.ETHEREUM_CHAIN_ID
    ].signMessage({
      message: { raw: transferHash },
    });
    return {
      message: {
        ...transferMessage,
        amount: amount.toString(),
        sourceChainId: sourceChainId.toString(),
        deadline: deadline.toString(),
      },
      signature: signature,
      hash: transferHash,
    };
  } catch (error) {
    console.error("Error generating transfer data:", error);
    throw error;
  }
}

async function getPartnerChainPoolBalance(chainId) {
  try {
    const balance = await publicClientConfig[chainId].readContract({
      address:
        chainId === CONSTANTS.BSC_CHAIN_ID
          ? CONSTANTS.BSC_BRIDGE_ADDRESS
          : CONSTANTS.ETHEREUM_BRIDGE_ADDRESS,
      abi: CONSTANTS.BRIDGE_ABI,
      functionName: "getPoolBalance",
    });
    return balance;
  } catch (error) {
    console.error("Error fetching partner chain contract balance:", error);
    throw error;
  }
}

module.exports = {
  generateDepositData,
  generateTransferData,
};
