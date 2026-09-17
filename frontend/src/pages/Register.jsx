import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Coins, PartyPopper, ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { api, formatApiError } from "@/lib/api";

function fireConfetti() {
  const colors = ["#E6B800", "#F5C71A", "#FFE57F", "#ffffff"];
  const end = Date.now() + 1200;
  (function frame() {
    confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  confetti({ particleCount: 120, spread: 80, origin: { y: 0.4 }, colors });
}

function RegisterForm() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", whatsappNumber: "", referralCode: (searchParams.get("ref") || "").toUpperCase() });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const navigate = useNavigate();

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!executeRecaptcha) {
        throw new Error("reCAPTCHA is still loading. Please try again in a moment.");
      }
      const recaptchaToken = await executeRecaptcha("register");

      const { data } = await api.post("/register", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
        referralCode: form.referralCode.trim() || null,
        recaptchaToken,
      });
      setSuccess(data);
      fireConfetti();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20 grid lg:grid-cols-2 gap-14 items-start">
      {/* copy */}
      <div className="fade-up lg:sticky lg:top-24">
        <span className="text-xs uppercase tracking-[0.3em] text-[#E6B800]">Registration</span>
        <h1 className="mt-3 font-heading font-extrabold text-4xl sm:text-5xl text-white leading-tight">
          Claim your pass to <span className="gold-text-gradient">The Outpost</span>
        </h1>
        <p className="mt-5 text-gray-400 leading-relaxed max-w-md">
          Registration is free. Verify your email to instantly unlock your free SPEAK COIN welcome reward.
        </p>
        <div className="mt-8 space-y-4 max-w-md">
          {[
            { icon: Coins, t: "Free SPEAK COIN", d: "Credited the moment you verify." },
            { icon: Mail, t: "Email verification", d: "A secure link lands in your inbox." },
            { icon: PartyPopper, t: "Instant confirmation", d: "Know you're in right away." },
          ].map((f, i) => (
            <div key={i} className="flex gap-4 card-tactical rounded-xl p-4">
              <div className="grid place-items-center h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/25 shrink-0">
                <f.icon className="h-5 w-5 text-[#E6B800]" />
              </div>
              <div>
                <div className="font-heading font-semibold text-white text-sm">{f.t}</div>
                <div className="text-xs text-gray-400 mt-0.5">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* form */}
      <div className="glass rounded-3xl p-7 sm:p-9 fade-up">
        <form onSubmit={submit} className="space-y-5" data-testid="register-form">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">First name *</label>
              <input required value={form.firstName} onChange={update("firstName")} data-testid="register-firstName"
                className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50" placeholder="Ada" />
            </div>
            <div>
              <label className="text-sm text-gray-300">Last name *</label>
              <input required value={form.lastName} onChange={update("lastName")} data-testid="register-lastName"
                className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50" placeholder="Obi" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300">Email address *</label>
            <input required type="email" value={form.email} onChange={update("email")} data-testid="register-email"
              className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm text-gray-300">WhatsApp number *</label>
            <input required type="tel" value={form.whatsappNumber} onChange={update("whatsappNumber")} data-testid="register-whatsapp-number"
              className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50" placeholder="+234 801 234 5678" />
          </div>
          <div>
            <label className="text-sm text-gray-300">Referral code <span className="text-gray-500">(optional)</span></label>
            <input value={form.referralCode} onChange={update("referralCode")} data-testid="register-referralCode"
              className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 uppercase" placeholder="SPKXXXXXX" />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500" data-testid="register-recaptcha">
            <ShieldCheck className="h-4 w-4 text-[#E6B800]" />
            Protected by Google reCAPTCHA
          </div>

          <button type="submit" disabled={loading} data-testid="register-submit"
            className="gold-btn rounded-full w-full py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting…</> : <>Register & Claim SPEAK COIN <ArrowRight className="h-5 w-5" /></>}
          </button>
          <p className="text-center text-sm text-gray-400">
            Already registered? <Link to="/login" className="text-[#E6B800] hover:underline">Log in</Link>
          </p>
        </form>
      </div>

      {/* SUCCESS MODAL */}
      {success && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 backdrop-blur-sm p-5" data-testid="register-success-modal">
          <div className="glass rounded-3xl p-8 sm:p-10 max-w-md text-center fade-up radial-gold">
            <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 pulse-glow">
              <PartyPopper className="h-8 w-8 text-[#E6B800]" />
            </div>
            <h2 className="mt-6 font-heading font-extrabold text-3xl text-white">Congratulations! 🎉</h2>
            <p className="mt-3 text-gray-300">
              Your registration is in. We've sent a verification email to <b className="text-white">{success.email}</b>.
            </p>
            <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 flex items-center gap-3 justify-center">
              <Coins className="h-6 w-6 text-[#E6B800]" />
              <span className="text-sm text-gray-200">You've earned <b className="text-[#E6B800]">free SPEAK COIN</b> — pending verification.</span>
            </div>
            <p className="mt-4 text-xs text-gray-500">Click the link in your email to verify and create your password.</p>

            {success.devVerificationLink && (
              <button
                onClick={() => navigate(`/verify/${success.devVerificationToken}`)}
                data-testid="register-dev-verify-btn"
                className="mt-5 outline-gold-btn rounded-full px-5 py-2.5 text-sm w-full"
              >
                Continue to verification (demo)
              </button>
            )}
            <button onClick={() => setSuccess(null)} data-testid="register-modal-close" className="mt-3 text-sm text-gray-400 hover:text-white">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Register() {
  const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  if (!recaptchaSiteKey) return <RegisterForm />;

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      <RegisterForm />
    </GoogleReCaptchaProvider>
  );
}
