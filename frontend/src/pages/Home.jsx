import { Link } from "react-router-dom";
import { Countdown } from "@/components/Countdown";
import {
  ArrowRight, MapPin, Coins, Lightbulb, Users, Target, HeartHandshake,
  CalendarDays, ChevronDown, Play, Quote, Mic2,
  ArrowUpRight, Linkedin,
} from "lucide-react";
import { useState } from "react";

const HERO_VIDEO = "/media/hero-loop.mp4";
const HERO_POSTER = "https://images.unsplash.com/photo-1761925116230-d24410fbe1a0?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600";
const THEME_IMG = "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";
const VENUE_IMG = "https://images.unsplash.com/photo-1763962274119-1a0a0d418520?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

const pillars = [
  { icon: Lightbulb, title: "Knowledge", text: "A gathering built to turn insight into solutions for problems that exist anywhere." },
  { icon: HeartHandshake, title: "Community", text: "Thinkers, builders and leaders who return every year to sharpen one another." },
  { icon: Target, title: "Impact", text: "Equipping a generation to take their position and make a measurable difference." },
];

const speakers = [
  { name: "Speaker To Be Announced", role: "Keynote · Leadership" },
  { name: "Speaker To Be Announced", role: "Innovation & Technology" },
  { name: "Speaker To Be Announced", role: "Purpose & Impact" },
  { name: "Speaker To Be Announced", role: "Entrepreneurship" },
];

const archiveYears = [
  {
    year: "2025",
    theme: "The Bridge",
    descriptor: "Building what connects us",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    speaker: "Dr. Nkem Okoro",
    role: "Systems thinker · SPEAK 2025",
    quote: "The future belongs to the people willing to build the bridge before they know who will cross it.",
  },
  {
    year: "2024",
    theme: "The Spark",
    descriptor: "Ideas that refuse to stay small",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400",
    speaker: "Tomi Adeyemi",
    role: "Founder · SPEAK 2024",
    quote: "An idea becomes impact the moment it leaves the room and starts serving someone else.",
  },
];

const team = [
  { name: "Ada Nwosu", role: "Creative Director", mark: "AN", tone: "team-amber" },
  { name: "Micheal Eze", role: "Experience Lead", mark: "ME", tone: "team-blue" },
  { name: "Zainab Bello", role: "Community & Care", mark: "ZB", tone: "team-coral" },
  { name: "Daniel Udo", role: "Operations Lead", mark: "DU", tone: "team-moss" },
];

