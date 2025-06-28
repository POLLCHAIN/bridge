import GradientBorderButton from "../../components/GradientBorderButton";

import { IoLinkOutline } from "react-icons/io5";
import { IoMdSwap } from "react-icons/io";
import { RiStackLine } from "react-icons/ri";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { AiOutlinePercentage } from "react-icons/ai";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { AppContext } from "../../App";

const HowItWorks = () => {
  const navigate = useNavigate();
  const { setShowLoader } = useContext(AppContext);
  return (
    <section className="py-20 px-4 sm:bg-[url('/images/how-it-works-section/bg.png')] bg-none bg-no-repeat bg-cover">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 items-center">
        <div className="w-full text-left pl-5">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-gray-100 from-5% via-cyan-500 via-30% to-cyan-500 to-70%">
            How it Works?
          </h2>
          <p className="text-white/60 pr-2">
            Our token Bridge is Designed for effortless cross - chain transfers.
            Just follow these simple steps to get started with lightning-fast
            asset swaps.
          </p>
          <button
            onClick={() =>
              setShowLoader({ callback: () => navigate("/bridge") })
            }
            className="mt-8 bg-blue-500 hover:bg-blue-600 px-7 py-2 rounded-lg text-white font-semibold transition"
          >
            Try Now
          </button>
        </div>

        <div className="w-full space-y-2 border-t pt-10 md:border-l md:border-t-0 md:pt-0 border-[#1a1f26]">
          {[
            {
              icon: <IoLinkOutline className="text-[#00bbf9] text-2xl" />,
              text: "Connect Your Wallet",
            },
            {
              icon: <IoMdSwap className="text-[#00bbf9] text-2xl" />,
              text: "Choose Your Swap Direction",
            },
            {
              icon: <RiStackLine className="text-[#00bbf9] text-2xl" />,
              text: "Enter Amount & Review",
            },
            {
              icon: (
                <IoMdCheckmarkCircleOutline className="text-[#00bbf9] text-2xl" />
              ),
              text: "Approve & Deposit",
            },
            {
              icon: <AiOutlinePercentage className="text-[#00bbf9] text-2xl" />,
              text: "Receive Your Tokens",
            },
          ].map((step, idx) => (
            <GradientBorderButton
              key={idx}
              enableHoverScale={true}
              isActive={true} // You can add state logic here if needed
              onClick={() => {
                // Add any click handler logic here
                console.log(`Step ${idx + 1} clicked: ${step}`);
              }}
              direction="horizontal"
            >
              <div className="w-full flex justify-center py-2 space-x-5 pl-5 lg:pl-28">
                {/* <img
                    src={`/images/how-it-works-section/step-${idx + 1}.png`}
                    alt={step}
                  /> */}
                {/* <div className="text-blue-400 text-4xl mb-6 flex justify-center">
                    {icon}
                  </div> */}
                {/* <h3 className="text-2xl font-bold text-white mb-4">
                    {title}
                  </h3> */}
                {/* <IoLinkOutline className='text-[#00bbf9] text-2xl' /> */}
                {step.icon}
                <p className="text-white flex flex-grow justify-center pr-5 lg:pr-24">
                  {step.text}
                </p>
              </div>
            </GradientBorderButton>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
