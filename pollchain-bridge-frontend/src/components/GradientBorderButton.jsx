import { motion } from "motion/react";

const GradientBorderButton = ({ children, enableHoverScale, isActive = false, onClick, direction = "horizontal" }) => {
  return (
    <motion.div
      className="relative"
      whileHover={enableHoverScale ? { scale: 1.02 } : { scale: 1 }}
    >
      <button
        onClick={onClick}
        className={`
          relative w-full px-6 py-4 #040d18
          text-white text-left flex items-center gap-4 
          transition-all duration-200 rounded-lg
          ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
      >
        {/* Gradient Border either Top or Left */}
        {
          direction !== "horizontal" ? (
            <div
              className="absolute left-0 top-0 bottom-0 w-[2px] rounded-l-lg"
              style={{
                background: 'linear-gradient(180deg, transparent 10%, #022536 50%, transparent 90%)'
              }}
            >
            </div>
          ) : (
            <div
              className="absolute top-0 left-0 right-0 h-[2px] rounded-t-lg"
              style={{
                background: 'linear-gradient(90deg, transparent 10%, #022536 50%, transparent 90%)'
              }}
            >
            </div>
          )
        }

        {/* Gradient Border either Bottom or Right */}
        {
          direction !== "horizontal" ? (
            <div
              className="absolute right-0 top-0 bottom-0 w-[2px] rounded-r-lg"
              style={{
                background: 'linear-gradient(180deg, transparent 10%, #022536 50%, transparent 90%)'
              }}
            >
            </div>
          ) : (
            <div
              className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-lg"
              style={{
                background: 'linear-gradient(90deg, transparent 10%, #022536 50%, transparent 90%)'
              }}
            >
            </div>
          )
        }
        {children}
      </button>
    </motion.div >
  );
};

export default GradientBorderButton;