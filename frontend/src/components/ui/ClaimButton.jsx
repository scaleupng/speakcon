import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ClaimButton() {
  const { authenticated, user: privyUser, login } = usePrivy();
  const { wallets } = useWallets();
  const { refresh } = useAuth();
  const [status, setStatus] = useState({ isClaimingActive: false, pendingSpeakBalance: 0, rewardClaimStatus: "pending" });
  const [loading, setLoading] = useState(false);

  const loadStatus = async () => {
    try {
      const { data } = await api.get("/claim-status");
      setStatus(data);
    } catch {}
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const claim = async () => {
    if (!authenticated) {
      login();
      return;
    }

    const walletAddress = privyUser?.wallet?.address || wallets?.[0]?.address;
    if (!walletAddress) {
      toast.error("Connect a wallet before claiming your SPEAK COIN.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/claim-rewards", { walletAddress });
      await refresh();
      await loadStatus();
      confetti({ particleCount: 140, spread: 75, origin: { y: 0.65 } });
      toast.success("Transaction sent. Processing... check back in a moment.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const claimed = status.rewardClaimStatus === "claimed" || status.pendingSpeakBalance <= 0;
  const processing = status.rewardClaimStatus === "processing";
  const disabled = loading || processing || claimed;

  return (
    <button
      type="button"
      onClick={claim}
      disabled={disabled}
      data-testid="claim-rewards-btn"
      className="gold-btn min-h-12 rounded-full px-6 py-3 text-sm inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
      {claimed ? "CLAIMED TO WALLET" : processing ? "Processing... check back in a moment" : status.isClaimingActive ? "CLAIM YOUR COINS" : "Rewards Stationed (Claiming opens soon)"}
    </button>
  );
}
