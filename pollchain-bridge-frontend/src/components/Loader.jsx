import { useState, useEffect } from "react";
import { AppContext } from "../App";
import { useContext } from "react";

export default function Loader() {
  const { showLoader, setShowLoader } = useContext(AppContext);
  useEffect(() => {
    if (showLoader) {
      const timer = setTimeout(() => {
        if (showLoader.callback) {
          console.log("Executing callback function");
          showLoader.callback();
        }
        setShowLoader(null);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowLoader(null);
    }
  }, [showLoader]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
        role="status"
      ></div>
    </div>
  );
}
