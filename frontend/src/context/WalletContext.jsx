import { createContext, useContext, useEffect } from "react";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { bsc, bscTestnet } from "viem/chains";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const WalletContext = createContext(null);

function WalletSync() {
  const { ready, authenticated, user: privyUser } = usePrivy();
  const { user, refresh } = useAuth();

  useEffect(() => {
    if (!ready || !authenticated || !user || !privyUser?.wallet?.address) {
      return;
    }

    const walletAddress = privyUser.wallet.address;
    const syncWalletAddress = async () => {
      try {
        const existing = user?.walletAddress?.toLowerCase();
        if (existing === walletAddress.toLowerCase()) {
          return;
        }

        await api.post("/wallet-address", { walletAddress });
        await refresh();
      } catch (error) {
        console.warn("Wallet sync failed:", error);
      }
    };

    syncWalletAddress();
  }, [ready, authenticated, user, privyUser?.wallet?.address, refresh]);

  return null;
}

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
        defaultChain: bsc,
      }}
    >
      <WalletSync />
      <WalletContext.Provider value={{ chains: [bsc, bscTestnet] }}>
        {children}
      </WalletContext.Provider>
    </PrivyProvider>
  );
}

export function useWalletConfig() {
  return useContext(WalletContext);
}