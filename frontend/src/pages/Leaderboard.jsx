import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Coins, Medal, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const rankStyles = {
  1: "border-[#E6B800]/60 bg-[#E6B800]/10 text-[#E6B800]",
  2: "border-slate-300/40 bg-slate-300/10 text-slate-200",
  3: "border-[#B87333]/50 bg-[#B87333]/10 text-[#D99A6C]",
};

function shareRank(user, rank) {
  const referralLink = user?.ownReferralCode
    ? `${window.location.origin}/register?ref=${user.ownReferralCode}`
    : `${window.location.origin}/leaderboard`;
  const text = `I am ranked #${rank} among SPEAK Conference movement builders. Join SPEAK 2026 and build with us:`;

  if (navigator.share) {
    navigator.share({ title: "SPEAK Conference Leaderboard", text, url: referralLink }).catch(() => {});
    return;
  }

  navigator.clipboard.writeText(`${text} ${referralLink}`)
    .then(() => toast.success("Your rank invite was copied."))
    .catch(() => toast.error("Unable to copy your rank invite."));
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/leaderboard")
      .then(({ data }) => setLeaders(data))
      .catch((err) => setError(formatApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-14 sm:py-20">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <header className="max-w-2xl fade-up">
          <div className="flex items-center gap-3 text-sm font-medium tracking-wide text-[#74D5D0]">
            <span className="h-px w-10 bg-[#0C8588]" /> SPEAK Conference movement
          </div>
          <h1 className="mt-5 font-heading font-extrabold text-4xl sm:text-6xl text-white leading-[0.98]">
            Leaderboard
          </h1>
          <p className="mt-5 text-gray-400 leading-relaxed">
            Celebrating the people building momentum for SPEAK Conference 2026. Rankings are based on verified successful referrals.
          </p>
        </header>

        <div className="mt-10 glass rounded-2xl p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/10 border border-amber-500/25">
                <Medal className="h-5 w-5 text-[#E6B800]" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-xl text-white">Top 20 referrers</h2>
                <p className="text-sm text-gray-500">Verified builders, ranked by members invited</p>
              </div>
            </div>
            {user && leaders.some((leader) => leader.id === user.id) && (
              <button
                type="button"
                onClick={() => {
                  const rank = leaders.findIndex((leader) => leader.id === user.id) + 1;
                  shareRank(user, rank);
                }}
                className="outline-gold-btn rounded-full px-4 py-2.5 text-sm flex items-center gap-2"
                data-testid="leaderboard-share-rank"
              >
                <Share2 className="h-4 w-4" /> Share My Rank
              </button>
            )}
          </div>

          {loading && <p className="py-12 text-center text-sm text-gray-500">Loading the movement builders...</p>}
          {!loading && error && <p className="py-12 text-center text-sm text-red-300">{error}</p>}
          {!loading && !error && !leaders.length && (
            <div className="py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-600" />
              <p className="mt-3 text-sm text-gray-500">The leaderboard will appear after the first successful referrals.</p>
            </div>
          )}
          {!loading && !error && leaders.length > 0 && (
            <div className="mt-2 divide-y divide-white/5">
              {leaders.map((leader) => {
                const isCurrentUser = user?.id === leader.id;
                return (
                  <div key={leader.id} className={`flex items-center gap-3 sm:gap-5 py-4 ${isCurrentUser ? "-mx-2 px-2 rounded-xl bg-amber-500/[0.06]" : ""}`}>
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border font-heading font-bold ${rankStyles[leader.rank] || "border-white/10 bg-white/[0.03] text-gray-400"}`}>
                      {leader.rank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-white">{leader.name}{isCurrentUser ? " (You)" : ""}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <Users className="h-3.5 w-3.5" /> {leader.referralCount} {leader.referralCount === 1 ? "member" : "members"} invited
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 font-mono font-semibold text-[#E6B800]">
                      <Coins className="h-4 w-4" /> {leader.totalSpeakBalance.toLocaleString()} <span className="hidden sm:inline">SPEAK</span>
                    </div>
                    {isCurrentUser && (
                      <button type="button" onClick={() => shareRank(user, leader.rank)} className="hidden sm:inline-flex outline-gold-btn rounded-full px-3 py-2 text-xs items-center gap-1.5" aria-label="Share my rank">
                        <Share2 className="h-3.5 w-3.5" /> Share
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-5 sm:p-6">
          <div>
            <p className="font-heading font-semibold text-white">Ready to build your rank?</p>
            <p className="mt-1 text-sm text-gray-400">Invite people into the SPEAK Conference movement.</p>
          </div>
          <Link to={user ? "/dashboard" : "/register"} className="gold-btn rounded-full px-5 py-2.5 text-sm flex items-center gap-2">
            {user ? "Open dashboard" : "Join SPEAK Conference"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
