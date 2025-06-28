import { motion } from "motion/react";
import { useState } from "react";
import { IoSwapVerticalSharp, IoChevronDown } from "react-icons/io5";
import { useNavigate } from "react-router";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { erc20Abi, formatEther, parseEther } from "viem";
import { CONSTANTS } from "../utils/constants";
import BridgeLoadingStages from "./BridgeProgress";
import { getDepositData, getTransferData } from "../api/api";
import { publicClientConfig } from "../utils/viem";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import { useContext } from "react";
import { AppContext } from "../App";

export default function BridgeWindow({ active = false }) {
  const { setShowLoader } = useContext(AppContext);
  const [currentStage, setCurrentStage] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fromNetwork, setFromNetwork] = useState("BSC");
  const [toNetwork, setToNetwork] = useState("Ethereum");
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const [valueFirstInput, setValueFirstInput] = useState(0);
  const [valueSecondInput, setValueSecondInput] = useState(0);
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isConnected && address && chainId) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [chainId]);

  const [bridgeData, setBridgeData] = useState({
    fromChain: fromNetwork,
    toChain: toNetwork,
    amount: valueFirstInput,
    tokenSymbol: "POLL",
  });

  const { data: bscPollAllowance, refetch: refetchBscAllowance } =
    useReadContract({
      address: CONSTANTS.BSC_POLLCHAIN_ADDRESS,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address, CONSTANTS.BSC_BRIDGE_ADDRESS],
      chainId: CONSTANTS.BSC_CHAIN_ID,
    });

  const { data: ethPollAllowance, refetch: refetchEthAllowance } =
    useReadContract({
      address: CONSTANTS.ETHEREUM_POLLCHAIN_ADDRESS,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address, CONSTANTS.ETHEREUM_BRIDGE_ADDRESS],
      chainId: CONSTANTS.ETH_CHAIN_ID,
    });

  const { data: bscPollBalance, refetch: refetchBscPollBalance } =
    useReadContract({
      address: CONSTANTS.BSC_POLLCHAIN_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
      chainId: CONSTANTS.BSC_CHAIN_ID,
    });

  const { data: ethPollBalance, refetch: refetchEthPollBalance } =
    useReadContract({
      address: CONSTANTS.ETHEREUM_POLLCHAIN_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
      chainId: CONSTANTS.ETHEREUM_CHAIN_ID,
    });

  const { data: bscPoolBalance } = useReadContract({
    address: CONSTANTS.BSC_POLLCHAIN_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [CONSTANTS.BSC_BRIDGE_ADDRESS],
    chainId: CONSTANTS.BSC_CHAIN_ID,
  });

  const { data: ethPoolBalance } = useReadContract({
    address: CONSTANTS.ETHEREUM_POLLCHAIN_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [CONSTANTS.ETHEREUM_BRIDGE_ADDRESS],
    chainId: CONSTANTS.ETHEREUM_CHAIN_ID,
  });

  const { data: bscExchangeRate } = useReadContract({
    address: CONSTANTS.BSC_BRIDGE_ADDRESS,
    abi: CONSTANTS.BRIDGE_ABI,
    functionName: "exchangeRate",
    chainId: CONSTANTS.BSC_CHAIN_ID,
  });

  const { data: ethExchangeRate } = useReadContract({
    address: CONSTANTS.ETHEREUM_BRIDGE_ADDRESS,
    abi: CONSTANTS.BRIDGE_ABI,
    functionName: "exchangeRate",
    chainId: CONSTANTS.ETHEREUM_CHAIN_ID,
  });

  function handleFirstInputChange(e) {
    const value = e.target.value;
    setValueFirstInput(value);
    if (parseFloat(value) < 0) {
      setValueFirstInput(0);
      return;
    }
    const val = value
      ? fromNetwork === "BSC"
        ? (parseFloat(value) / 5).toFixed(2)
        : (parseFloat(value) * 5).toFixed(2)
      : 0;
    setValueSecondInput(val);
    setBridgeData((prev) => {
      return {
        ...prev,
        amount: value,
      };
    });
  }

  function handleSecondInputChange(e) {
    const value = e.target.value;
    setValueSecondInput(value);
    const val = value
      ? fromNetwork === "BSC"
        ? (parseFloat(value) / 5).toFixed(2)
        : (parseFloat(value) * 5).toFixed(2)
      : 0;
    setValueFirstInput(val);
    setBridgeData((prev) => {
      return {
        ...prev,
        amount: val,
      };
    });
  }

  const networks = {
    BSC: {
      name: "BNB Chain",
      logo: "/images/hero-section/bnb-logo.webp",
      alt: "bnb-network-logo",
    },
    Ethereum: {
      name: "ETH Chain",
      logo: "/images/hero-section/ethereum-logo.png",
      alt: "ethereum-network-logo",
    },
  };

  const handleNetworkSelect = (network, type) => {
    if (!active) return;
    if (type === "from" && network !== fromNetwork) {
      setFromNetwork(network);
      setBridgeData((prev) => {
        return {
          ...prev,
          fromChain: network,
          toChain: prev.fromChain,
        };
      });
    } else if (type === "to" && network !== toNetwork) {
      setToNetwork(network);
      setBridgeData((prev) => {
        return {
          ...prev,
          fromChain: prev.toChain,
          toChain: network,
        };
      });
    }
    setToDropdownOpen(false);
    setFromDropdownOpen(false);
    setValueFirstInput(0);
    setValueSecondInput(0);
  };

  const resetLoadingState = async () => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsLoading(false);
  };

  const resetProgress = () => {
    setCurrentStage(0);
    setIsError(false);
    setIsLoading(false);
  };

  const handleBridging = async () => {
    resetProgress();
    setIsLoading(true);
    const sourceChainId =
      fromNetwork === "BSC"
        ? CONSTANTS.BSC_CHAIN_ID
        : CONSTANTS.ETHEREUM_CHAIN_ID;
    const targetChainId =
      toNetwork === "BSC"
        ? CONSTANTS.BSC_CHAIN_ID
        : CONSTANTS.ETHEREUM_CHAIN_ID;
    if (fromNetwork === "BSC" && chainId !== CONSTANTS.BSC_CHAIN_ID) {
      await switchChainAsync({
        chainId: CONSTANTS.BSC_CHAIN_ID,
      });
    } else if (
      fromNetwork === "Ethereum" &&
      chainId !== CONSTANTS.ETHEREUM_CHAIN_ID
    ) {
      await switchChainAsync({
        chainId: CONSTANTS.ETHEREUM_CHAIN_ID,
      });
    }
    if (window.localStorage.getItem(sourceChainId + "pendingBridge")) {
      toast.loading("Pending bridge transaction detected", { id: "bridge" });
      setCurrentStage(1);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCurrentStage(2);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      handleClaim(
        JSON.parse(window.localStorage.getItem(sourceChainId + "pendingBridge"))
      );
      return;
    }
    if (valueFirstInput <= 0) {
      toast.error("Please enter a valid amount to bridge", { id: "bridge" });
      setIsError(true);
      resetLoadingState();
      return;
    }
    toast.loading("Bridging in progress...", { id: "bridge" });
    try {
      const bridgeAddress =
        fromNetwork === "BSC"
          ? CONSTANTS.BSC_BRIDGE_ADDRESS
          : CONSTANTS.ETHEREUM_BRIDGE_ADDRESS;
      const allowance =
        fromNetwork === "BSC" ? bscPollAllowance : ethPollAllowance;
      const pollTokenAddress =
        fromNetwork === "BSC"
          ? CONSTANTS.BSC_POLLCHAIN_ADDRESS
          : CONSTANTS.ETHEREUM_POLLCHAIN_ADDRESS;
      const data = await getDepositData({
        userAddress: address,
        amount: valueFirstInput,
        targetChainId: targetChainId,
        deadlineMinutes: 60,
      });
      if (allowance < parseEther(data.message.amount.toString())) {
        var tx = await writeContractAsync({
          address: pollTokenAddress,
          abi: erc20Abi,
          functionName: "approve",
          args: [bridgeAddress, parseEther(data.message.amount.toString())],
          chainId: sourceChainId,
        });
        var receipt = await publicClientConfig[
          sourceChainId
        ].waitForTransactionReceipt({
          hash: tx,
        });
        if (receipt.status !== "success") {
          toast.error("Approval failed!", { id: "bridge" });
          setIsError(true);
          return;
        }
        toast.success("Approval successful", { id: "bridge" });
        if (fromNetwork === "BSC") {
          refetchBscAllowance();
        } else {
          refetchEthAllowance();
        }
        setCurrentStage(1);
      } else {
        setCurrentStage(1);
      }
      console.log("Bridging data:", data);
      var depositTx = await writeContractAsync({
        address: bridgeAddress,
        abi: CONSTANTS.BRIDGE_ABI,
        functionName: "processDeposit",
        args: [
          Object.values({
            ...data.message,
            amount: parseEther(data.message.amount.toString()),
          }),
          data.signature,
        ],
        chainId: sourceChainId,
      });
      var depositReceipt = await publicClientConfig[
        sourceChainId
      ].waitForTransactionReceipt({
        hash: depositTx,
      });
      if (fromNetwork === "BSC") {
        refetchBscPollBalance();
      } else {
        refetchEthPollBalance();
      }
      if (depositReceipt.status !== "success") {
        toast.error("Deposit failed", { id: "bridge" });
        setIsError(true);
        resetLoadingState();
        return;
      }
      var depositData = JSON.stringify({
        amount: data.message.amount,
        hash: data.hash,
        nonce: data.message.nonce,
      });
      window.localStorage.setItem(sourceChainId + "pendingBridge", depositData);
      toast.success("Deposit successful", { id: "bridge" });
      setCurrentStage(2);
      handleClaim();
    } catch (error) {
      toast.error("Error during bridging", { id: "bridge" });
      setIsError(true);
      resetLoadingState();
      console.error(error);
    }
  };

  const handleClaim = async () => {
    const sourceChainId =
      fromNetwork === "BSC"
        ? CONSTANTS.BSC_CHAIN_ID
        : CONSTANTS.ETHEREUM_CHAIN_ID;
    var depositData = JSON.parse(
      window.localStorage.getItem(sourceChainId + "pendingBridge")
    );
    if (fromNetwork === "BSC" && chainId !== CONSTANTS.ETHEREUM_CHAIN_ID) {
      await switchChainAsync({
        chainId: CONSTANTS.ETHEREUM_CHAIN_ID,
      });
    } else if (
      fromNetwork === "Ethereum" &&
      chainId !== CONSTANTS.BSC_CHAIN_ID
    ) {
      await switchChainAsync({
        chainId: CONSTANTS.BSC_CHAIN_ID,
      });
    }
    try {
      const targetChainId =
        toNetwork === "BSC"
          ? CONSTANTS.BSC_CHAIN_ID
          : CONSTANTS.ETHEREUM_CHAIN_ID;
      const data = await getTransferData({
        userAddress: address,
        amount: depositData.amount,
        nonce: depositData.nonce,
        sourceChainId: sourceChainId,
        deadlineMinutes: 60,
      });
      var transferTx = await writeContractAsync({
        address:
          toNetwork === "BSC"
            ? CONSTANTS.BSC_BRIDGE_ADDRESS
            : CONSTANTS.ETHEREUM_BRIDGE_ADDRESS,
        abi: CONSTANTS.BRIDGE_ABI,
        functionName: "processClaim",
        args: [
          Object.values({
            ...data.message,
            amount: parseEther(data.message.amount.toString()),
          }),
          data.signature,
        ],
        chainId: targetChainId,
      });
      var transferReceipt = await publicClientConfig[
        targetChainId
      ].waitForTransactionReceipt({
        hash: transferTx,
      });
      if (transferReceipt.status !== "success") {
        toast.error("Transfer failed", { id: "bridge" });
        setIsError(true);
        resetLoadingState();
        return;
      }
      if (toNetwork === "BSC") {
        refetchBscPollBalance();
      } else {
        refetchEthPollBalance();
      }
      window.localStorage.removeItem(sourceChainId + "pendingBridge");
      toast.success("Transfer successful", { id: "bridge" });
      setCurrentStage(3);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      resetLoadingState();
      let errorMsg = "Error during claim";
      if (error?.response?.data) {
        const errData = error.response.data.toLowerCase();
        if (errData.includes("deposit not found")) {
          window.localStorage.removeItem(sourceChainId + "pendingBridge");
          errorMsg = "Deposit not found, please try again.";
        } else if (errData.includes("already claimed")) {
          window.localStorage.removeItem(sourceChainId + "pendingBridge");
          errorMsg = "This deposit has already been claimed.";
        } else {
          errorMsg = error.response.data;
        }
      }
      toast.error(errorMsg, { id: "bridge" });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-[#0f1a28]/20 backdrop-blur w-full p-4 sm:p-6 md:p-8 max-w-[350px] sm:max-w-[400px] md:max-w-lg rounded-[0.6rem] overflow-hidden mx-auto"
      >
        {/* SVG Border Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none rounded-[0.5rem] overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="leftGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="10%" stopColor="transparent" />
                <stop offset="30%" stopColor="#3972a8" />
                <stop offset="70%" stopColor="#3972a8" />
                <stop offset="90%" stopColor="transparent" />
              </linearGradient>
              <linearGradient
                id="topRightGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="2%" stopColor="transparent" />
                <stop offset="20%" stopColor="#3972a8" />
                <stop offset="90%" stopColor="#3972a8" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            <rect
              x="0"
              y="0"
              width="0.5"
              height="100"
              fill="url(#leftGradient)"
              rx="1"
            />

            <path
              d="M 20 0 L 98 0 Q 100 0 100 2 L 100 80"
              fill="none"
              stroke="url(#topRightGradient)"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Header */}
        <div className="relative z-10">
          <div className="text-center mb-4 md:mb-5">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Pollchain Bridge
            </h3>
            <p className="text-white/60 text-xs sm:text-sm">
              Transfer POLL Token Between networks
            </p>
          </div>
          <div className="w-full flex justify-center items-center rounded-full mb-4 md:mb-5">
            <div className="w-40 sm:w-52 h-1 border-t-2 rounded-full border-white/5"></div>
          </div>

          {/* From Section */}
          <div className="mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-4 mb-2">
              <h3 className="text-white/70 text-sm">From</h3>
              <div className="relative w-full sm:w-auto">
                <div
                  className={`bg-[#0f1a28]/60 rounded-xl px-3 py-2 border border-white/10 text-sm transition-colors w-full sm:w-auto ${
                    active
                      ? "cursor-pointer hover:border-white/20"
                      : "cursor-not-allowed opacity-60"
                  }`}
                  onClick={() =>
                    active && setFromDropdownOpen(!fromDropdownOpen)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <img
                      className="w-6 sm:w-7"
                      src={networks[fromNetwork].logo}
                      alt={networks[fromNetwork].alt}
                    />
                    <span className="text-white font-medium text-sm sm:text-base">
                      {networks[fromNetwork].name}
                    </span>
                    <IoChevronDown
                      className={`text-white/60 transition-transform ml-auto ${
                        fromDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* From Dropdown */}
                {fromDropdownOpen && active && (
                  <div className="absolute top-full mt-1 w-full bg-[#0f1a28] border border-white/20 rounded-xl overflow-hidden z-10">
                    {Object.entries(networks).map(([key, network]) => (
                      <div
                        key={key}
                        className="px-3 py-2 hover:bg-white/10 cursor-pointer transition-colors flex items-center space-x-2"
                        onClick={() => handleNetworkSelect(key, "from")}
                      >
                        <img
                          className="w-7"
                          src={network.logo}
                          alt={network.alt}
                        />
                        <span className="text-white font-medium">
                          {network.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Send Amount */}
            <div className="bg-[#0f1a28]/60 rounded-xl p-3 sm:p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-sm">Send</span>
                <span
                  className={`underline underline-offset-2 text-xs sm:text-sm font-medium ${
                    active
                      ? "text-cyan-500 cursor-pointer hover:text-cyan-600"
                      : "text-white/40 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (!active) return;
                    if (fromNetwork === "BSC") {
                      handleFirstInputChange({
                        target: { value: formatEther(bscPollBalance ?? 0n) },
                      });
                    } else {
                      handleFirstInputChange({
                        target: { value: formatEther(ethPollBalance ?? 0n) },
                      });
                    }
                  }}
                >
                  MAX:{" "}
                  {fromNetwork === "BSC"
                    ? formatEther(bscPollBalance ?? 0n)
                    : formatEther(ethPollBalance ?? 0n)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <input
                  onChange={handleFirstInputChange}
                  value={valueFirstInput}
                  type="number"
                  className={`bg-transparent text-white text-xl sm:text-2xl font-bold outline-none placeholder-white/40 w-full sm:flex-1 ${
                    !active ? "cursor-not-allowed" : ""
                  }`}
                  placeholder="0.00"
                  disabled={!active}
                />
                <span className="text-white/60 text-xs sm:text-sm sm:ml-2">
                  Poll Token ( {fromNetwork === "BSC" ? "BEP20" : "ERC20"} )
                </span>
              </div>
            </div>

            {/* Balance */}
            <div className="mt-2 text-left">
              <span className="text-white/50 text-xs sm:text-sm">
                Balance:{" "}
                {isConnected
                  ? fromNetwork === "BSC"
                    ? formatEther(bscPollBalance ?? 0n)
                    : formatEther(ethPollBalance ?? 0n)
                  : "..."}{" "}
                tokens ( {fromNetwork === "BSC" ? "BEP20" : "ERC20"} )
              </span>
            </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center my-4">
            <div
              className={`p-2 bg-[#0f1a28] border border-white/20 rounded-full flex items-center justify-center ${
                active
                  ? "cursor-pointer hover:bg-[#0f1a28]/80"
                  : "cursor-not-allowed opacity-60"
              }`}
            >
              <IoSwapVerticalSharp
                onClick={() => {
                  setFromNetwork(toNetwork);
                  setToNetwork(fromNetwork);
                }}
                className="text-white/60 text-xl"
              />
            </div>
          </div>

          {/* To Section */}
          <div className="mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-7 mb-2">
              <h3 className="text-white/70 text-sm">To</h3>
              <div className="relative w-full sm:w-auto">
                <div
                  className={`bg-[#0f1a28]/60 rounded-xl px-3 py-2 border border-white/10 text-sm transition-colors w-full sm:w-auto ${
                    active
                      ? "cursor-pointer hover:border-white/20"
                      : "cursor-not-allowed opacity-60"
                  }`}
                  onClick={() => active && setToDropdownOpen(!toDropdownOpen)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      className="w-6 sm:w-7"
                      src={networks[toNetwork].logo}
                      alt={networks[toNetwork].alt}
                    />
                    <span className="text-white font-medium text-sm sm:text-base">
                      {networks[toNetwork].name}
                    </span>
                    <IoChevronDown
                      className={`text-white/60 transition-transform ml-auto ${
                        toDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* To Dropdown */}
                {toDropdownOpen && active && (
                  <div className="absolute top-full mt-1 w-full bg-[#0f1a28] border border-white/20 rounded-xl overflow-hidden z-10">
                    {Object.entries(networks).map(([key, network]) => (
                      <div
                        key={key}
                        className="px-3 py-2 hover:bg-white/10 cursor-pointer transition-colors flex items-center space-x-3"
                        onClick={() => handleNetworkSelect(key, "to")}
                      >
                        <img
                          className="w-7"
                          src={network.logo}
                          alt={network.alt}
                        />
                        <span className="text-white font-medium">
                          {network.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Receive Amount */}
            <div className="bg-[#0f1a28]/60 rounded-xl p-3 sm:p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-sm">
                  Receive ( Estimation )
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <input
                  onChange={handleSecondInputChange}
                  value={valueSecondInput}
                  type="number"
                  className={`bg-transparent text-white text-xl sm:text-2xl font-bold outline-none placeholder-white/40 w-full sm:flex-1 ${
                    !active ? "cursor-not-allowed" : ""
                  }`}
                  placeholder="0.00"
                  disabled={!active}
                />
                <span className="text-white/60 text-xs sm:text-sm sm:ml-2">
                  Poll Token ( {toNetwork === "BSC" ? "BEP20" : "ERC20"} )
                </span>
              </div>
            </div>

            <div className="mt-2 text-left">
              <span className="text-white/50 text-xs sm:text-sm">
                Balance:{" "}
                {isConnected
                  ? fromNetwork === "BSC"
                    ? formatEther(ethPollBalance ?? 0n)
                    : formatEther(bscPollBalance ?? 0n)
                  : "..."}{" "}
                tokens ( {fromNetwork === "BSC" ? "ERC20" : "BEP20"} )
              </span>
            </div>

            {/* Exchange Rate */}
            <div className="mt-2 text-left">
              <span className="text-white/50 text-xs sm:text-sm">
                Exchange Rate:{" "}
                {parseFloat(formatEther(ethExchangeRate ?? 0n)) *
                  parseFloat(formatEther(bscExchangeRate ?? 0n))}{" "}
                ERC20 = {formatEther(bscExchangeRate ?? 0n)} BEP20
              </span>
            </div>
          </div>

          {/* Bridge Button */}
          {!isLoading && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 10 }}
              disabled={active && !ready}
              className={`w-full font-bold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 text-sm sm:text-base 
              bg-gradient-to-r from-cyan-600 to-blue-600 text-white transform hover:scale-[1.02] shadow-lg
             mb-4`}
              onClick={() => {
                if (!active) {
                  setShowLoader({
                    callback: () => navigate("/bridge"),
                  });
                } else {
                  handleBridging();
                }
              }}
            >
              {active ? "Bridge Token" : "Launch App"}
            </motion.button>
          )}
          <motion.div
            initial={{ opacity: 1, y: 10 }}
            animate={isLoading ? { opacity: 1, y: 0 } : { opacity: 1, y: 10 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            {active && (
              <BridgeLoadingStages
                currentStage={currentStage}
                isLoading={isLoading}
                isError={isError}
                bridgeData={bridgeData}
              />
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Bridge Information Section */}
      {active && (
        <div className="rounded-xl p-4 sm:p-6 max-w-[350px] sm:max-w-[400px] md:max-w-lg mx-auto">
          <h4 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4 text-center">
            Bridge Information.
          </h4>
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="text-white/70">
              Bridge Liquidity ( Poll Token - ERC20 ):{" "}
              <span className="text-white">
                {formatEther(ethPoolBalance ?? 0n)}
              </span>
            </div>
            <div className="text-white/70">
              Bridge Liquidity ( Poll Token - BEP20 ):{" "}
              <span className="text-white">
                {formatEther(bscPoolBalance ?? 0n)}
              </span>
            </div>
            {/* <div className="text-yellow-400 font-medium mt-3 sm:mt-4">
              Important:{" "}
              <span className="text-yellow-400">
                Single transaction limit per every 4 hours:
              </span>
            </div>
            <div className="text-yellow-400">
              <span className="text-yellow-400 font-medium">
                1,000,000 tokens.
              </span>
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}
