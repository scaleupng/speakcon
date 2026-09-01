import { useEffect, useState } from "react";

const TARGET = new Date("2026-10-01T09:00:00+01:00").getTime();

function calc() {
  const diff = TARGET - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown() {
  const [t, setT] = useState(calc());
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  const items = [
    { label: "Days", value: t.days },
    { label: "Hours", value: t.hours },
    { label: "Minutes", value: t.minutes },
    { label: "Seconds", value: t.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-4" data-testid="countdown-timer">
      {items.map((i) => (
        <div key={i.label} className="glass rounded-xl px-3 sm:px-5 py-3 text-center min-w-[68px] sm:min-w-[86px]">
          <div className="font-mono font-semibold text-2xl sm:text-4xl text-[#E6B800] tabular-nums">
            {String(i.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 mt-1">{i.label}</div>
        </div>
      ))}
    </div>
  );
}
