import { Link } from "react-router-dom";
import { MapPin, Clock, Coins, Users, Navigation, ArrowRight, Mic, Wrench, HeartHandshake } from "lucide-react";

const KEYNOTE_IMG = "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200";

const schedule = [
  { time: "09:00", title: "Doors Open & Registration Check-in", desc: "Collect your attendee pass and network before the sessions begin." },
  { time: "10:00", title: "Opening Keynote — The Outpost", desc: "Setting the vision: a generation positioned for impact." },
  { time: "11:30", title: "Knowledge Track Sessions", desc: "Breakout sessions on turning knowledge into deployable solutions." },
  { time: "13:00", title: "Lunch & Networking", desc: "Connect with fellow builders, leaders and innovators." },
  { time: "14:30", title: "Innovation & Impact Panels", desc: "Practitioner panels across technology, purpose and enterprise." },
  { time: "16:30", title: "Closing Session & SPEAK COIN Rewards", desc: "Celebrating the community and looking ahead." },
];

const tracks = [
  { icon: Mic, title: "Leadership & Purpose", desc: "Positioning yourself and your team at the frontier of impact." },
  { icon: Wrench, title: "Knowledge & Solutions", desc: "Practical frameworks for solving problems that exist anywhere." },
  { icon: HeartHandshake, title: "Community & Enterprise", desc: "Building movements and ventures that outlast the moment." },
];

export default function EventDetails() {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="max-w-3xl fade-up">
        <span className="text-xs uppercase tracking-[0.3em] text-[#E6B800]">Event Details</span>
        <h1 className="mt-3 font-heading font-extrabold text-4xl sm:text-5xl text-white leading-tight">Everything you need for the day</h1>
        <p className="mt-5 text-gray-400 leading-relaxed">
          A full day of keynotes, tracks and connection at SPEAK Conference 2026, themed THE OUTPOST. Below is the provisional schedule, venue directions and how the SPEAK COIN reward system works.
        </p>
      </div>

      {/* SCHEDULE */}
      <section className="mt-16">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white flex items-center gap-3">
          <Clock className="h-6 w-6 text-[#E6B800]" /> Schedule — October 1, 2026
        </h2>
        <div className="mt-8 space-y-4">
          {schedule.map((s, i) => (
            <div key={i} className="card-tactical rounded-xl p-5 flex gap-5" data-testid={`schedule-item-${i}`}>
              <div className="font-mono font-semibold text-[#E6B800] text-lg w-16 shrink-0">{s.time}</div>
              <div className="border-l border-amber-500/20 pl-5">
                <h3 className="font-heading font-semibold text-white">{s.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRACKS */}
      <section className="mt-20">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">Keynote Tracks</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {tracks.map((t, i) => (
            <div key={i} className="card-tactical rounded-2xl p-7" data-testid={`track-card-${i}`}>
              <div className="grid place-items-center h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <t.icon className="h-6 w-6 text-[#E6B800]" />
              </div>
              <h3 className="mt-5 font-heading font-semibold text-lg text-white">{t.title}</h3>
              <p className="mt-2 text-sm text-gray-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VENUE */}
      <section className="mt-20 grid lg:grid-cols-2 gap-10 items-center">
        <div className="rounded-3xl overflow-hidden border border-amber-500/20">
          <img src={KEYNOTE_IMG} alt="Keynote" className="w-full h-80 object-cover" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white flex items-center gap-3">
            <MapPin className="h-6 w-6 text-[#E6B800]" /> Venue & Directions
          </h2>
          <p className="mt-4 text-lg text-white font-medium">Royal Event Center</p>
          <p className="mt-1 text-gray-400">Behind Niger Motel, Suleja, Niger State, Nigeria</p>
          <p className="mt-5 text-sm text-gray-400 leading-relaxed">
            The venue is located just behind Niger Motel in Suleja. Ample parking is available on-site. Arrive early for a smooth check-in and to make the most of the morning networking.
          </p>
          <a
            href="https://www.google.com/maps/search/Royal+Event+Center+Suleja+Niger+State"
            target="_blank" rel="noopener noreferrer"
            data-testid="venue-directions-link"
            className="mt-7 inline-flex outline-gold-btn rounded-full px-6 py-3 text-sm items-center gap-2"
          >
            <Navigation className="h-4 w-4" /> Open in Google Maps
          </a>
        </div>
      </section>

      {/* SPEAK COIN */}
      <section className="mt-20">
        <div className="glass rounded-3xl p-8 sm:p-12">
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white flex items-center gap-3">
            <Coins className="h-6 w-6 text-[#E6B800]" /> How SPEAK COIN Works
          </h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-amber-500/15 p-6">
              <div className="font-heading font-bold text-3xl text-[#E6B800]">1</div>
              <h3 className="mt-3 font-heading font-semibold text-white">Register & Verify</h3>
              <p className="mt-2 text-sm text-gray-400">Sign up with your email and verify it to unlock your welcome reward.</p>
            </div>
            <div className="rounded-xl border border-amber-500/15 p-6">
              <div className="font-heading font-bold text-3xl text-[#E6B800]">2</div>
              <h3 className="mt-3 font-heading font-semibold text-white flex items-center gap-2"><Users className="h-4 w-4" /> Refer Friends</h3>
              <p className="mt-2 text-sm text-gray-400">Share your personal referral code and earn bonus coin for each verified join.</p>
            </div>
            <div className="rounded-xl border border-amber-500/15 p-6">
              <div className="font-heading font-bold text-3xl text-[#E6B800]">3</div>
              <h3 className="mt-3 font-heading font-semibold text-white">Track & Grow</h3>
              <p className="mt-2 text-sm text-gray-400">Watch your balance grow in your attendee dashboard.</p>
            </div>
          </div>
          <Link to="/register" className="mt-8 inline-flex gold-btn rounded-full px-7 py-3.5 text-sm items-center gap-2">
            Register & Claim Your Coin <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
