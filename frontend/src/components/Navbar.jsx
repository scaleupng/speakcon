import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Coins, LogOut } from "lucide-react";
import { SpeakLogo } from "@/components/SpeakLogo";
import { useAuth } from "@/context/AuthContext";

const links = [
  { label: "Home", to: "/" },
  { label: "Details", to: "/event-details" },
  { label: "FAQ", to: "/faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const ownedBalance = user
    ? Number(user.totalSpeakBalance ?? (Number(user.speakCoinBalance || 0) + Number(user.pendingSpeakBalance || 0)))
    : 0;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo-link"><SpeakLogo /></Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-[#E6B800] ${isActive ? "text-[#E6B800]" : "text-gray-300"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" data-testid="nav-dashboard-btn" className="flex items-center gap-2 text-sm font-medium text-gray-200 hover:text-[#E6B800] transition-colors">
                <Coins className="h-4 w-4 text-[#E6B800]" />
                {ownedBalance} COIN
              </Link>
              <button onClick={handleLogout} data-testid="nav-logout-btn" className="outline-gold-btn rounded-full px-4 py-2 text-sm flex items-center gap-1.5">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" data-testid="nav-login-btn" className="outline-gold-btn rounded-full px-5 py-2 text-sm">Login</Link>
              <Link to="/register" data-testid="nav-register-btn" className="gold-btn rounded-full px-5 py-2 text-sm">Register Now</Link>
            </>
          )}
        </div>

        <button className="md:hidden text-gray-200" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-amber-500/10 px-5 py-4 space-y-3" data-testid="nav-mobile-menu">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="block text-gray-200 hover:text-[#E6B800] py-1">{l.label}</NavLink>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-[#E6B800] py-1">Dashboard ({ownedBalance} COIN)</Link>
              <button onClick={handleLogout} className="outline-gold-btn rounded-full px-4 py-2 text-sm w-full">Logout</button>
            </>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" onClick={() => setOpen(false)} className="outline-gold-btn rounded-full px-4 py-2 text-sm flex-1 text-center">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="gold-btn rounded-full px-4 py-2 text-sm flex-1 text-center">Register</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
