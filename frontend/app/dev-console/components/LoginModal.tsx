"use client";
import { useState } from "react";
import { login } from "@/services/auth";

interface Props {
    onClose: () => void;
    onSuccess: () => void;
    message?: string;
}

export default function LoginModal({ onClose, onSuccess, message }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin() {
        if (!email || !password) { setError("Please fill in all fields"); return; }
        setLoading(true); setError("");
        try {
            await login(email, password);
            onSuccess();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Login failed");
        } finally { setLoading(false); }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-title">🔐 Admin Login</div>
                <div className="modal-subtitle">{message || "Sign in to access protected APIs"}</div>
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        className="form-input" type="email" placeholder="admin@example.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <div style={{ position: "relative" }}>
                        <input
                            className="form-input"
                            type={showPw ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                            style={{ paddingRight: 44 }}
                        />
                        <button
                            onClick={() => setShowPw(!showPw)}
                            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "1rem" }}
                        >{showPw ? "🙈" : "👁"}</button>
                    </div>
                </div>

                <div className="btn-group">
                    <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ flex: 1 }}>
                        {loading ? "Logging in…" : "Login"}
                    </button>
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
