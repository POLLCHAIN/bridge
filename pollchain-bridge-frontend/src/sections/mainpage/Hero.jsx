import { useState } from "react";
import { motion } from "motion/react";
import Navbar from "../../components/Navbar";
import BridgeWindow from "../../components/BridgeWindow";

const Hero = () => {
  const [fromNetwork, setFromNetwork] = useState("bnb");
  const [toNetwork, setToNetwork] = useState("ethereum");


  return (
    <section className="flex flex-col text-center bg-[url('/images/hero-section/bg.png')] bg-no-repeat bg-cover bg-bottom">
      {/* Navbar */}
      <Navbar />
      {/* Hero Section */}
      <div className="w-full flex flex-col justify-center items-center mt-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold"
        >
          Instant Bridge. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 from-60% to-cyan-500 pr-px">
            Seamless Flow
          </span>.
        </motion.h1>
        <p className="my-7 text-white/70 text-sm md:text-base max-w-xl mx-auto">
          Experience lightning-fast transfers for your ERC20 and BEP20 tokens. Unlock the true potential of your assets with rapid, fixed-rate swaps.
        </p>
        
        <BridgeWindow />

        <div className="w-full flex flex-col md:flex-row md:justify-evenly items-center mt-10 text-white/80 bg-[#030B17]/30 backdrop-blur-sm text-sm py-7">
          <div className="flex-grow flex flex-col justify-center items-center space-y-0 mb-5 md:mb-0 md:space-y-2">
            <h3>Total Trading Volume</h3>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-cyan-500">
              $37.2M Traded
            </p>
          </div>

          {/* Vertical divider for desktop, horizontal for mobile */}
          <div className="hidden md:block w-[2px] h-6 bg-slate-700/50"></div>
          {/* <div className='block md:hidden w-44 h-[2px] bg-slate-700/50 my-2'></div> */}

          <div className="flex-grow flex flex-col justify-center items-center space-y-0 mb-5 md:mb-0 md:space-y-2">
            <h3>Total Users</h3>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-cyan-500">
              6M+ Users
            </p>
          </div>

          {/* Vertical divider for desktop, horizontal for mobile */}
          <div className="hidden md:block w-[2px] h-6 bg-slate-700/50"></div>
          {/* <div className='block md:hidden w-44 h-[2px] bg-slate-700/50 my-2'></div> */}

          <div className="flex-grow flex flex-col justify-center items-center space-y-0 md:space-y-2">
            <h3>Total Trx</h3>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-cyan-500">
              1.4M+ Trade
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
