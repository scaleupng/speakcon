import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Linkedin } from "lucide-react";

const team = [
  { name: "Ada Nwosu", role: "Creative Director", mark: "AN", tone: "team-amber", bio: "Shapes the visual language and the questions that open each edition." },
  { name: "Micheal Eze", role: "Experience Lead", mark: "ME", tone: "team-blue", bio: "Turns a room, a schedule and a crowd into one connected experience." },
  { name: "Zainab Bello", role: "Community & Care", mark: "ZB", tone: "team-coral", bio: "Makes sure every voice feels invited, held and able to contribute." },
  { name: "Daniel Udo", role: "Operations Lead", mark: "DU", tone: "team-moss", bio: "Keeps the moving parts moving, from first idea to final light." },
];

export default function Team() {
  return (
    <div className="team-page">
      <section className="team-page-hero">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#E6B800] transition-colors"><ArrowLeft className="h-4 w-4" /> Back home</Link>
          <div className="mt-16 max-w-3xl">
            <span className="text-xs uppercase tracking-[0.3em] text-[#E6B800]">Behind the signal</span>
            <h1 className="mt-4 font-heading font-extrabold text-5xl sm:text-7xl leading-[0.95] text-white">The people making room for <span className="gold-text-gradient">possibility.</span></h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-gray-400">A small, stubbornly hopeful team turning one day of gathering into a year of momentum.</p>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="team-page-grid">
          {team.map((person, index) => (
            <article key={person.name} className={`team-page-card ${person.tone}`} data-testid={`team-member-${index}`}>
              <div className="team-card-top"><span className="font-mono text-xs text-white/45">0{index + 1}</span><Linkedin className="h-4 w-4 text-white/45" /></div>
              <div className="team-mark">{person.mark}</div>
              <div className="relative z-10 mt-auto"><h2 className="font-heading text-2xl font-semibold text-white">{person.name}</h2><p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/60">{person.role}</p><p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">{person.bio}</p></div>
            </article>
          ))}
        </div>
        <div className="mt-16 grid lg:grid-cols-[1fr_1.6fr] gap-8 border-t border-white/10 pt-10">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#E6B800]">01 / Our why</span>
          <p className="font-heading text-2xl sm:text-4xl leading-tight text-white">We believe the right gathering can make a person braver about the work they already know they are here to do.</p>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20"><Link to="/register" className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"><span className="font-heading text-xl text-white">Bring your voice to SPEAK 2026.</span><span className="inline-flex items-center gap-2 text-sm text-[#E6B800]">Register now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link></section>
    </div>
  );
}
