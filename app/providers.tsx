"use client";
import { ReactNode, useState } from "react";
import { base, baseSepolia } from "wagmi/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { MiniAppProvider } from "./providers/MiniAppProvider";

// Configure both chains - Base mainnet first (primary for transactions)
const config = createConfig({
  chains: [base, baseSepolia],
  transports: { 
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors: [farcasterMiniApp()],
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <MiniAppProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </MiniAppProvider>
  );
}
