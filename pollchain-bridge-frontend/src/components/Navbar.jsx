import { useAppKit, useAppKitState, useDisconnect } from "@reown/appkit/react";
import { motion } from "motion/react";
import { useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useAccount } from "wagmi";
import { AppContext } from "../App";
export default function Navbar() {
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { open: isOpen } = useAppKitState();
  const { isConnected, isConnecting } = useAccount();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { pathname } = useLocation();
  const { setShowLoader } = useContext(AppContext);
  return (
    <nav className="relative w-full transition-all duration-300 py-2 backdrop-blur">
      <div className="w-full px-6 xl:px-20 flex justify-between items-center transition-all duration-300">
        <div
          onClick={() => {
            if (pathname === "/") return;
            setShowLoader({
              callback: () => {
                navigate("/");
              },
            });
          }}
          className="text-base cursor-pointer font-gamefont text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-cyan-500 tracking-widest"
        >
          POLLCHAIN
        </div>
        <div className="relative hidden md:flex text-sm text-white/50 bg-[#0a1c31]/40 backdrop-blur rounded-2xl md:mr-10 xl:mr-20">
          {/* Gradient Border Top */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-lg"
            style={{
              background:
                "linear-gradient(90deg, transparent 10%, #01466e 50%, transparent 90%)",
            }}
          ></div>
          <ul className="flex space-x-8 xl:space-x-20 px-10 md:px-20 xl:px-44 py-5">
            <li className="hover:text-white cursor-pointer">
              <h1
                className={`${
                  pathname === "/" ? "text-white" : "text-white/50"
                }`}
                onClick={() => {
                  if (pathname === "/") return;
                  setShowLoader({
                    callback: () => {
                      navigate("/");
                    },
                  });
                }}
              >
                Home
              </h1>
            </li>
            <li className="hover:text-white cursor-pointer">
              <h1
                className={`${
                  pathname === "/bridge" ? "text-white" : "text-white/50"
                }`}
                onClick={() => {
                  if (pathname === "/bridge") return;
                  setShowLoader({ callback: () => navigate("/bridge") });
                }}
              >
                Bridge
              </h1>
            </li>
            <li
              onClick={() =>
                window.open("https://coinmarketcap.com/currencies/pollchain/")
              }
              className="hover:text-white cursor-pointer"
            >
              Token Info
            </li>
            <li
              onClick={() => window.open("https://linktr.ee/Pollchain")}
              className="hover:text-white cursor-pointer"
            >
              Contact us
            </li>
          </ul>
          {/* Gradient Border Bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-lg"
            style={{
              background:
                "linear-gradient(90deg, transparent 10%, #01466e 50%, transparent 90%)",
            }}
          ></div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="text-center p-[1px] rounded-2xl"
          style={{
            background:
              "linear-gradient(160deg, rgba(100,116,139,0.3) 60%, rgb(6,182,212))",
          }}
          onClick={() => {
            open();
          }}
        >
          <span
            className="px-10 py-3 rounded-2xl flex justify-center items-center text-white"
            style={{
              background:
                "radial-gradient(circle 150px at 65% 150%, rgba(6,182,212,0.3), rgb(0,0,0) 40%)",
            }}
          >
            <p className="text-white">
              {(isOpen && !isConnected) || isConnecting
                ? "Connecting..."
                : isConnected === true
                ? address.slice(0, 6) + "..." + address.slice(-4)
                : "Connect"}
            </p>
          </span>
        </motion.button>
      </div>
    </nav>
  );
}
