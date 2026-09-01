import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Loader2, ShieldCheck, Coins, ArrowRight, XCircle, CheckCircle2 } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [checking, setChecking] = useState(true);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/verify/${token}`);
        setInfo(data);
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setChecking(false);
      }
    })();
  }, [token]);

  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][strength];

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post("/create-password", { token, password });
      setSession(data.access_token, data.user);
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 }, colors: ["#E6B800", "#F5C71A", "#FFE57F", "#ffffff"] });
      toast.success(data.message);
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return <div className="min-h-[60vh] grid place-items-center text-[#E6B800]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <div className="glass rounded-3xl p-10 fade-up">
          <XCircle className="h-14 w-14 text-red-400 mx-auto" />
          <h1 className="mt-6 font-heading font-bold text-2xl text-white">Verification failed</h1>
          <p className="mt-3 text-gray-400">{error}</p>
          <Link to="/register" className="mt-8 inline-flex gold-btn rounded-full px-6 py-3 text-sm items-center gap-2">
            Register again <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 sm:px-8 py-20">
      <div className="glass rounded-3xl p-8 sm:p-10 fade-up">
        <div className="grid place-items-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 mx-auto">
          <ShieldCheck className="h-7 w-7 text-[#E6B800]" />
        </div>
        <h1 className="mt-6 font-heading font-extrabold text-3xl text-white text-center">Create your password</h1>
        <p className="mt-2 text-sm text-gray-400 text-center">
          Hi <b className="text-white">{info.firstName}</b>, set a password to finish verifying <b className="text-white">{info.email}</b>.
        </p>

        <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 flex items-center gap-2 justify-center">
          <Coins className="h-5 w-5 text-[#E6B800]" />
          <span className="text-sm text-gray-200">Your SPEAK COIN unlocks on completion.</span>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5" data-testid="verify-form">
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="verify-password"
              className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" placeholder="At least 8 characters" />
            {password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className={`h-full transition-all ${["w-1/5 bg-red-500","w-2/5 bg-orange-500","w-3/5 bg-yellow-500","w-4/5 bg-lime-500","w-full bg-emerald-500"][Math.max(0,strength-1)]}`} />
                </div>
                <span className="text-xs text-gray-400 w-16">{strengthLabel}</span>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-300">Confirm password</label>
            <input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} data-testid="verify-confirm"
              className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" placeholder="Re-enter password" />
            {confirm && (
              <p className={`mt-1.5 text-xs flex items-center gap-1 ${password === confirm ? "text-emerald-400" : "text-red-400"}`}>
                {password === confirm ? <><CheckCircle2 className="h-3.5 w-3.5" /> Passwords match</> : "Passwords do not match"}
              </p>
            )}
          </div>
          <button type="submit" disabled={submitting} data-testid="verify-submit"
            className="gold-btn rounded-full w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Verifying…</> : <>Verify & Claim SPEAK COIN <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
