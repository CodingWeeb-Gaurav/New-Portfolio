/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import "./admin.css";
import { fetchAllData } from "@/services/adminData";
import { apiRequest } from "@/services/api";
import LoginModal from "./components/LoginModal";
import ProfileSection from "./components/ProfileSection";
import SkillsSection from "./components/SkillsSection";
import ProjectsSection from "./components/ProjectsSection";
import TimelineSection from "./components/TimelineSection";
import ChatbotSection from "./components/ChatbotSection";

type Section = "profile" | "skills" | "projects" | "timeline" | "chatbot" | "rawapi";

interface Toast { id: number; msg: string; type: string; }

const NAV = [
  { id: "profile", icon: "👤", label: "Profile" },
  { id: "skills", icon: "🛠", label: "Skills" },
  { id: "projects", icon: "🗂", label: "Projects" },
  { id: "timeline", icon: "⏳", label: "Timeline" },
  { id: "chatbot", icon: "🤖", label: "Chatbot Data" },
  { id: "rawapi", icon: "⚡", label: "Raw API Tester" },
] as const;

// Placeholder visitor stats — replace with real tracking later
const VISITOR_STATS = [
  { icon: "👁", value: "1,247", label: "Portfolio Visits", change: "+12% this week" },
  { icon: "💬", value: "89", label: "Chatbot Interactions", change: "+5 today" },
  { icon: "📂", value: "34", label: "Resume Downloads", change: "This month" },
  { icon: "⭐", value: "312", label: "GitHub Stars", change: "Across repos" },
  { icon: "🔥", value: "7", label: "Active Days Streak", change: "Current streak" },
];

