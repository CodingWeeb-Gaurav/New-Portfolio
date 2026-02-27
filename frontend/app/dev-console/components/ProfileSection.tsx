"use client";
import { useState, useEffect } from "react";
import { apiRequest, apiFormRequest } from "@/services/api";
import { saveToStorage, getFromStorage } from "@/services/adminData";

/* ── types ── */
interface Highlight { title: string; subtitle: string; enabled: boolean; }
interface WhatIDo { title: string; subtitle: string; enabled: boolean; }
interface Contact { email: string; phone: string; location: string; enabled: boolean; }
interface ProfileData {
    github_url?: string; linkedin_url?: string;
    resume_webdev?: string; resume_ai_ml?: string;
    description1?: string; description2?: string;
    highlights: Highlight[]; what_i_do: WhatIDo[];
    soft_skills: string[]; contact?: Contact; enabled: boolean;
}

interface Props { requireAuth: (cb: () => void) => void; toast: (msg: string, type?: string) => void; }

const BLANK_DATA: ProfileData = {
    github_url: "", linkedin_url: "", resume_webdev: "", resume_ai_ml: "",
    description1: "", description2: "",
    highlights: [], what_i_do: [], soft_skills: [], contact: { email: "", phone: "", location: "", enabled: true },
    enabled: true,
};

