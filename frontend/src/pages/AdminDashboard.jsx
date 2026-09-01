import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users, Clock, Coins, Share2, Search, Download, LogOut, Settings2,
  UserPlus, Save, Loader2, LayoutDashboard, Table2, GitBranch, ShieldCheck,
} from "lucide-react";
import { api, formatApiError, API } from "@/lib/api";
import { useAdmin } from "@/context/AdminContext";
import { SpeakLogo } from "@/components/SpeakLogo";

const statusStyles = {
  verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  expired: "bg-red-500/10 text-red-400 border-red-500/30",
};

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="glass rounded-2xl p-6" data-testid={`stat-${label.toLowerCase().replace(/[^a-z]/g, "")}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        <Icon className="h-5 w-5 text-[#E6B800]" />
      </div>
      <div className="mt-3 font-heading font-extrabold text-3xl text-white">{value}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [referrals, setReferrals] = useState([]);
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "" });
  const [addingAdmin, setAddingAdmin] = useState(false);

  const loadRows = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/registrations", { params: { search: search || undefined, status } });
      setRows(data);
    } catch (err) { toast.error(formatApiError(err)); }
  }, [search, status]);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => {});
    api.get("/admin/settings").then(({ data }) => setSettings(data)).catch(() => {});
    api.get("/admin/registrations").then(({ data }) => setRows(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === "registrations") loadRows();
    if (tab === "referrals") api.get("/admin/referrals").then(({ data }) => setReferrals(data)).catch(() => {});
    if (tab === "admins") api.get("/admin/admins").then(({ data }) => setAdmins(data)).catch(() => {});
  }, [tab, loadRows]);

  const handleLogout = () => { logout(); navigate("/admin"); };

  const exportCsv = async () => {
    try {
      const token = localStorage.getItem("speak_admin_token");
      const res = await fetch(`${API}/admin/export`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "speak2026_registrations.csv"; a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported.");
    } catch { toast.error("Export failed."); }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const { data } = await api.put("/admin/settings", {
        initialSpeakCoinReward: Number(settings.initialSpeakCoinReward),
        referralBonusReward: Number(settings.referralBonusReward),
        verificationExpiryHours: Number(settings.verificationExpiryHours),
        resendCooldownSeconds: Number(settings.resendCooldownSeconds),
      });
      setSettings(data);
      toast.success("Settings saved.");
    } catch (err) { toast.error(formatApiError(err)); }
    finally { setSavingSettings(false); }
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    setAddingAdmin(true);
    try {
      await api.post("/admin/admins", newAdmin);
      toast.success("Admin added.");
      setNewAdmin({ name: "", email: "", password: "" });
      const { data } = await api.get("/admin/admins");
      setAdmins(data);
    } catch (err) { toast.error(formatApiError(err)); }
    finally { setAddingAdmin(false); }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "registrations", label: "Registrations", icon: Table2 },
    { id: "referrals", label: "Referrals", icon: GitBranch },
    { id: "settings", label: "Coin Rules", icon: Settings2 },
    { id: "admins", label: "Admins", icon: ShieldCheck },
  ];

  return (
    <div className="grain min-h-screen bg-[#07080B]">
      {/* top bar */}
      <header className="relative z-10 glass border-b border-amber-500/15">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SpeakLogo />
            <span className="hidden sm:inline text-xs uppercase tracking-widest text-gray-500 border-l border-white/10 pl-4">Admin Console</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-sm text-gray-300">
              {admin?.name} <span className="text-[10px] uppercase bg-amber-500/10 text-[#E6B800] border border-amber-500/30 rounded-full px-2 py-0.5">{admin?.role}</span>
            </span>
            <button onClick={handleLogout} data-testid="admin-logout-btn" className="outline-gold-btn rounded-full px-4 py-2 text-sm flex items-center gap-1.5">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {/* tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} data-testid={`admin-tab-${t.id}`}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap border transition-colors ${tab === t.id ? "bg-[#E6B800] text-black border-transparent" : "border-amber-500/20 text-gray-300 hover:border-amber-500/50"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="mt-8 fade-up">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={Users} label="Verified Attendees" value={stats?.verifiedAttendees ?? "—"} />
              <StatCard icon={Clock} label="Pending" value={stats?.pendingRegistrations ?? "—"} />
              <StatCard icon={Share2} label="Referrals" value={stats?.totalReferrals ?? "—"} />
              <StatCard icon={Coins} label="Coins Issued" value={stats?.totalCoinsIssued ?? "—"} />
            </div>
            <div className="mt-6 card-tactical rounded-2xl p-7" data-testid="admin-recent-panel">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg text-white flex items-center gap-2"><Table2 className="h-5 w-5 text-[#E6B800]" /> Recent registrations</h2>
                <button onClick={() => setTab("registrations")} className="text-sm text-[#E6B800] hover:underline">View all →</button>
              </div>
              <div className="mt-5 space-y-3">
                {rows.length ? rows.slice(0, 6).map((r, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
                    <div>
                      <div className="text-sm text-white">{r.firstName} {r.lastName}</div>
                      <div className="text-xs text-gray-500">{r.email}</div>
                    </div>
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[r.status]}`}>{r.status}</span>
                  </div>
                )) : <p className="text-sm text-gray-500">No registrations yet. Share the site to get your first attendees.</p>}
              </div>
            </div>
          </div>
        )}

        {/* REGISTRATIONS */}
        {tab === "registrations" && (
          <div className="mt-8 fade-up">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} data-testid="admin-search-input"
                    placeholder="Search name, email, code…"
                    className="rounded-full bg-[#0E1117] border border-amber-500/20 pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 w-64" />
                </div>
                <select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="admin-status-filter"
                  className="rounded-full bg-[#0E1117] border border-amber-500/20 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50">
                  <option value="all">All statuses</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <button onClick={exportCsv} data-testid="admin-export-btn" className="gold-btn rounded-full px-5 py-2.5 text-sm flex items-center gap-2">
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>

            <div className="mt-6 card-tactical rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="admin-registrations-table">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-white/10">
                      <th className="px-5 py-4 font-medium">Name</th>
                      <th className="px-5 py-4 font-medium">Email</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 font-medium">Coin</th>
                      <th className="px-5 py-4 font-medium">Ref Code</th>
                      <th className="px-5 py-4 font-medium">Refs</th>
                      <th className="px-5 py-4 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length ? rows.map((r, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]" data-testid={`admin-row-${i}`}>
                        <td className="px-5 py-4 text-white">{r.firstName} {r.lastName}</td>
                        <td className="px-5 py-4 text-gray-300">{r.email}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[r.status]}`}>{r.status}</span>
                        </td>
                        <td className="px-5 py-4 text-[#E6B800] font-mono">{r.speakCoinBalance}</td>
                        <td className="px-5 py-4 font-mono text-gray-300">{r.ownReferralCode || "—"}</td>
                        <td className="px-5 py-4 text-gray-300">{r.referralCount}</td>
                        <td className="px-5 py-4 text-gray-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-500">No registrations found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REFERRALS */}
        {tab === "referrals" && (
          <div className="mt-8 card-tactical rounded-2xl overflow-hidden fade-up">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="admin-referrals-table">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-white/10">
                    <th className="px-5 py-4 font-medium">Code</th>
                    <th className="px-5 py-4 font-medium">Referrer</th>
                    <th className="px-5 py-4 font-medium">Referred</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.length ? referrals.map((r, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-5 py-4 font-mono text-[#E6B800]">{r.referralCode}</td>
                      <td className="px-5 py-4 text-white">{r.referrerName}<div className="text-xs text-gray-500">{r.referrerEmail}</div></td>
                      <td className="px-5 py-4 text-white">{r.referredName}<div className="text-xs text-gray-500">{r.referredEmail}</div></td>
                      <td className="px-5 py-4 text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-500">No referrals yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === "settings" && settings && (
          <div className="mt-8 max-w-2xl fade-up">
            <div className="glass rounded-2xl p-7">
              <h2 className="font-heading font-semibold text-xl text-white flex items-center gap-2"><Coins className="h-5 w-5 text-[#E6B800]" /> SPEAK COIN Rules</h2>
              <p className="mt-2 text-sm text-gray-400">Changes apply to new verifications only. Attendees already rewarded keep their balances.</p>
              <div className="mt-6 grid sm:grid-cols-2 gap-5">
                {[
                  { key: "initialSpeakCoinReward", label: "Initial reward (COIN)" },
                  { key: "referralBonusReward", label: "Referral bonus (COIN)" },
                  { key: "verificationExpiryHours", label: "Verification expiry (hours)" },
                  { key: "resendCooldownSeconds", label: "Resend cooldown (seconds)" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-300">{f.label}</label>
                    <input type="number" min="0" value={settings[f.key]} data-testid={`settings-${f.key}`}
                      onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                      className="mt-1.5 w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
                  </div>
                ))}
              </div>
              <button onClick={saveSettings} disabled={savingSettings} data-testid="settings-save-btn"
                className="mt-7 gold-btn rounded-full px-6 py-3 text-sm flex items-center gap-2 disabled:opacity-60">
                {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Rules
              </button>
            </div>
          </div>
        )}

        {/* ADMINS */}
        {tab === "admins" && (
          <div className="mt-8 grid lg:grid-cols-2 gap-6 fade-up">
            <div className="card-tactical rounded-2xl p-7">
              <h2 className="font-heading font-semibold text-lg text-white flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#E6B800]" /> Admin accounts</h2>
              <div className="mt-5 space-y-3">
                {admins.map((a) => (
                  <div key={a.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
                    <div>
                      <div className="text-white text-sm">{a.name}</div>
                      <div className="text-xs text-gray-500">{a.email}</div>
                    </div>
                    <span className="text-[10px] uppercase bg-amber-500/10 text-[#E6B800] border border-amber-500/30 rounded-full px-2 py-0.5">{a.role}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-7">
              <h2 className="font-heading font-semibold text-lg text-white flex items-center gap-2"><UserPlus className="h-5 w-5 text-[#E6B800]" /> Add new admin</h2>
              {admin?.role !== "superadmin" ? (
                <p className="mt-4 text-sm text-gray-400">Only the super admin can add new admins.</p>
              ) : (
                <form onSubmit={addAdmin} className="mt-5 space-y-4" data-testid="add-admin-form">
                  <input required placeholder="Full name" value={newAdmin.name} data-testid="add-admin-name"
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    className="w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
                  <input required type="email" placeholder="Email" value={newAdmin.email} data-testid="add-admin-email"
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
                  <input required type="password" placeholder="Password (min 8 chars)" value={newAdmin.password} data-testid="add-admin-password"
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="w-full rounded-xl bg-[#0E1117] border border-amber-500/20 px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
                  <button type="submit" disabled={addingAdmin} data-testid="add-admin-submit"
                    className="gold-btn rounded-full px-6 py-3 text-sm flex items-center gap-2 disabled:opacity-60">
                    {addingAdmin ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Add Admin
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
