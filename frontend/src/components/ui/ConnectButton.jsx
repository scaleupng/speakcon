import { LogOut, Wallet } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ConnectButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const address = user?.wallet?.address;

  if (!ready) {
    return (
      <button type="button" disabled className="outline-gold-btn rounded-full px-4 py-2 text-sm opacity-60">
        <Wallet className="mr-2 inline-block h-4 w-4" /> Loading...
      </button>
    );
  }

  if (!authenticated) {
    return (
      <button type="button" onClick={login} className="gold-btn rounded-full px-4 py-2 text-sm inline-flex items-center gap-2">
        <Wallet className="h-4 w-4" /> Connect Wallet
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="rounded-full border border-amber-500/20 px-3 py-2 text-sm text-white">
        {shortenAddress(address || user?.id)}
      </span>
      <button type="button" onClick={logout} aria-label="Logout wallet" title="Logout wallet" className="outline-gold-btn rounded-full p-2">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}