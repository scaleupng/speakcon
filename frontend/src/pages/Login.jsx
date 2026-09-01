import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, ArrowRight, LogIn } from "lucide-react";
import { api, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/login", { email: email.trim(), password });
      setSession(data.access_token, data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 sm:px-8 py-20">
      <div className="glass rounded-3xl p-8 sm:p-10 fade-up">
        <div className="grid place-items-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 mx-auto">
          <LogIn className="h-7 w-7 text-[#E6B800]" />
        </div>
        <h1 className="mt-6 font-heading font-extrabold text-3xl text-white text-center">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-400 text-center">Log in to your attendee dashboard.</p>

        <form onSubmit={submit} className="mt-8 space-y-5" data-testid="login-form">
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email"
              className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password"
              className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} data-testid="login-submit"
            className="gold-btn rounded-full w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Signing in…</> : <>Log In <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Not registered yet? <Link to="/register" className="text-[#E6B800] hover:underline">Create your pass</Link>
        </p>
      </div>
    </div>
  );
}
