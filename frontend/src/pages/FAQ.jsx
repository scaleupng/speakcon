import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown, ArrowRight } from "lucide-react";

const faqs = [
  { cat: "Registration", q: "How much does it cost to register?", a: "Registration for SPEAK 2026 is completely free. Verified attendees also receive free SPEAK COIN as a welcome reward." },
  { cat: "Registration", q: "What information do I need to register?", a: "Your first name, last name, email address and WhatsApp number. A referral code is optional if a friend invited you." },
  { cat: "Registration", q: "Can I register more than once with the same email?", a: "No. Each email can only be registered once — email is our unique identifier to prevent duplicates." },
  { cat: "Verification", q: "How do I verify my registration?", a: "After registering, we email you a verification link. Click it to create your password and complete verification." },
  { cat: "Verification", q: "My verification link expired. What now?", a: "Verification links expire after a few hours for security. Simply register again or use the resend option to get a fresh link." },
  { cat: "Verification", q: "I didn't receive the verification email.", a: "Check your spam folder first. You can request a new email — there is a short cooldown between resends to prevent abuse." },
  { cat: "SPEAK COIN", q: "What is SPEAK COIN?", a: "SPEAK COIN is our internal reward point system for the conference community. It is not a cryptocurrency or on-chain token." },
  { cat: "SPEAK COIN", q: "When do I receive my SPEAK COIN?", a: "Your welcome reward is credited automatically once you verify your email and set your password." },
  { cat: "SPEAK COIN", q: "How do referrals earn coin?", a: "Share your referral code from your dashboard. When someone registers and verifies using it, you earn a referral bonus." },
  { cat: "Venue & Arrival", q: "Where is the venue?", a: "Royal Event Center, behind Niger Motel, Suleja, Niger State. Directions are available on the Event Details page." },
  { cat: "Venue & Arrival", q: "What time should I arrive?", a: "Doors open at 09:00. We recommend arriving early for a smooth check-in and morning networking." },
];

const categories = ["All", "Registration", "Verification", "SPEAK COIN", "Venue & Arrival"];

function FaqItem({ q, a, cat }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-tactical rounded-xl overflow-hidden" data-testid="faq-item">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#E6B800]">{cat}</span>
          <div className="font-heading font-medium text-white mt-1">{q}</div>
        </div>
        <ChevronDown className={`h-5 w-5 text-[#E6B800] shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function FAQ() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = faqs.filter((f) => {
    const matchCat = cat === "All" || f.cat === cat;
    const matchQuery = !query || f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="text-center fade-up">
        <span className="text-xs uppercase tracking-[0.3em] text-[#E6B800]">Support</span>
        <h1 className="mt-3 font-heading font-extrabold text-4xl sm:text-5xl text-white">Frequently Asked Questions</h1>
        <p className="mt-4 text-gray-400">Everything about registration, verification, SPEAK COIN and the venue.</p>
      </div>

      <div className="mt-10 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
        <input
          data-testid="faq-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="w-full rounded-full bg-[#0E1117] border border-amber-500/20 pl-12 pr-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            data-testid={`faq-cat-${c.toLowerCase().replace(/[^a-z]/g, "")}`}
            className={`rounded-full px-4 py-1.5 text-sm border transition-colors ${cat === c ? "bg-[#E6B800] text-black border-transparent" : "border-amber-500/25 text-gray-300 hover:border-amber-500/50"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {filtered.length ? filtered.map((f, i) => <FaqItem key={i} {...f} />) : (
          <p className="text-center text-gray-500 py-10">No questions match your search.</p>
        )}
      </div>

      <div className="mt-12 glass rounded-2xl p-8 text-center">
        <h3 className="font-heading font-semibold text-xl text-white">Still have questions?</h3>
        <p className="mt-2 text-sm text-gray-400">Register now and claim your free SPEAK COIN — it only takes a minute.</p>
        <Link to="/register" className="mt-6 inline-flex gold-btn rounded-full px-6 py-3 text-sm items-center gap-2">
          Register Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
