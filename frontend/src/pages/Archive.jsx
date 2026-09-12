import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Play, Quote, Mic2 } from "lucide-react";

const editions = [
  {
    year: "2025",
    theme: "THE SHIFT",
    descriptor: "Moving from intention to impact",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
    speaker: "Dr. Nkem Okoro",
    role: "Systems thinker · SPEAK 2025",
    quote: "The shift begins when we stop waiting for the moment and become ready to create it.",
  },
  {
    year: "2024",
    theme: "THE REVOLUTION",
    descriptor: "Ideas that change what is possible",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600",
    speaker: "Tomi Adeyemi",
    role: "Founder · SPEAK 2024",
    quote: "Every meaningful revolution starts with a people willing to imagine a different way forward.",
  },
];

function Edition({ edition, index }) {
  return (
    <article className="archive-page-edition" data-testid={`archive-edition-${edition.year}`}>
      <div className="archive-page-media">
        <img src={edition.image} alt={`${edition.year} SPEAK gathering`} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-transparent to-transparent" />
        <span className="absolute top-5 left-5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white backdrop-blur">Highlight reel · 02:14</span>
        <button type="button" className="archive-play" aria-label={`Play ${edition.year} highlight reel`}><Play className="h-5 w-5 fill-current" /></button>
        <span className="absolute bottom-5 left-5 font-mono text-xs text-[#E6B800]">SPEAK / {edition.year.slice(2)}</span>
      </div>
      <div className="archive-page-copy">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs text-[#E6B800]">0{index + 1} / 02</span>
            <h2 className="mt-2 font-heading text-3xl sm:text-4xl font-bold text-white">{edition.year}: {edition.theme}</h2>
            <p className="mt-2 text-sm text-gray-500">{edition.descriptor}</p>
          </div>
          <Mic2 className="h-7 w-7 text-[#E6B800] shrink-0" />
        </div>
        <Quote className="mt-12 h-8 w-8 text-[#E6B800]" />
        <blockquote className="mt-4 font-heading text-2xl sm:text-3xl leading-tight text-white">“{edition.quote}”</blockquote>
        <div className="mt-7 border-t border-white/10 pt-4">
          <p className="text-sm font-semibold text-white">{edition.speaker}</p>
          <p className="mt-1 text-xs text-gray-500">{edition.role}</p>
        </div>
      </div>
    </article>
  );
}

export default function Archive() {
  return (
    <div className="archive-page">
      <section className="archive-page-hero">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#E6B800] transition-colors"><ArrowLeft className="h-4 w-4" /> Back home</Link>
          <div className="mt-16 max-w-3xl">
            <span className="text-xs uppercase tracking-[0.3em] text-[#E6B800]">The SPEAK archive</span>
            <h1 className="mt-4 font-heading font-extrabold text-5xl sm:text-7xl leading-[0.95] text-white">Echoes worth <span className="gold-text-gradient">carrying forward.</span></h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-gray-400">A moving record of the voices, ideas and moments that stayed with us after the room emptied.</p>
          </div>
          <div className="archive-page-meta mt-12"><span><strong>02</strong> editions captured</span><span><strong>18</strong> voices on record</span><span><strong>∞</strong> ideas still in motion</span></div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24 space-y-10">
        {editions.map((edition, index) => <Edition key={edition.year} edition={edition} index={index} />)}
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20"><Link to="/register" className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"><span className="font-heading text-xl text-white">Be part of the next edition.</span><span className="inline-flex items-center gap-2 text-sm text-[#E6B800]">Claim your pass <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link></section>
    </div>
  );
}
