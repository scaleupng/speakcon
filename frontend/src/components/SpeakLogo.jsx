export function SpeakLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`} data-testid="speak-logo">
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
        <img src="/brand/speak_logo.png" alt="SPEAK Conference" className="h-full w-full object-contain" />
      </div>
      <div className="leading-none">
        <div className="font-heading font-extrabold tracking-tight text-white text-lg">SPEAK</div>
        <div className="text-[9px] tracking-[0.28em] text-gray-400 uppercase mt-1">Annual Conference</div>
      </div>
    </div>
  );
}
