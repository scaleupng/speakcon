export function SpeakLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} data-testid="speak-logo">
      <div className="relative grid place-items-center h-9 w-9 rounded-lg border border-amber-500/40 bg-[#0E1117] shadow-[0_0_18px_rgba(230,184,0,0.25)]">
        <span className="font-heading font-extrabold text-[#E6B800] text-lg leading-none">S</span>
      </div>
      <div className="leading-none">
        <div className="font-heading font-extrabold tracking-tight text-white text-lg">
          SPEAK <span className="text-[#E6B800]">2026</span>
        </div>
        <div className="text-[9px] tracking-[0.35em] text-gray-400 uppercase mt-0.5">Conference</div>
      </div>
    </div>
  );
}