export default function DevConsole() {
  const [section, setSection] = useState<Section>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [fetching, setFetching] = useState(true);
  const toastCounter = useRef(0);

  // Raw API tester state
  const [rawEndpoint, setRawEndpoint] = useState("/api/skills/");
  const [rawMethod, setRawMethod] = useState("GET");
  const [rawBody, setRawBody] = useState("{}");
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [rawLoading, setRawLoading] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
    // Hydrate localStorage with all backend GET data
    fetchAllData().finally(() => setFetching(false));
  }, []);

  /* ── Toast helper ── */
  const toast = useCallback((msg: string, type = "success") => {
    const id = ++toastCounter.current;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  /* ── Auth gate: run callback only if logged in, else open modal ── */
  const requireAuth = useCallback((cb: () => void) => {
    if (localStorage.getItem("access_token")) { cb(); return; }
    setLoginMessage("You need to log in to submit changes.");
    setPendingAction(() => cb);
    setLoginOpen(true);
  }, []);

  function handleLoginSuccess() {
    setIsLoggedIn(true);
    setLoginOpen(false);
    toast("Logged in successfully!", "success");
    if (pendingAction) { pendingAction(); setPendingAction(null); }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    toast("Logged out.", "info");
  }

  /* ── Raw API Tester ── */
  async function runRaw() {
    setRawLoading(true); setRawResponse(null);
    try {
      const body = rawMethod !== "GET" && rawMethod !== "DELETE" ? JSON.parse(rawBody) : undefined;
      const data = await apiRequest(rawEndpoint, rawMethod, body);
      setRawResponse(data);
    } catch (e: any) {
      setRawResponse({ error: e.message });
    }
    finally { setRawLoading(false); }
  }

  /* ── Section nav ── */
  function navigate(id: Section) { setSection(id); setSidebarOpen(false); }

  const sectionProps = { requireAuth, toast };

  return (
    <div className="admin-root">

      {/* ── SIDEBAR BACKDROP (mobile) ── */}
      <div
        className={`sidebar-backdrop${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="admin-sidebar-logo">
          <div className="logo-badge">Admin Panel</div>
          <h2>Dev Console</h2>
          <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", marginTop: 4 }}>
            {fetching ? "⏳ Fetching data…" : "✅ Data loaded"}
          </div>
        </div>

        <nav className="admin-nav">
          <div className="nav-section-label">Navigation</div>
          {NAV.map(({ id, icon, label }) => (
            <button
              key={id}
              className={`admin-nav-item${section === id ? " active" : ""}`}
              onClick={() => navigate(id as Section)}
            >
              <span className="nav-icon">{icon}</span> {label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
          {isLoggedIn ? (
            <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={handleLogout}>🚪 Logout</button>
          ) : (
            <button className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={() => { setLoginMessage(undefined); setLoginOpen(true); }}>🔐 Login</button>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="admin-main">

        {/* ── TOPBAR ── */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <span className="topbar-title">
              {NAV.find(n => n.id === section)?.icon} {NAV.find(n => n.id === section)?.label}
            </span>
          </div>
          <div className="topbar-right">
            <div className={`auth-badge ${isLoggedIn ? "in" : "out"}`}>
              {isLoggedIn ? "🟢 Logged in" : "🔴 Not logged in"}
            </div>
            {isLoggedIn ? (
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => { setLoginMessage(undefined); setLoginOpen(true); }}>🔐 Login</button>
            )}
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div className="admin-content">

          {/* Visitor Stats Bar — shown on every section */}
          <div className="stats-bar" style={{ marginBottom: 24 }}>
            {VISITOR_STATS.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-change">{s.change}</div>
              </div>
            ))}
          </div>

          {/* ── SECTIONS ── */}
          {section === "profile" && <ProfileSection  {...sectionProps} />}
          {section === "skills" && <SkillsSection   {...sectionProps} />}
          {section === "projects" && <ProjectsSection {...sectionProps} />}
          {section === "timeline" && <TimelineSection {...sectionProps} />}
          {section === "chatbot" && <ChatbotSection  {...sectionProps} />}

          {/* ── RAW API TESTER ── */}
          {section === "rawapi" && (
            <div>
              <div className="section-header"><h2>⚡ Raw API Tester</h2><p>Send any request directly to the backend. Useful for debugging and testing endpoints.</p></div>
              <div className="card">
                <div className="card-title"><span>🔌</span> Request</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <select className="form-select" style={{ width: 120, flex: "none" }} value={rawMethod} onChange={e => setRawMethod(e.target.value)}>
                    {["GET", "POST", "PUT", "DELETE", "PATCH"].map(m => <option key={m}>{m}</option>)}
                  </select>
                  <input className="form-input" style={{ flex: 1, minWidth: 200 }} value={rawEndpoint} onChange={e => setRawEndpoint(e.target.value)} placeholder="/api/skills/" />
                </div>
                {rawMethod !== "GET" && rawMethod !== "DELETE" && (
                  <div className="form-group">
                    <label className="form-label">Request Body (JSON)</label>
                    <textarea className="textarea-code" rows={8} value={rawBody} onChange={e => setRawBody(e.target.value)} />
                  </div>
                )}
                <button className="btn btn-primary" disabled={rawLoading} onClick={runRaw}>{rawLoading ? "Sending…" : "▶ Send Request"}</button>
              </div>
              <div className="card">
                <div className="card-title"><span>📥</span> Response</div>
                <pre style={{ background: "var(--surface)", color: "#a8ff78", padding: 16, borderRadius: 8, fontSize: "0.8rem", overflowX: "auto", maxHeight: 500, fontFamily: "monospace" }}>
                  {rawResponse ? JSON.stringify(rawResponse, null, 2) : "No response yet…"}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── LOGIN MODAL ── */}
      {loginOpen && (
        <LoginModal
          message={loginMessage}
          onClose={() => { setLoginOpen(false); setPendingAction(null); }}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* ── TOASTS ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 2000 }}>
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type === "error" ? "error" : t.type === "info" ? "info" : "success"}`}>
            {t.type === "error" ? "❌" : t.type === "info" ? "ℹ️" : "✅"} {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}