export default function ProfileSection({ requireAuth, toast }: Props) {
    const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
    const [tab, setTab] = useState<"profile" | "aboutme" | "image" | "password">("profile");
    const [data, setData] = useState<ProfileData>(BLANK_DATA);
    const [aboutMe, setAboutMe] = useState("");
    const [imageInfo, setImageInfo] = useState<{ image_url?: string; enabled?: boolean }>({});
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [newSkill, setNewSkill] = useState("");
    const [loading, setLoading] = useState(false);

    // change password state
    const [curPw, setCurPw] = useState(""); const [newPw, setNewPw] = useState("");

    useEffect(() => {
        // Load from localStorage first for instant display
        const cached = getFromStorage<ProfileData>("profileData");
        if (cached) setData({ ...BLANK_DATA, ...cached });
        const cachedAbout = getFromStorage<string>("aboutMe");
        if (cachedAbout) setAboutMe(typeof cachedAbout === "string" ? cachedAbout : "");
        const cachedImg = getFromStorage<{ image_url?: string; enabled?: boolean }>("profileImage");
        if (cachedImg) setImageInfo(cachedImg);

        // Refresh from backend
        apiRequest("/profile/data").then((d) => { if (d) setData({ ...BLANK_DATA, ...d }); }).catch(() => { });
        apiRequest("/profile/aboutme").then((d) => { if (d?.content !== undefined) setAboutMe(d.content); }).catch(() => { });
        apiRequest("/profile/image").then((d) => { if (d) setImageInfo(d); }).catch(() => { });
    }, []);

    /* ── apply (local storage) ── */
    function applyChanges() {
        saveToStorage("profileData", data);
        saveToStorage("aboutMe", aboutMe);
        if (imageInfo) saveToStorage("profileImage", imageInfo);
        toast("Changes applied to local storage! Portfolio preview updated.", "success");
    }

    /* ── submit profile data ── */
    async function submitProfileData() {
        setLoading(true);
        try {
            await apiRequest("/profile/data", "PUT", data);
            saveToStorage("profileData", data);
            toast("Profile data saved to backend!", "success");
        } catch (e) { toast(e instanceof Error ? e.message : "Failed", "error"); }
        finally { setLoading(false); }
    }

    /* ── submit about me ── */
    async function submitAboutMe() {
        setLoading(true);
        try {
            await apiRequest("/profile/aboutme", "PUT", { content: aboutMe });
            saveToStorage("aboutMe", aboutMe);
            toast("About Me saved!", "success");
        } catch (e) { toast(e instanceof Error ? e.message : "Failed", "error"); }
        finally { setLoading(false); }
    }

    /* ── submit profile image ── */
    async function submitImage() {
        if (!imageFile) { toast("Select an image first", "error"); return; }
        setLoading(true);
        try {
            const fd = new FormData(); fd.append("file", imageFile);
            const res = await apiFormRequest("/profile/image", "PUT", fd);
            const updated = { image_url: res.image_url, enabled: true };
            setImageInfo(updated); saveToStorage("profileImage", updated);
            toast("Profile image uploaded!", "success");
        } catch (e) { toast(e instanceof Error ? e.message : "Failed", "error"); }
        finally { setLoading(false); }
    }

    /* ── delete profile image ── */
    async function deleteImage() {
        setLoading(true);
        try {
            await apiRequest("/profile/image", "DELETE");
            setImageInfo({}); saveToStorage("profileImage", {});
            toast("Profile image removed", "success");
        } catch (e) { toast(e instanceof Error ? e.message : "Failed", "error"); }
        finally { setLoading(false); }
    }

    /* ── change password ── */
    async function submitChangePassword() {
        if (!curPw || !newPw) { toast("Fill both fields", "error"); return; }
        setLoading(true);
        try {
            await apiRequest("/auth/change-password", "POST", { current_password: curPw, new_password: newPw });
            setCurPw(""); setNewPw("");
            toast("Password changed successfully!", "success");
        } catch (e) { toast(e instanceof Error ? e.message : "Failed to change password", "error"); }
        finally { setLoading(false); }
    }

    /* ── helpers for dynamic lists ── */
    function addHighlight() { setData((d) => ({ ...d, highlights: [...d.highlights, { title: "", subtitle: "", enabled: true }] })); }
    function updateHighlight(i: number, field: keyof Highlight, val: string | boolean) {
        setData((d) => { const arr = [...d.highlights]; arr[i] = { ...arr[i], [field]: val }; return { ...d, highlights: arr }; });
    }
    function removeHighlight(i: number) { setData((d) => ({ ...d, highlights: d.highlights.filter((_, idx) => idx !== i) })); }

    function addWhatIDo() { setData((d) => ({ ...d, what_i_do: [...d.what_i_do, { title: "", subtitle: "", enabled: true }] })); }
    function updateWhatIDo(i: number, field: keyof WhatIDo, val: string | boolean) {
        setData((d) => { const arr = [...d.what_i_do]; arr[i] = { ...arr[i], [field]: val }; return { ...d, what_i_do: arr }; });
    }
    function removeWhatIDo(i: number) { setData((d) => ({ ...d, what_i_do: d.what_i_do.filter((_, idx) => idx !== i) })); }

    function addSoftSkill() {
        if (!newSkill.trim()) return;
        setData((d) => ({ ...d, soft_skills: [...d.soft_skills, newSkill.trim()] }));
        setNewSkill("");
    }
    function removeSoftSkill(i: number) { setData((d) => ({ ...d, soft_skills: d.soft_skills.filter((_, idx) => idx !== i) })); }

    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : (imageInfo.image_url ? `${BASE}/${imageInfo.image_url}` : null);

    return (
        <div>
            <div className="section-header">
                <h2>👤 Profile</h2>
                <p>Manage your portfolio profile data, about me content, and profile image.</p>
            </div>

            {/* Apply / Submit strip */}
            <div className="action-strip">
                <span className="action-strip-text">📋 Edit your profile below. Apply previews locally; Submit saves to the backend.</span>
                <button className="btn btn-warning btn-sm" onClick={applyChanges}>⚡ Apply (Preview)</button>
                <button className="btn btn-success btn-sm" disabled={loading} onClick={() => requireAuth(submitProfileData)}>
                    {loading ? "Saving…" : "✅ Submit All"}
                </button>
            </div>

            {/* Tab bar */}
            <div className="tab-bar">
                {(["profile", "aboutme", "image", "password"] as const).map((t) => (
                    <button key={t} className={`tab-btn${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                        {{ profile: "📊 Profile Data", aboutme: "📝 About Me", image: "🖼 Image", password: "🔑 Password" }[t]}
                    </button>
                ))}
            </div>

            {/* ── PROFILE DATA TAB ── */}
            {tab === "profile" && (
                <div>
                    <div className="card">
                        <div className="card-title"><span>🔗</span> Links & URLs</div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">GitHub URL</label><input className="form-input" placeholder="https://github.com/..." value={data.github_url || ""} onChange={(e) => setData(d => ({ ...d, github_url: e.target.value }))} /></div>
                            <div className="form-group"><label className="form-label">LinkedIn URL</label><input className="form-input" placeholder="https://linkedin.com/in/..." value={data.linkedin_url || ""} onChange={(e) => setData(d => ({ ...d, linkedin_url: e.target.value }))} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label className="form-label">Resume (Web Dev)</label><input className="form-input" placeholder="URL to resume" value={data.resume_webdev || ""} onChange={(e) => setData(d => ({ ...d, resume_webdev: e.target.value }))} /></div>
                            <div className="form-group"><label className="form-label">Resume (AI/ML)</label><input className="form-input" placeholder="URL to resume" value={data.resume_ai_ml || ""} onChange={(e) => setData(d => ({ ...d, resume_ai_ml: e.target.value }))} /></div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-title"><span>📝</span> Descriptions</div>
                        <div className="form-group"><label className="form-label">Description 1</label><textarea className="form-textarea" rows={3} value={data.description1 || ""} onChange={(e) => setData(d => ({ ...d, description1: e.target.value }))} /></div>
                        <div className="form-group"><label className="form-label">Description 2</label><textarea className="form-textarea" rows={3} value={data.description2 || ""} onChange={(e) => setData(d => ({ ...d, description2: e.target.value }))} /></div>
                    </div>

                    <div className="card">
                        <div className="card-title"><span>📞</span> Contact Info</div>
                        <div className="form-row-3">
                            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={data.contact?.email || ""} onChange={(e) => setData(d => ({ ...d, contact: { ...d.contact!, email: e.target.value } }))} /></div>
                            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={data.contact?.phone || ""} onChange={(e) => setData(d => ({ ...d, contact: { ...d.contact!, phone: e.target.value } }))} /></div>
                            <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={data.contact?.location || ""} onChange={(e) => setData(d => ({ ...d, contact: { ...d.contact!, location: e.target.value } }))} /></div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-title"><span>⭐</span> Highlights ({data.highlights.length})</div>
                        {data.highlights.map((h, i) => (
                            <div className="dynamic-item" key={i}>
                                <div className="dynamic-item-fields">
                                    <div className="dynamic-item-row">
                                        <input className="form-input" placeholder="Title" value={h.title} onChange={(e) => updateHighlight(i, "title", e.target.value)} />
                                        <input className="form-input" placeholder="Subtitle" value={h.subtitle} onChange={(e) => updateHighlight(i, "subtitle", e.target.value)} />
                                    </div>
                                    <label style={{ fontSize: "0.78rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                                        <input type="checkbox" checked={h.enabled} onChange={(e) => updateHighlight(i, "enabled", e.target.checked)} /> Enabled
                                    </label>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => removeHighlight(i)}>✕</button>
                            </div>
                        ))}
                        <button className="btn btn-ghost btn-sm" onClick={addHighlight}>+ Add Highlight</button>
                    </div>

                    <div className="card">
                        <div className="card-title"><span>💼</span> What I Do ({data.what_i_do.length})</div>
                        {data.what_i_do.map((w, i) => (
                            <div className="dynamic-item" key={i}>
                                <div className="dynamic-item-fields">
                                    <div className="dynamic-item-row">
                                        <input className="form-input" placeholder="Title" value={w.title} onChange={(e) => updateWhatIDo(i, "title", e.target.value)} />
                                        <input className="form-input" placeholder="Subtitle" value={w.subtitle} onChange={(e) => updateWhatIDo(i, "subtitle", e.target.value)} />
                                    </div>
                                    <label style={{ fontSize: "0.78rem", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                                        <input type="checkbox" checked={w.enabled} onChange={(e) => updateWhatIDo(i, "enabled", e.target.checked)} /> Enabled
                                    </label>
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={() => removeWhatIDo(i)}>✕</button>
                            </div>
                        ))}
                        <button className="btn btn-ghost btn-sm" onClick={addWhatIDo}>+ Add Item</button>
                    </div>

                    <div className="card">
                        <div className="card-title"><span>🧠</span> Soft Skills</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                            {data.soft_skills.map((s, i) => (
                                <span key={i} className="badge badge-purple" style={{ gap: 6 }}>
                                    {s}
                                    <button onClick={() => removeSoftSkill(i)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, fontSize: "0.85rem" }}>✕</button>
                                </span>
                            ))}
                        </div>
                        <div className="inline-pair">
                            <input className="form-input" placeholder="Add soft skill…" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSoftSkill()} />
                            <button className="btn btn-ghost btn-sm" onClick={addSoftSkill}>+ Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ABOUT ME TAB ── */}
            {tab === "aboutme" && (
                <div className="card">
                    <div className="card-title"><span>📝</span> About Me (Markdown)</div>
                    <textarea className="textarea-code" rows={20} value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} placeholder="# About Me&#10;Write your about me in Markdown..." />
                    <div className="btn-group">
                        <button className="btn btn-warning" onClick={applyChanges}>⚡ Apply</button>
                        <button className="btn btn-success" disabled={loading} onClick={() => requireAuth(submitAboutMe)}>
                            {loading ? "Saving…" : "✅ Submit"}
                        </button>
                    </div>
                </div>
            )}

            {/* ── IMAGE TAB ── */}
            {tab === "image" && (
                <div className="card">
                    <div className="card-title"><span>🖼</span> Profile Image</div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
                        <div>
                            {imageUrl
                                ? <img src={imageUrl} alt="profile" className="profile-img-preview" />
                                : <div className="profile-img-placeholder">👤</div>}
                            <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                                {imageInfo.enabled ? <span className="badge badge-green">Enabled</span> : <span className="badge badge-red">Disabled</span>}
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="form-group">
                                <label className="form-label">Upload New Image</label>
                                <input className="form-input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                                <div className="form-hint">Replaces the current profile image.</div>
                            </div>
                            <div className="btn-group">
                                <button className="btn btn-success" disabled={loading || !imageFile} onClick={() => requireAuth(submitImage)}>
                                    {loading ? "Uploading…" : "⬆ Upload"}
                                </button>
                                {imageInfo.image_url && (
                                    <button className="btn btn-danger" disabled={loading} onClick={() => requireAuth(deleteImage)}>🗑 Delete Image</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CHANGE PASSWORD TAB ── */}
            {tab === "password" && (
                <div className="card">
                    <div className="card-title"><span>🔑</span> Change Password</div>
                    <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">New Password</label><input className="form-input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
                    <div className="btn-group">
                        <button className="btn btn-primary" disabled={loading} onClick={() => requireAuth(submitChangePassword)}>
                            {loading ? "Changing…" : "🔒 Change Password"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
