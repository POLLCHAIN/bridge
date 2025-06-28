import { createAppKit } from "@reown/appkit/react";

import { WagmiProvider } from "wagmi";
import { bsc, mainnet } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

const queryClient = new QueryClient();

const projectId = "619b6445648a65c5c26803bbb255e28c";

const metadata = {
  name: "PollChain",
  description: "A decentralized bridge for pollchain",
  url: "https://bridge.pollchain.co",
  icons: ["https://bridge.pollchain.co/fav.png"],
};

const networks = [mainnet, bsc];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    connectMethodsOrder: ["wallet"],
  },
  defaultNetwork: bsc,
});

export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