const faqTeaser = [
  { q: "What is SPEAK Conference?", a: "SPEAK is an annual conference that brings people together to solve problems existing anywhere through knowledge. Each year carries a distinct theme — 2026's theme is THE OUTPOST." },
  { q: "How much does it cost to register?", a: "Registration for SPEAK 2026 is free. Verified attendees also earn free SPEAK COIN as a welcome reward." },
  { q: "When and where does it happen?", a: "SPEAK takes place every October 1. The host venue changes each year — for 2026 we gather at the Royal Event Center, Suleja, Niger State." },
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
          <video
            className="h-full w-full object-cover opacity-30"
            autoPlay loop muted playsInline preload="auto" poster={HERO_POSTER}
            data-testid="hero-video"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-[#07080B]/75 via-[#07080B]/85 to-[#07080B]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl fade-up">
            <div className="flex items-center gap-3 text-sm font-medium tracking-wide text-[#74D5D0]">
              <span className="h-px w-10 bg-[#0C8588]" /> The Annual SPEAK Conference
            </div>
            <h1 className="mt-6 font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-white">
              <span className="text-brand-teal">SPEAK</span> Conference
            </h1>
            <p className="mt-6 text-base sm:text-xl text-gray-200 max-w-xl leading-relaxed font-medium">
              Solving Problems Existing Anywhere Through Knowledge.
            </p>
            <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-xl leading-relaxed">
              Every year, a generation of thinkers, builders and leaders gathers to take their position and make an impact. This is where momentum begins.
            </p>

            {/* 2026 theme callout */}
            <div className="mt-7 border-l-2 border-[#0C8588] pl-4">
              <span className="text-xs uppercase tracking-[0.2em] text-[#74D5D0]">2026 theme</span>
              <span className="mt-1 block font-heading font-semibold text-white text-sm sm:text-base">
                THE OUTPOST: A Generation Positioned for Impact
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#E6B800]" /> Every October 1 · 2026 Edition</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#E6B800]" /> 2026 Venue: Royal Event Center, Suleja, Niger State</span>
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
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">Countdown to SPEAK 2026</p>
            <Countdown />
          </div>
        </div>
      </section>

      {/* WHAT SPEAK STANDS FOR */}
      <section className="radial-gold py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <h2 className="mt-3 font-heading font-bold text-3xl sm:text-4xl text-white leading-tight">
              An annual movement for those who refuse to stay silent.
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed">
              SPEAK returns each year to convene a generation around one enduring mission — solving problems existing anywhere through knowledge. Every edition carries a fresh theme, but the heartbeat never changes.
            </p>
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

      {/* 2026 THEME — THE OUTPOST */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="mt-5 font-heading font-bold text-3xl sm:text-5xl text-white leading-tight">
              THE <span className="gold-text-gradient">OUTPOST</span>
            </h2>
            <p className="mt-2 font-heading text-lg text-gray-300">A Generation Positioned for Impact</p>
            <p className="mt-5 text-gray-400 leading-relaxed max-w-lg">
              An outpost is a position taken at the frontier — where readiness meets opportunity. In 2026, SPEAK challenges a generation to find their outpost: the exact place their knowledge, gifts and courage are needed most, and to hold it with purpose.
            </p>
            <Link to="/event-details" className="mt-8 inline-flex outline-gold-btn rounded-full px-6 py-3 text-sm items-center gap-2">
              What to expect in 2026 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/20">
            <img src={THEME_IMG} alt="THE OUTPOST 2026" className="w-full h-72 sm:h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 badge-gold inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-500/15 text-[#E6B800] border border-amber-500/40">
              SPEAK 2026 Edition
            </div>
          </div>
        </div>
      </section>

      {/* SPEAK COIN */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/20 order-2 lg:order-1">
            <div className="flex h-72 items-center justify-center bg-[#0E1117] p-8 sm:h-96 sm:p-12">
              <img src="/brand/speakcoin_logo.png" alt="SPEAK COIN" className="h-full w-full object-contain drop-shadow-[0_0_28px_rgba(230,184,0,0.28)]" />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="mt-5 font-heading font-bold text-3xl sm:text-4xl text-white leading-tight">
              Earn <span className="text-[#E6B800]">SPEAK COIN</span> from the moment you join.
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed">
              Register and verify your email to unlock your welcome reward of free SPEAK COIN. Invite friends with your personal referral code and earn even more as they join SPEAK 2026.
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
                <h2 className="mt-3 font-heading font-bold text-3xl sm:text-4xl text-white">Royal Event Center</h2>
                <p className="mt-4 text-gray-300 flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-[#E6B800] shrink-0 mt-0.5" />
                  Behind Niger Motel, Suleja, Niger State
                </p>
                <p className="mt-3 text-xs text-gray-500">Our host venue changes each year — this is where SPEAK 2026 gathers.</p>
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

      {/* ARCHIVE */}
      <section id="archive" className="archive-section py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl">
            <Link to="/archive" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#E6B800] hover:text-[#F5C71A] transition-colors">The SPEAK archive <ArrowUpRight className="h-4 w-4" /></Link>
            <h2 className="mt-3 font-heading font-bold text-3xl sm:text-5xl text-white leading-tight">
              Echoes worth <span className="gold-text-gradient">carrying forward.</span>
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed">A living record of the voices, ideas and moments that stayed with us after the room emptied.</p>
          </div>

          <div className="mt-12 grid lg:grid-cols-[0.8fr_1.5fr] gap-8 items-start">
            <div className="archive-year-list" aria-label="Archive years">
              {archiveYears.map((item, index) => (
                <div key={item.year} className={`archive-year ${index === 0 ? "archive-year-active" : ""}`}>
                  <span className="font-mono text-xs text-[#E6B800]">0{index + 1}</span>
                  <div>
                    <p className="font-heading text-3xl font-bold text-white">{item.year}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.theme} · {item.descriptor}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-600 ml-auto" />
                </div>
              ))}
              <div className="archive-note mt-6">
                <Mic2 className="h-5 w-5 text-[#E6B800] shrink-0" />
                <p className="text-xs leading-relaxed text-gray-400">More stories are being gathered from the people who made each edition matter.</p>
              </div>
              <Link to="/archive" className="mt-5 inline-flex items-center gap-2 text-sm text-[#E6B800] hover:text-[#F5C71A] transition-colors">Open the full archive <ArrowRight className="h-4 w-4" /></Link>
            </div>

            <div className="archive-feature" data-testid="speaker-archive-feature">
              <div className="archive-image-wrap">
                <img src={archiveYears[0].image} alt="SPEAK 2025 audience gathering" className="archive-image" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-[#07080B]/20 to-transparent" />
                <div className="archive-play" aria-label="Play SPEAK 2025 highlight reel"><Play className="h-5 w-5 fill-current" /></div>
                <span className="absolute top-5 left-5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur">Highlight reel · 02:14</span>
                <span className="absolute bottom-5 left-5 font-mono text-xs text-[#E6B800]">SPEAK / 25</span>
              </div>
              <div className="archive-quote-panel">
                <Quote className="h-8 w-8 text-[#E6B800]" />
                <blockquote className="mt-4 font-heading text-2xl sm:text-3xl leading-tight text-white">“{archiveYears[0].quote}”</blockquote>
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{archiveYears[0].speaker}</p>
                    <p className="mt-1 text-xs text-gray-500">{archiveYears[0].role}</p>
                  </div>
                  <span className="font-mono text-xs text-[#E6B800]">01 / 02</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="archive-stat"><span className="font-mono text-2xl text-[#E6B800]">02</span><span>editions captured</span></div>
            <div className="archive-stat"><span className="font-mono text-2xl text-[#E6B800]">18</span><span>voices on record</span></div>
            <div className="archive-stat"><span className="font-mono text-2xl text-[#E6B800]">∞</span><span>ideas still in motion</span></div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-xl">
              <Link to="/team" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#E6B800] hover:text-[#F5C71A] transition-colors">Behind the signal <ArrowUpRight className="h-4 w-4" /></Link>
              <h2 className="mt-3 font-heading font-bold text-3xl sm:text-5xl text-white leading-tight">Meet the people making room for <span className="gold-text-gradient">possibility.</span></h2>
            </div>
            <p className="max-w-sm text-sm text-gray-500 leading-relaxed">A small, stubbornly hopeful team turning one day of gathering into a year of momentum.</p>
          </div>
          <div className="team-grid mt-12">
            {team.map((person, index) => (
              <article key={person.name} className={`team-card ${person.tone}`}>
                <div className="team-card-top">
                  <span className="font-mono text-xs text-white/45">0{index + 1}</span>
                  <Linkedin className="h-4 w-4 text-white/45" />
                </div>
                <div className="team-mark">{person.mark}</div>
                <div className="mt-auto">
                  <h3 className="font-heading text-xl font-semibold text-white">{person.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/60">{person.role}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-7"><Link to="/team" className="inline-flex items-center gap-2 text-sm text-[#E6B800] hover:text-[#F5C71A] transition-colors">Meet the full team <ArrowRight className="h-4 w-4" /></Link></div>
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
              Join <span className="gold-text-gradient">SPEAK 2026</span>
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
