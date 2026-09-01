import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Coins, ShieldCheck, Copy, Users, Gift, TrendingUp, User, Clock, Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    refresh();
    api.get("/my-ledger").then(({ data }) => setLedger(data)).catch(() => {});
    // eslint-disable-next-line
  }, []);

  if (!user) return null;

  const referralLink = `${window.location.origin}/register?ref=${user.ownReferralCode}`;

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
      {/* header */}
      <div className="fade-up">
        <span className="text-xs uppercase tracking-[0.3em] text-[#E6B800]">Attendee Dashboard</span>
        <h1 className="mt-2 font-heading font-extrabold text-3xl sm:text-4xl text-white">
          Welcome, {user.firstName} 👋
        </h1>
      </div>

      {/* top cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {/* coin balance */}
        <div className="glass rounded-2xl p-7 radial-gold md:col-span-1" data-testid="dashboard-coin-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">SPEAK COIN Balance</span>
            <Coins className="h-6 w-6 text-[#E6B800]" />
          </div>
          <div className="mt-4 font-heading font-extrabold text-5xl gold-text-gradient" data-testid="dashboard-coin-balance">
            {user.speakCoinBalance}
          </div>
          <p className="mt-2 text-xs text-gray-500">COIN earned so far</p>
        </div>

        {/* profile */}
        <div className="card-tactical rounded-2xl p-7 md:col-span-2" data-testid="dashboard-profile-card">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="grid place-items-center h-14 w-14 rounded-full bg-gradient-to-b from-[#1C2230] to-[#0E1117] border border-amber-500/30">
                <User className="h-6 w-6 text-[#E6B800]" />
              </div>
              <div>
                <div className="font-heading font-semibold text-lg text-white">{user.firstName} {user.lastName}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400" data-testid="dashboard-verified-badge">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-amber-500/15 p-4">
              <div className="text-xs text-gray-500 flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Referrals</div>
              <div className="mt-1 font-heading font-bold text-2xl text-white" data-testid="dashboard-referral-count">{user.referralCount ?? 0}</div>
            </div>
            <div className="rounded-xl border border-amber-500/15 p-4">
              <div className="text-xs text-gray-500 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Member since</div>
              <div className="mt-1 font-heading font-medium text-sm text-white">
                {new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* referral */}
      <div className="mt-6 glass rounded-2xl p-7" data-testid="dashboard-referral-card">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-[#E6B800]" />
          <h2 className="font-heading font-semibold text-lg text-white">Your referral code</h2>
        </div>
        <p className="mt-2 text-sm text-gray-400">Share your code and earn bonus SPEAK COIN when friends register and verify.</p>
        <div className="mt-5 grid sm:grid-cols-[auto_1fr] gap-4 items-center">
          <button onClick={() => copy(user.ownReferralCode, "Referral code")} data-testid="dashboard-copy-code"
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 font-mono font-bold text-2xl text-[#E6B800] tracking-widest flex items-center gap-3 hover:bg-amber-500/20 transition-colors">
            {user.ownReferralCode} <Copy className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 rounded-xl bg-[#0E1117] border border-amber-500/15 px-4 py-3">
            <span className="text-sm text-gray-400 truncate flex-1">{referralLink}</span>
            <button onClick={() => copy(referralLink, "Referral link")} data-testid="dashboard-copy-link"
              className="outline-gold-btn rounded-lg px-3 py-2 text-xs flex items-center gap-1.5 shrink-0">
              <Copy className="h-3.5 w-3.5" /> Copy link
            </button>
          </div>
        </div>
      </div>

      {/* ledger + tasks */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="card-tactical rounded-2xl p-7" data-testid="dashboard-ledger-card">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#E6B800]" />
            <h2 className="font-heading font-semibold text-lg text-white">Coin activity</h2>
          </div>
          <div className="mt-5 space-y-3">
            {ledger.length ? ledger.map((l) => (
              <div key={l.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
                <div>
                  <div className="text-sm text-white capitalize">{l.type.replace(/_/g, " ")}</div>
                  <div className="text-xs text-gray-500">{new Date(l.createdAt).toLocaleDateString()}</div>
                </div>
                <span className="font-mono font-semibold text-[#E6B800]">+{l.amount}</span>
              </div>
            )) : <p className="text-sm text-gray-500">No activity yet.</p>}
          </div>
        </div>

        <div className="card-tactical rounded-2xl p-7 relative overflow-hidden" data-testid="dashboard-tasks-card">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#E6B800]" />
            <h2 className="font-heading font-semibold text-lg text-white">Tasks & rewards</h2>
          </div>
          <p className="mt-2 text-sm text-gray-400">More ways to earn SPEAK COIN are coming soon.</p>
          <div className="mt-5 space-y-3 opacity-60">
            {["Complete your profile", "Attend a session", "Refer 3 friends"].map((t, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-dashed border-amber-500/20 p-4">
                <div className="h-5 w-5 rounded-full border-2 border-amber-500/40" />
                <span className="text-sm text-gray-300">{t}</span>
                <span className="ml-auto text-xs text-gray-500">Soon</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
