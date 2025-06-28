import axios from "axios";

export async function getDepositData({
  userAddress,
  amount,
  targetChainId,
  deadlineMinutes,
}) {
  const response = await axios.get(
    import.meta.env.VITE_BACKEND_ENDPOINT + "/getDepositData",
    {
      params: {
        userAddress,
        amount,
        targetChainId,
        deadlineMinutes,
      },
    }
  );
  return response.data;
}

export async function getTransferData({
  userAddress,
  amount,
  sourceChainId,
  nonce,
  deadlineMinutes,
  depositHash,
}) {
  const response = await axios.get(
    import.meta.env.VITE_BACKEND_ENDPOINT + "/getTransferData",
    {
      params: {
        userAddress,
        amount,
        sourceChainId,
        deadlineMinutes,
        depositHash,
        nonce,
      },
    }
  );
  return response.data;
}
