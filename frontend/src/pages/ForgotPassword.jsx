import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { api, formatApiError } from "@/lib/api";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let recaptchaToken = "";
      if (executeRecaptcha) {
        try {
          recaptchaToken = await executeRecaptcha("forgot_password");
        } catch {
          /* best effort; backend handles enforcement */
        }
      }
      const { data } = await api.post("/forgot-password", {
        email: email.trim(),
        recaptchaToken,
      });
      setSent(data);
      toast.success(data.message);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-5 sm:px-8 py-20">
        <div className="glass rounded-3xl p-8 sm:p-10 fade-up text-center" data-testid="forgot-sent">
          <div className="grid place-items-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 mx-auto">
            <CheckCircle2 className="h-7 w-7 text-[#E6B800]" />
          </div>
          <h1 className="mt-6 font-heading font-extrabold text-3xl text-white">Check your inbox</h1>
          <p className="mt-3 text-gray-400">{sent.message}</p>
          <p className="mt-2 text-xs text-gray-500">The link expires in 60 minutes.</p>
          {sent.devResetLink && (
            <a
              href={sent.devResetLink}
              data-testid="forgot-dev-link"
              className="mt-5 inline-flex outline-gold-btn rounded-full px-5 py-2.5 text-sm w-full justify-center"
            >
              Continue to reset (demo)
            </a>
          )}
          <Link to="/login" data-testid="forgot-back-to-login" className="mt-6 inline-block text-sm text-[#E6B800] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 sm:px-8 py-20">
      <div className="glass rounded-3xl p-8 sm:p-10 fade-up">
        <div className="grid place-items-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 mx-auto">
          <Mail className="h-7 w-7 text-[#E6B800]" />
        </div>
        <h1 className="mt-6 font-heading font-extrabold text-3xl text-white text-center">Forgot your password?</h1>
        <p className="mt-2 text-sm text-gray-400 text-center">
          Enter the email you registered with and we'll send you a secure link to set a new password.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5" data-testid="forgot-form">
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="forgot-email"
              className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500" data-testid="forgot-recaptcha">
            <ShieldCheck className="h-4 w-4 text-[#E6B800]" />
            Protected by Google reCAPTCHA
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="forgot-submit"
            className="gold-btn rounded-full w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Sending…
              </>
            ) : (
              <>
                Send reset link <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Remembered it?{" "}
          <Link to="/login" className="text-[#E6B800] hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;
  if (!recaptchaSiteKey) return <ForgotPasswordForm />;
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
      <ForgotPasswordForm />
    </GoogleReCaptchaProvider>
  );
}
