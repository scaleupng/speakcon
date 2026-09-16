import { useEffect, useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Coins, ShieldCheck, Copy, Users, Gift, TrendingUp, User, Clock, Sparkles,
  Ticket, CalendarDays, MapPin, Share2,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ClaimButton from "@/components/ui/ClaimButton";

const WhatsAppIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const XIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M13.5 22v-8h2.75l.5-3h-3.25V9.05c0-.87.24-1.55 1.62-1.55h1.73V4.82c-.3-.04-1.32-.12-2.5-.12-2.48 0-4.18 1.51-4.18 4.29V11H7.4v3h2.77v8h3.33Z" />
  </svg>
);

export default function Dashboard() {
  const { user, refresh } = useAuth();
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    refresh();
    api.get("/my-ledger").then(({ data }) => setLedger(data)).catch(() => {});
    // eslint-disable-next-line
  }, []);

  if (!user) return null;

  const ownedBalance = Number(user.totalSpeakBalance ?? (Number(user.speakCoinBalance || 0) + Number(user.pendingSpeakBalance || 0)));
  const balanceClaimed = Number(user.pendingSpeakBalance || 0) === 0;

  const referralLink = `${window.location.origin}/register?ref=${user.ownReferralCode}`;

  const shareText = `Join me at SPEAK 2026: THE OUTPOST 🎯 Register free and earn SPEAK COIN using my referral code ${user.ownReferralCode}:`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;

  const passPayload = `SPEAK2026|${user.id}|${user.firstName} ${user.lastName}|${user.email}`;

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
          <div className={`mt-4 font-heading font-extrabold text-5xl ${balanceClaimed ? "gold-text-gradient" : "text-[#E6B800]/65"}`} data-testid="dashboard-coin-balance">
            {ownedBalance}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {balanceClaimed ? "Claimed to wallet" : "Claim to wallet available soon"}
          </p>
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

      <div className="mt-6 glass rounded-2xl p-7 flex flex-wrap items-center justify-between gap-5" data-testid="dashboard-claim-card">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-[#E6B800]">SPEAK COIN rewards</div>
          <h2 className="mt-2 font-heading font-semibold text-xl text-white">Your SPEAK COIN is yours.</h2>
          <p className="mt-2 text-sm text-gray-400">Connect your wallet to claim it when the rewards station opens.</p>
        </div>
        <ClaimButton />
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

        {/* Share to earn */}
        <div className="mt-5 pt-5 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-[#E6B800]" />
            <span className="text-sm font-medium text-white">Share &amp; earn</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-testid="dashboard-share-whatsapp"
              className="flex items-center gap-2 rounded-full bg-[#25D366] text-black font-semibold px-5 py-2.5 text-sm transition-transform hover:-translate-y-0.5">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
            <a href={xUrl} target="_blank" rel="noopener noreferrer" data-testid="dashboard-share-x"
              className="flex items-center gap-2 rounded-full bg-white text-black font-semibold px-5 py-2.5 text-sm transition-transform hover:-translate-y-0.5">
              <XIcon className="h-4 w-4" /> Share on X
            </a>
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer" data-testid="dashboard-share-facebook"
              className="flex items-center gap-2 rounded-full bg-[#1877F2] text-white font-semibold px-5 py-2.5 text-sm transition-transform hover:-translate-y-0.5">
              <FacebookIcon className="h-4 w-4" /> Facebook
            </a>
            <button onClick={() => copy(`${shareText} ${referralLink}`, "Invite message")} data-testid="dashboard-share-copy"
              className="flex items-center gap-2 outline-gold-btn rounded-full px-5 py-2.5 text-sm">
              <Copy className="h-4 w-4" /> Copy invite
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Pass */}
      <div className="mt-6 glass rounded-2xl p-7 grid md:grid-cols-[auto_1fr] gap-8 items-center radial-gold" data-testid="dashboard-ticket-pass">
        <div className="bg-white rounded-2xl p-4 mx-auto shadow-[0_0_30px_rgba(230,184,0,0.25)]">
          <QRCodeSVG value={passPayload} size={168} level="M" fgColor="#07080B" bgColor="#ffffff" data-testid="dashboard-qr" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#E6B800]">
            <Ticket className="h-3.5 w-3.5" /> Attendee Pass
          </div>
          <h2 className="mt-4 font-heading font-bold text-2xl text-white">{user.firstName} {user.lastName}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>
          <div className="mt-4 space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#E6B800]" /> October 1, 2026 · Doors 09:00</div>
            <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-[#E6B800] shrink-0 mt-0.5" /> Royal Event Center, behind Niger Motel, Suleja, Niger State</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Verified attendee</div>
          </div>
          <p className="mt-4 text-xs text-gray-500">Present this QR code at the venue entrance for check-in.</p>
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
                  <div className="text-sm text-white capitalize">{l.type === "pending_initial_reward" ? "Unclaimed reward" : l.type.replace(/_/g, " ")}</div>
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
