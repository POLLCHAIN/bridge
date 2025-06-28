import { XCircle } from "lucide-react";
import { CheckCircle, Circle, Loader2 } from "lucide-react";
import { motion } from "motion/react";

const BridgeLoadingStages = ({
  currentStage,
  isLoading,
  isError,
  bridgeData,
}) => {
  const stages = [
    { id: "approval", label: "Approval", description: "Approving token spend" },
    {
      id: "deposit",
      label: "Deposit",
      description: "Depositing to bridge contract",
    },
    {
      id: "claim",
      label: "Claim",
      description: "Claiming on destination chain",
    },
  ];

  const getStageStatus = (index) => {
    if (index === currentStage && isError) return "error";
    if (index < currentStage) return "completed";
    if (index === currentStage && isLoading) return "loading";
    if (
      index === currentStage &&
      !isLoading &&
      currentStage === stages.length - 1
    )
      return "completed";
    return "pending";
  };

  const StageIcon = ({ status }) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "loading":
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case "error":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Circle className="w-6 h-6 text-gray-300" />;
    }
  };

  return (
    <motion.div className="max-w-[350px] sm:max-w-[400px] md:max-w-lg mx-auto py-8 px-4 bg-[#0f1a28]/20 backdrop-blur rounded-[0.6rem] shadow-lg">
      <div className="mb-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Bridge Transaction
        </h2>
        <p className="text-white/60 text-xs sm:text-sm">
          Track your cross-chain transaction progress
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-around mb-4 px-8">
          {stages.map((stage, index) => {
            const status = getStageStatus(index);
            return (
              <div
                key={stage.id}
                className={`flex flex-col items-center ${
                  index === (stages.length - 1) / 2 ? "" : "flex-1"
                }`}
              >
                <div className="flex items-center justify-center w-full">
                  {/* Stage Circle */}
                  {index === stages.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                        index === currentStage ? "bg-cyan-500" : "bg-white/10"
                      }`}
                    />
                  )}
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                      status === "completed"
                        ? "bg-green-500/10 border-green-500"
                        : status === "loading"
                        ? "bg-cyan-500/10 border-cyan-500"
                        : status === "error"
                        ? "bg-red-500/10 border-red-500"
                        : "bg-[#0f1a28]/60 border-white/10"
                    }`}
                  >
                    <StageIcon status={status} />
                  </div>
                  {/* Connecting Line */}
                  {index === 0 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                        index < currentStage ? "bg-cyan-500" : "bg-white/10"
                      }`}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage Labels */}
        <div className="flex gap-8">
          {stages.map((stage, index) => {
            const status = getStageStatus(index);
            return (
              <div
                key={`${stage.id}-label`}
                className="flex flex-col items-center flex-1 px-2"
              >
                <span
                  className={`font-medium text-xs mb-1 transition-colors duration-300 ${
                    status === "completed" || status === "loading"
                      ? "text-white"
                      : "text-white/40"
                  }`}
                >
                  {stage.label}
                </span>
                <span
                  className={`text-[10px] text-center transition-colors duration-300 ${
                    status === "completed" || status === "loading"
                      ? "text-white/60"
                      : "text-white/30"
                  }`}
                >
                  {stage.description}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Stage Info */}
      {isLoading && !isError && (
        <div className="mb-6 p-4 mx-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="font-medium text-cyan-200">
                Processing {stages[currentStage].label}
              </p>
              <p className="text-xs text-cyan-300">
                {stages[currentStage].description}...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {!isLoading && !isError && currentStage === stages.length - 1 && (
        <div className="mb-6 p-4 mx-2 bg-green-500/10 rounded-lg border border-green-500/30">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="font-medium text-green-200">Bridge Complete!</p>
              <p className="text-xs text-green-300">
                Your tokens have been successfully bridged!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {isError && (
        <div className="mb-6 p-4 mx-2 bg-red-500/10 rounded-lg border border-red-500/30">
          <div className="flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <div className="flex flex-col items-center justify-center flex-1">
              <p className="font-medium text-red-200">Bridge Failed</p>
              <p className="text-xs text-red-300">
                An error occurred while processing your transaction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details */}
      <div className="mt-6 p-4 bg-[#0f1a28]/60 rounded-lg mx-2 border border-white/10">
        <h3 className="font-medium text-white mb-2 text-sm">
          Transaction Details
        </h3>
        <div className="space-y-1 text-xs text-white/60">
          <div className="flex justify-between">
            <span>From:</span>
            <span>{bridgeData?.fromChain || "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>To:</span>
            <span>{bridgeData?.toChain || "..."}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span>
              {bridgeData?.amount
                ? `${bridgeData?.amount} ${bridgeData?.tokenSymbol}`
                : "..."}
            </span>
          </div>
          {/*TODO*/}
          {/* <div className="flex justify-between">
            <span>Estimated Time:</span>
            <span>~7 minutes</span>
          </div> */}
        </div>
      </div>
    </motion.div>
  );
};

export default BridgeLoadingStages;
