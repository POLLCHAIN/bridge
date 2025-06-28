import { BrowserRouter, Route, Routes } from "react-router";
import MainPage from "./layout/MainPage";
import { AppKitProvider } from "./providers/AppkitProvider";
import Bridge from "./layout/Bridge";
import Loader from "./components/Loader";
import { createContext } from "react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export const AppContext = createContext();

function App() {
  const [appState, setAppState] = useState({
    showLoader: null,
    setShowLoader: (show) =>
      setAppState((prev) => ({ ...prev, showLoader: show })),
  });
  return (
    <BrowserRouter>
      <AppContext.Provider value={appState}>
        <Toaster />
        <AppKitProvider>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/bridge" element={<Bridge />} />
          </Routes>
          <Loader />
        </AppKitProvider>
      </AppContext.Provider>
    </BrowserRouter>
  );
}

export default App;
