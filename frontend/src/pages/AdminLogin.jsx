import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ShieldAlert, ArrowRight } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useAdmin } from "@/context/AdminContext";
import { SpeakLogo } from "@/components/SpeakLogo";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { admin, setSession, loading: checking } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!checking && admin) navigate("/admin/dashboard");
  }, [checking, admin, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/admin/login", { email: email.trim(), password });
      setSession(data.access_token, data.admin);
      toast.success("Admin access granted.");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grain min-h-screen bg-[#07080B] grid place-items-center px-5">
      <div className="relative z-10 w-full max-w-md">
        <div className="flex justify-center mb-8"><SpeakLogo /></div>
        <div className="glass rounded-3xl p-8 sm:p-10 fade-up radial-gold">
          <div className="grid place-items-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 mx-auto">
            <ShieldAlert className="h-7 w-7 text-[#E6B800]" />
          </div>
          <h1 className="mt-6 font-heading font-extrabold text-2xl text-white text-center">Admin Console</h1>
          <p className="mt-2 text-sm text-gray-400 text-center">Restricted access — authorized personnel only.</p>

          <form onSubmit={submit} className="mt-8 space-y-5" data-testid="admin-login-form">
            <div>
              <label className="text-sm text-gray-300">Admin email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="admin-login-email"
                className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" placeholder="admin@speakcon.com" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Password</label>
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="admin-login-password"
                className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} data-testid="admin-login-submit"
              className="gold-btn rounded-full w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Authenticating…</> : <>Enter Console <ArrowRight className="h-5 w-5" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
