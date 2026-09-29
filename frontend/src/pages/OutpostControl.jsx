import { useEffect, useState } from "react";
import { Loader2, Power, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";
import { useAdmin } from "@/context/AdminContext";

export default function OutpostControl() {
  const { admin } = useAdmin();
  const [isClaimingActive, setIsClaimingActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/outpost-control")
      .then(({ data }) => setIsClaimingActive(Boolean(data.isClaimingActive)))
      .catch((err) => toast.error(formatApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/admin/outpost-control", { isClaimingActive });
      setIsClaimingActive(Boolean(data.isClaimingActive));
      toast.success(data.isClaimingActive ? "Live Claim is open." : "Live Claim is closed.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grain min-h-screen bg-[#07080B]">
      <main className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 py-14">
        <div className="flex items-center gap-3 text-[#E6B800]">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-xs uppercase tracking-[0.3em]">Admin Outpost Control</span>
        </div>
        <h1 className="mt-4 font-heading font-extrabold text-4xl text-white">Live Claim</h1>
        <p className="mt-3 text-gray-400">Control whether verified attendees can claim their pending SPEAK COIN rewards.</p>

        <section className="mt-8 glass rounded-2xl p-7">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="font-heading font-semibold text-xl text-white">Open the rewards station</h2>
              <p className="mt-2 text-sm text-gray-400">Current admin: {admin?.name || admin?.email}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isClaimingActive}
              aria-label="Toggle Live Claim"
              disabled={loading || saving}
              onClick={() => setIsClaimingActive((active) => !active)}
              className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${isClaimingActive ? "bg-emerald-500" : "bg-gray-700"}`}
            >
              <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform ${isClaimingActive ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>
          <div className={`mt-6 flex items-center gap-3 rounded-xl border p-4 text-sm ${isClaimingActive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/20 bg-amber-500/5 text-amber-200"}`}>
            <Power className="h-4 w-4" />
            {isClaimingActive ? "Live Claim is active." : "Rewards are stationed. Claiming is closed."}
          </div>
          <button type="button" onClick={save} disabled={loading || saving} className="gold-btn mt-6 rounded-full px-6 py-3 text-sm inline-flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
            Save Live Claim Status
          </button>
        </section>

      </main>
    </div>
  );
}
