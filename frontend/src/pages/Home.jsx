import { Link } from "react-router-dom";
import { Countdown } from "@/components/Countdown";
import {
  ArrowRight, MapPin, Coins, Lightbulb, Users, Target, Compass,
  Sparkles, CalendarDays, ChevronDown,
} from "lucide-react";
import { useState } from "react";

const HERO_IMG = "https://images.unsplash.com/photo-1761925116230-d24410fbe1a0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";
const VENUE_IMG = "https://images.unsplash.com/photo-1763962274119-1a0a0d418520?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";
const COIN_IMG = "https://images.unsplash.com/photo-1642735051388-3387a20e0e8f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000";

const pillars = [
  { icon: Lightbulb, title: "Knowledge", text: "Deep sessions that turn insight into deployable solutions for real-world problems." },
  { icon: Compass, title: "Positioning", text: "Find your outpost — the frontier where your gifts meet the world's needs." },
  { icon: Target, title: "Impact", text: "A generation equipped to solve problems existing anywhere, through knowledge." },
];

const speakers = [
  { name: "Speaker To Be Announced", role: "Keynote · Leadership" },
  { name: "Speaker To Be Announced", role: "Innovation & Technology" },
  { name: "Speaker To Be Announced", role: "Purpose & Impact" },
  { name: "Speaker To Be Announced", role: "Entrepreneurship" },
];

const faqTeaser = [
  { q: "How much does it cost to register?", a: "Registration for SPEAK 2026 is free. Verified attendees also earn free SPEAK COIN as a welcome reward." },
  { q: "What is SPEAK COIN?", a: "SPEAK COIN is our internal reward point system. Earn it by registering, verifying, and referring others to the conference." },
  { q: "Where is the venue?", a: "Royal Event Center, behind Niger Motel, Suleja, Niger State. Full directions are on the Event Details page." },
];

