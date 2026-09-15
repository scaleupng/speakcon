import { createContext, useContext } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { bsc, bscTestnet } from "viem/chains";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const appId = process.env.REACT_APP_PRIVY_APP_ID;

  if (!appId) {
    console.warn("REACT_APP_PRIVY_APP_ID is not configured; wallet authentication is unavailable.");
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        supportedChains: [bsc, bscTestnet],
        defaultChain: bscTestnet,
      }}
    >
      <WalletContext.Provider value={{ chains: [bsc, bscTestnet] }}>
        {children}
      </WalletContext.Provider>
    </PrivyProvider>
  );
}

export function useWalletConfig() {
  return useContext(WalletContext);
}