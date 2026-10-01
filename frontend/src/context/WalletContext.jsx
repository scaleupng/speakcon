import { createContext, useContext, useEffect } from "react";
import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import { bsc, bscTestnet } from "viem/chains";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const WalletContext = createContext(null);

function WalletSync() {
  const { ready, authenticated, user: privyUser } = usePrivy();
  const { wallets } = useWallets();
  const { user, refresh } = useAuth();
  const walletAddress = privyUser?.wallet?.address || wallets?.find((wallet) => wallet.walletClientType === "privy")?.address || wallets?.[0]?.address;

  useEffect(() => {
    if (!ready || !authenticated || !user || !walletAddress) {
      return;
    }

    const syncWalletAddress = async () => {
      try {
        const existing = user?.walletAddress?.toLowerCase();
        if (existing === walletAddress.toLowerCase()) {
          return;
        }

        const treasuryAddress = process.env.REACT_APP_TREASURY_PUBLIC_ADDRESS || "";
        if (treasuryAddress && walletAddress.toLowerCase() === treasuryAddress.toLowerCase()) {
          return;
        }

        await api.post("/wallet-address", { walletAddress });
        await refresh();
      } catch (error) {
        console.warn("Wallet sync failed:", error);
      }
    };

    syncWalletAddress();
  }, [ready, authenticated, user, walletAddress, refresh]);

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
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
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