function FaqRow({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-tactical rounded-xl overflow-hidden" data-testid="home-faq-item">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
        <span className="font-heading font-medium text-white">{q}</span>
        <ChevronDown className={`h-5 w-5 text-[#E6B800] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="SPEAK 2026 stage" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#07080B]/70 via-[#07080B]/85 to-[#07080B]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#E6B800]">
              <Sparkles className="h-3.5 w-3.5" /> SPEAK Conference 2026
            </div>
            <h1 className="mt-6 font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-white">
              THE OUTPOST:<br />
              <span className="gold-text-gradient">A Generation Positioned for Impact</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed">
              Solving Problems Existing Anywhere Through Knowledge. Join a movement of thinkers, builders and leaders taking their position at the frontier.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#E6B800]" /> October 1, 2026</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#E6B800]" /> Royal Event Center, Suleja, Niger State</span>
            </div>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/register" data-testid="hero-register-btn" className="gold-btn rounded-full px-7 py-3.5 text-sm sm:text-base flex items-center gap-2">
                Claim Your Pass & Free SPEAK COIN <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/event-details" data-testid="hero-details-btn" className="outline-gold-btn rounded-full px-7 py-3.5 text-sm sm:text-base">
                Explore Event Schedule
              </Link>
            </div>
          </div>
          <div className="mt-16 fade-up">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">Countdown to the Outpost</p>
            <Countdown />
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="radial-gold py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-[#E6B800]">Our Mission</span>
            <h2 className="mt-3 font-heading font-bold text-3xl sm:text-4xl text-white leading-tight">
              A generation equipped to solve problems anywhere.
            </h2>
          </div>
          <div className="mt-14 grid md:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <div key={p.title} className="card-tactical rounded-2xl p-7 fade-up" style={{ animationDelay: `${i * 0.1}s` }} data-testid={`mission-pillar-${i}`}>
                <div className="grid place-items-center h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/25">
                  <p.icon className="h-6 w-6 text-[#E6B800]" />
                </div>
                <h3 className="mt-5 font-heading font-semibold text-xl text-white">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPEAK COIN */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 order-2 lg:order-1">
            <img src={COIN_IMG} alt="SPEAK COIN" className="w-full h-72 sm:h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-transparent to-transparent" />
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#E6B800]">
              <Coins className="h-3.5 w-3.5" /> Rewards
            </div>
            <h2 className="mt-5 font-heading font-bold text-3xl sm:text-4xl text-white leading-tight">
              Earn <span className="text-[#E6B800]">SPEAK COIN</span> from the moment you join.
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed">
              Register and verify your email to unlock your welcome reward of free SPEAK COIN. Invite friends with your personal referral code and earn even more as they join the Outpost.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-300">
              <li className="flex gap-3"><Coins className="h-5 w-5 text-[#E6B800] shrink-0" /> Instant welcome reward on verification</li>
              <li className="flex gap-3"><Users className="h-5 w-5 text-[#E6B800] shrink-0" /> Bonus coin for every successful referral</li>
              <li className="flex gap-3"><Target className="h-5 w-5 text-[#E6B800] shrink-0" /> Track your balance in your attendee dashboard</li>
            </ul>
            <Link to="/register" className="mt-8 inline-flex gold-btn rounded-full px-6 py-3 text-sm items-center gap-2" data-testid="coin-register-btn">
              Start Earning <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* VENUE */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/20">
            <img src={VENUE_IMG} alt="Venue" className="w-full h-80 sm:h-[26rem] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07080B] via-[#07080B]/70 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="p-8 sm:p-14 max-w-lg">
                <span className="text-xs uppercase tracking-[0.3em] text-[#E6B800]">The Venue</span>
                <h2 className="mt-3 font-heading font-bold text-3xl sm:text-4xl text-white">Royal Event Center</h2>
                <p className="mt-4 text-gray-300 flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-[#E6B800] shrink-0 mt-0.5" />
                  Behind Niger Motel, Suleja, Niger State
                </p>
                <Link to="/event-details" className="mt-7 inline-flex outline-gold-btn rounded-full px-6 py-3 text-sm items-center gap-2">
                  Get Directions <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPEAKERS */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#E6B800]">The Voices</span>
              <h2 className="mt-3 font-heading font-bold text-3xl sm:text-4xl text-white">Speakers</h2>
            </div>
            <span className="text-sm text-gray-500">Full lineup announced soon</span>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {speakers.map((s, i) => (
              <div key={i} className="card-tactical rounded-2xl p-6 text-center fade-up" style={{ animationDelay: `${i * 0.08}s` }} data-testid={`speaker-card-${i}`}>
                <div className="mx-auto h-24 w-24 rounded-full border-2 border-amber-500/30 bg-gradient-to-b from-[#1C2230] to-[#0E1117] grid place-items-center">
                  <Users className="h-10 w-10 text-amber-500/40" />
                </div>
                <h3 className="mt-5 font-heading font-semibold text-white text-base">{s.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-[#E6B800]">{s.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ TEASER */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#E6B800]">Questions</span>
            <h2 className="mt-3 font-heading font-bold text-3xl sm:text-4xl text-white">Frequently Asked</h2>
          </div>
          <div className="mt-10 space-y-4">
            {faqTeaser.map((f) => <FaqRow key={f.q} {...f} />)}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="outline-gold-btn rounded-full px-6 py-3 text-sm inline-flex items-center gap-2">
              View all FAQs <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="glass rounded-3xl px-8 sm:px-14 py-14 text-center radial-gold">
            <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-white leading-tight">
              Take your position at <span className="gold-text-gradient">The Outpost</span>
            </h2>
            <p className="mt-4 text-gray-400 max-w-xl mx-auto">
              Registration is free and takes less than a minute. Verify your email to claim your SPEAK COIN.
            </p>
            <Link to="/register" data-testid="cta-register-btn" className="mt-8 inline-flex gold-btn rounded-full px-8 py-4 text-base items-center gap-2 pulse-glow">
              Register Now <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
