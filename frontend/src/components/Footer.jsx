import { Link } from "react-router-dom";
import { MapPin, Mail, Calendar } from "lucide-react";
import { SpeakLogo } from "@/components/SpeakLogo";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-amber-500/15 bg-[#07080B] mt-24" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <SpeakLogo />
          <p className="mt-4 text-sm text-gray-400 max-w-sm leading-relaxed">
            THE OUTPOST: A Generation Positioned for Impact. Solving Problems Existing Anywhere Through Knowledge.
          </p>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-white text-sm mb-4">Explore</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-[#E6B800] transition-colors">Home</Link></li>
            <li><Link to="/event-details" className="hover:text-[#E6B800] transition-colors">Event Details</Link></li>
            <li><Link to="/faq" className="hover:text-[#E6B800] transition-colors">FAQ</Link></li>
            <li><Link to="/register" className="hover:text-[#E6B800] transition-colors">Register</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-heading font-semibold text-white text-sm mb-4">Event</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-2"><Calendar className="h-4 w-4 text-[#E6B800] shrink-0 mt-0.5" /> October 1, 2026</li>
            <li className="flex gap-2"><MapPin className="h-4 w-4 text-[#E6B800] shrink-0 mt-0.5" /> Royal Event Center, behind Niger Motel, Suleja, Niger State</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 text-[#E6B800] shrink-0 mt-0.5" /> hello@speakcon.com</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-gray-500">
        © 2026 SPEAK Conference. All rights reserved.
      </div>
    </footer>
  );
}
