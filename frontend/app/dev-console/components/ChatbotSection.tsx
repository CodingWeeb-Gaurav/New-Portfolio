"use client";
import { useState, useEffect } from "react";
import { apiRequest, apiFormRequest } from "@/services/api";

interface Props { requireAuth: (cb: () => void) => void; toast: (msg: string, type?: string) => void; }

interface Stats { leetcode?: Record<string, unknown>; codeforces?: Record<string, unknown>; github?: Record<string, unknown>; last_updated?: string; }

export default function ChatbotSection({ requireAuth, toast }: Props) {
    const [stats, setStats] = useState<Stats | null>(null);
    const [embedFile, setEmbedFile] = useState<File | null>(null);
    const [deleteFilename, setDeleteFilename] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);

    async function fetchStats() {
        setLoadingStats(true);
        try { const data = await apiRequest("/profile/stats"); setStats(data); }
        catch (e) { toast(e instanceof Error ? e.message : "Failed to fetch stats", "error"); }
        finally { setLoadingStats(false); }
    }

    useEffect(() => { fetchStats(); }, []);

    async function uploadEmbeddings() {
        if (!embedFile) { toast("Select a file first", "error"); return; }
        setLoading(true);
        try {
            const fd = new FormData(); fd.append("file", embedFile);
            await apiFormRequest("/profile/embeddings", "PUT", fd);
            setEmbedFile(null); toast("Embeddings uploaded!", "success");
        } catch (e) { toast(e instanceof Error ? e.message : "Failed", "error"); }
        finally { setLoading(false); }
    }

    async function deleteEmbeddings() {
        if (!deleteFilename.trim()) { toast("Enter a filename", "error"); return; }
        setLoading(true);
        try {
            await apiRequest(`/profile/embeddings?filename=${encodeURIComponent(deleteFilename)}`, "DELETE");
            setDeleteFilename(""); toast("Embeddings file deleted!", "success");
        } catch (e) { toast(e instanceof Error ? e.message : "Failed", "error"); }
        finally { setLoading(false); }
    }

    const StatBlock = ({ label, data }: { label: string; data?: Record<string, unknown> }) => {
        if (!data) return <div className="card"><div className="card-title">{label}</div><p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>No data cached</p></div>;
        return (
            <div className="card">
                <div className="card-title">{label}</div>
                <pre style={{ background: "var(--surface)", padding: 12, borderRadius: 8, fontSize: "0.77rem", color: "var(--text-dim)", overflowX: "auto", maxHeight: 200 }}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        );
    };

    return (
        <div>
            <div className="section-header">
                <h2>🤖 Chatbot Data</h2>
                <p>Manage profile embeddings for the AI chatbot and view social stats cache.</p>
            </div>

            {/* Embeddings */}
            <div className="card">
                <div className="card-title"><span>📦</span> Profile Embeddings</div>
                <p style={{ fontSize: "0.84rem", color: "var(--text-dim)", marginBottom: 14 }}>Upload an embeddings file (.pkl / .json / .npy etc.) for the AI chatbot to use.</p>
                <div className="form-group">
                    <label className="form-label">Upload Embeddings File</label>
                    <input className="form-input" type="file" onChange={e => setEmbedFile(e.target.files?.[0] || null)} />
                </div>
                <button className="btn btn-success" disabled={loading || !embedFile} onClick={() => requireAuth(uploadEmbeddings)}>
                    {loading ? "Uploading…" : "⬆ Upload"}
                </button>
            </div>

            <div className="card">
                <div className="card-title"><span>🗑</span> Delete Embeddings File</div>
                <div className="inline-pair">
                    <input className="form-input" placeholder="filename.pkl" value={deleteFilename} onChange={e => setDeleteFilename(e.target.value)} />
                    <button className="btn btn-danger" disabled={loading} onClick={() => requireAuth(deleteEmbeddings)}>Delete</button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div><strong style={{ fontSize: "1rem" }}>📊 Cached Profile Stats</strong><p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>{stats?.last_updated ? `Last updated: ${new Date(stats.last_updated).toLocaleString()}` : "Not fetched yet"}</p></div>
                    <button className="btn btn-ghost btn-sm" disabled={loadingStats} onClick={fetchStats}>{loadingStats ? "Fetching…" : "🔄 Refresh"}</button>
                </div>
                <div className="two-col">
                    <StatBlock label="⚡ LeetCode" data={stats?.leetcode as Record<string, unknown>} />
                    <StatBlock label="🏆 Codeforces" data={stats?.codeforces as Record<string, unknown>} />
                </div>
                <StatBlock label="🐙 GitHub" data={stats?.github as Record<string, unknown>} />
            </div>
        </div>
    );
}
