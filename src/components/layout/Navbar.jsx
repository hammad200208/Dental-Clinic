import { useState, useEffect, useRef } from "react";
import { FaBell, FaSearch, FaCog, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { patientService } from "../../services/patientServices";
import { appointmentService } from "../../services/appointmentService";
import { settingsService } from "../../services/settingsService";

export default function Navbar() {
  const navigate = useNavigate();

  // ── Search ──
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const searchRef = useRef(null);

  // ── Notifications ──
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  // ✅ Dismiss a notification — stores key in localStorage
  const dismissNotification = (id, key) => {
    localStorage.setItem(`notif_dismissed:${id}`, key);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ✅ Check if a notification was already dismissed for same data
  const isDismissed = (id, key) => {
    return localStorage.getItem(`notif_dismissed:${id}`) === key;
  };

  // ── Profile ──
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  const settings = settingsService.getSettings();

  // Load patients once for search
  useEffect(() => {
    const load = async () => {
      const data = await patientService.getAll();
      setPatients(Array.isArray(data) ? data : []);
    };
    load();
  }, []);

  // Load notifications
  useEffect(() => {
    const load = async () => {
      const appointments = await appointmentService.getAll();
      const allPatients = await patientService.getAll();
      const full = await Promise.all(allPatients.map((p) => patientService.getById(p.id)));

      const todayStr = new Date().toLocaleDateString("en-CA");
      const now = new Date();
      const notifs = [];

      // Today's appointments
      const todayAppts = (appointments || []).filter(
        (a) => new Date(a.date).toLocaleDateString("en-CA") === todayStr && a.status !== "Completed"
      );
      if (todayAppts.length > 0) {
        const key = `${todayStr}:${todayAppts.length}`;
        if (!isDismissed("today", key)) {
          notifs.push({
            id: "today",
            key,
            type: "info",
            icon: "📅",
            message: `${todayAppts.length} appointment${todayAppts.length > 1 ? "s" : ""} today`,
            action: () => navigate("/appointments"),
          });
        }
      }

      // Overdue appointments
      const overdue = (appointments || []).filter(
        (a) => new Date(`${a.date} ${a.time}`) < now && a.status !== "Completed"
      );
      if (overdue.length > 0) {
        const key = `${overdue.length}`;
        if (!isDismissed("overdue", key)) {
          notifs.push({
            id: "overdue",
            key,
            type: "warning",
            icon: "⚠️",
            message: `${overdue.length} overdue appointment${overdue.length > 1 ? "s" : ""}`,
            action: () => navigate("/appointments"),
          });
        }
      }

      // Pending payments
      const withBalance = full.filter((p) => {
        if (!p) return false;
        const visits = p.visits || [];
        const total = visits.reduce((s, v) => s + (Number(v.amount) || 0), 0);
        const paid = visits.reduce((s, v) => s + (Number(v.paidAmount) || 0), 0);
        return total - paid > 0;
      });
      if (withBalance.length > 0) {
        const key = `${withBalance.length}`;
        if (!isDismissed("balance", key)) {
          notifs.push({
            id: "balance",
            key,
            type: "error",
            icon: "💰",
            message: `${withBalance.length} patient${withBalance.length > 1 ? "s" : ""} with pending balance`,
            action: () => navigate("/billing"),
          });
        }
      }

      setNotifications(notifs);
    };
    load();
  }, [navigate]);

  const searchResults = query.trim()
    ? patients
        .filter(
          (p) =>
            (p.name || "").toLowerCase().includes(query.toLowerCase()) ||
            (p.phone || "").includes(query)
        )
        .slice(0, 6)
    : [];

  const showSearch = query.trim().length > 0;

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setQuery("");
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const notifColors = {
    info: "bg-blue-50 text-blue-700",
    warning: "bg-yellow-50 text-yellow-700",
    error: "bg-red-50 text-red-700",
  };

  const initials = (settings.dentistName || settings.clinicName || "D")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 print:hidden">
      <div className="flex items-center justify-between gap-4">

        {/* ── Search ── */}
        <div className="relative w-full max-w-md" ref={searchRef}>
          <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient by name or phone..."
            className="w-full pl-10 pr-10 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); }}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <FaTimes size={14} />
            </button>
          )}

          {/* Search dropdown */}
          {showSearch && (
            <div className="absolute top-12 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400">No patients found</div>
              ) : (
                searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      navigate(`/patients/${p.id}`);
                      setQuery("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-100 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {(p.name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.phone || "No phone"}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">

          {/* ── Notifications ── */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              className="relative p-1"
            >
              <FaBell size={20} className="text-slate-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-semibold text-slate-700">Notifications</p>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-slate-400 text-center">All clear — nothing to action</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0"
                    >
                      <button
                        onClick={() => { n.action(); setShowNotif(false); }}
                        className="flex items-center gap-3 flex-1 hover:bg-slate-50 rounded-lg text-left"
                      >
                        <span className="text-xl">{n.icon}</span>
                        <p className={`text-sm font-medium px-2 py-1 rounded-lg ${notifColors[n.type]}`}>
                          {n.message}
                        </p>
                      </button>
                      <button
                        onClick={() => dismissNotification(n.id, n.key)}
                        className="text-slate-300 hover:text-slate-500 p-1 rounded-lg hover:bg-slate-100 shrink-0"
                        title="Dismiss"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Profile ── */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              className="flex items-center gap-3 hover:bg-slate-50 rounded-xl px-3 py-2 transition"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-medium text-sm">{settings.dentistName || "Doctor"}</p>
                <p className="text-xs text-slate-500">{settings.clinicName || "Dental Clinic"}</p>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 top-14 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-semibold text-sm">{settings.dentistName || "Doctor"}</p>
                  <p className="text-xs text-slate-400">{settings.clinicName}</p>
                  {settings.phone && <p className="text-xs text-slate-400 mt-1">{settings.phone}</p>}
                </div>
                <button
                  onClick={() => { navigate("/settings"); setShowProfile(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-sm text-slate-700"
                >
                  <FaCog size={14} />
                  Go to Settings
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}