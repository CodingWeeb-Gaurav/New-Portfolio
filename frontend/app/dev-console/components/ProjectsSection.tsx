"use client";
import { useState, useEffect, useCallback } from "react";
import { apiRequest, apiFormRequest } from "@/services/api";
import { saveToStorage, getFromStorage } from "@/services/adminData";

interface Category { id: string; name: string; description?: string; order: number; enabled: boolean; image_link?: string; }
interface Project { id: string; name: string; description: string, category_id: string; order: number; difficulty: number; date: string; github_url?: string; demo_url?: string; skills: string[]; enabled: boolean; image_link?: string; }

// Temporary interfaces for UI-only items
interface TempCategory extends Omit<Category, 'id' | 'order'> {
  id?: string;
  order: number | string;
  isTemp?: boolean;
  imageFile?: File | null;
  image_preview?: string;
}

interface TempProject extends Omit<Project, 'id' | 'order'> {
  id?: string;
  order: number | string;
  isTemp?: boolean;
  imageFile?: File | null;
  image_preview?: string;
  category_id: string; // Make required
}

interface Props { requireAuth: (cb: () => void) => void; toast: (msg: string, type?: string) => void; }

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const BLANK_CAT = { name: "", description: "", order: "0", enabled: true, image: null as File | null };
const BLANK_PROJ = { name: "", description: "", category_id: "", order: "", difficulty: "2", date: "", github_url: "", demo_url: "", skills: "", enabled: true, image: null as File | null };

export default function ProjectsSection({ requireAuth, toast }: Props) {
    const [tab, setTab] = useState<"categories" | "projects">("categories");
    const [categories, setCategories] = useState<Category[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tempCategories, setTempCategories] = useState<TempCategory[]>([]);
    const [tempProjects, setTempProjects] = useState<TempProject[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Form states
    const [catForm, setCatForm] = useState({ ...BLANK_CAT });
    const [projForm, setProjForm] = useState({ ...BLANK_PROJ });
    
    // Edit states
    const [editCatId, setEditCatId] = useState<string | null>(null);
    const [editProjId, setEditProjId] = useState<string | null>(null);
    const [editTempCatId, setEditTempCatId] = useState<string | null>(null);
    const [editTempProjId, setEditTempProjId] = useState<string | null>(null);
    
    // Show add forms
    const [showAddCat, setShowAddCat] = useState(false);
    const [showAddProj, setShowAddProj] = useState(false);

    const fetchAll = useCallback(async () => {
        try {
            const [cats, projs] = await Promise.all([
                apiRequest("/api/project-categories/"), 
                apiRequest("/api/projects/")
            ]);
            setCategories(cats); 
            setProjects(projs);
            saveToStorage("projectCategories", cats); 
            saveToStorage("projects", projs);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        const cc = getFromStorage<Category[]>("projectCategories"); 
        if (cc) setCategories(cc);
        const pp = getFromStorage<Project[]>("projects"); 
        if (pp) setProjects(pp);
        fetchAll();
    }, [fetchAll]);

    // Generate temporary ID
    const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Apply changes to local storage only
    function applyPreview() {
        const allCategories = [...categories, ...tempCategories];
        const allProjects = [...projects, ...tempProjects];
        saveToStorage("projectCategories", allCategories);
        saveToStorage("projects", allProjects);
        toast("Projects & categories synced to local storage! Portfolio preview updated.", "success");
    }

    // Submit all changes to backend
    async function submitAll() {
        setLoading(true);
        try {
            // Submit temp categories first
            for (const tempCat of tempCategories) {
                if (tempCat.name) {
                    const fd = new FormData();
                    fd.append("name", tempCat.name);
                    if (tempCat.description) fd.append("description", tempCat.description);
                    fd.append("order", String(tempCat.order));
                    fd.append("enabled", String(tempCat.enabled));
                    if (tempCat.imageFile) fd.append("image", tempCat.imageFile);
                    
                    await apiFormRequest("/api/project-categories/", "POST", fd);
                }
            }

            // Submit temp projects
            for (const tempProj of tempProjects) {
                if (tempProj.name && tempProj.category_id) {
                    const fd = new FormData();
                    fd.append("name", tempProj.name);
                    fd.append("description", tempProj.description); 
                    fd.append("category_id", tempProj.category_id);
                    fd.append("difficulty", String(tempProj.difficulty));
                    fd.append("date", tempProj.date);
                    fd.append("enabled", String(tempProj.enabled));
                    if (tempProj.order) fd.append("order", String(tempProj.order));
                    if (tempProj.github_url) fd.append("github_url", tempProj.github_url);
                    if (tempProj.demo_url) fd.append("demo_url", tempProj.demo_url);
                    if (tempProj.skills) fd.append("skills", Array.isArray(tempProj.skills) ? tempProj.skills.join(',') : tempProj.skills);
                    if (tempProj.imageFile) fd.append("image", tempProj.imageFile);
                    
                    await apiFormRequest("/api/projects/", "POST", fd);
                }
            }

            // Refresh from backend
            await fetchAll();
            
            // Clear temp items
            setTempCategories([]);
            setTempProjects([]);
            
            toast("All changes saved to backend!", "success");
        } catch (e) {
            toast(e instanceof Error ? e.message : "Failed to save changes", "error");
        } finally {
            setLoading(false);
        }
    }

    /* ── TEMPORARY CATEGORY OPERATIONS (UI only) ── */
    function addTempCategory() {
        if (!catForm.name) { 
            toast("Name required", "error"); 
            return; 
        }

        const imagePreview = catForm.image ? URL.createObjectURL(catForm.image) : undefined;

        const newTempCat: TempCategory = {
            id: generateTempId(),
            name: catForm.name,
            description: catForm.description,
            order: catForm.order || 0,
            enabled: catForm.enabled,
            imageFile: catForm.image,
            image_preview: imagePreview,
            isTemp: true,
        };

        setTempCategories([...tempCategories, newTempCat]);
        setCatForm({ ...BLANK_CAT });
        setShowAddCat(false);
        toast("Category added to preview! Click Apply to see in portfolio or Submit to save to backend.", "info");
    }

    function updateTempCategory(id: string) {
        if (!catForm.name) {
            toast("Name required", "error");
            return;
        }

        const imagePreview = catForm.image ? URL.createObjectURL(catForm.image) : undefined;

        setTempCategories(tempCategories.map(c => 
            c.id === id ? {
                ...c,
                name: catForm.name,
                description: catForm.description,
                order: catForm.order || 0,
                enabled: catForm.enabled,
                imageFile: catForm.image || c.imageFile,
                image_preview: imagePreview || c.image_preview,
            } : c
        ));

        setEditTempCatId(null);
        setCatForm({ ...BLANK_CAT });
        toast("Category updated in preview!", "info");
    }

    function deleteTempCategory(id: string) {
        if (!confirm("Remove this category from preview?")) return;
        setTempCategories(tempCategories.filter(c => c.id !== id));
        if (editTempCatId === id) {
            setEditTempCatId(null);
            setCatForm({ ...BLANK_CAT });
        }
    }

    function startEditTempCat(c: TempCategory) {
        setEditTempCatId(c.id || null);
        setCatForm({
            name: c.name,
            description: c.description || "",
            order: String(c.order),
            enabled: c.enabled,
            image: null,
        });
    }

    /* ── TEMPORARY PROJECT OPERATIONS (UI only) ── */
    function addTempProject() {
        if (!projForm.name || !projForm.category_id || !projForm.description) { 
            toast("Name, description and category required", "error"); 
            return; 
        }

        const imagePreview = projForm.image ? URL.createObjectURL(projForm.image) : undefined;

        const newTempProj: TempProject = {
            id: generateTempId(),
            name: projForm.name,
            description: projForm.description,  
            category_id: projForm.category_id,
            order: projForm.order || 0,
            difficulty: Number(projForm.difficulty),
            date: projForm.date,
            github_url: projForm.github_url,
            demo_url: projForm.demo_url,
            skills: projForm.skills ? projForm.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
            enabled: projForm.enabled,
            imageFile: projForm.image,
            image_preview: imagePreview,
            isTemp: true,
        };

        setTempProjects([...tempProjects, newTempProj]);
        setProjForm({ ...BLANK_PROJ, category_id: projForm.category_id });
        setShowAddProj(false);
        toast("Project added to preview! Click Apply to see in portfolio or Submit to save to backend.", "info");
    }

    function updateTempProject(id: string) {
        if (!projForm.name || !projForm.description) {
            toast("Name and description required", "error");
            return;
        }

        const imagePreview = projForm.image ? URL.createObjectURL(projForm.image) : undefined;

        setTempProjects(tempProjects.map(p => 
            p.id === id ? {
                ...p,
                name: projForm.name,
                description: projForm.description,
                category_id: projForm.category_id || p.category_id,
                order: projForm.order || 0,
                difficulty: Number(projForm.difficulty),
                date: projForm.date,
                github_url: projForm.github_url,
                demo_url: projForm.demo_url,
                skills: projForm.skills ? projForm.skills.split(",").map(s => s.trim()).filter(Boolean) : [],
                enabled: projForm.enabled,
                imageFile: projForm.image || p.imageFile,
                image_preview: imagePreview || p.image_preview,
            } : p
        ));

        setEditTempProjId(null);
        setProjForm({ ...BLANK_PROJ });
        toast("Project updated in preview!", "info");
    }

    function deleteTempProject(id: string) {
        if (!confirm("Remove this project from preview?")) return;
        setTempProjects(tempProjects.filter(p => p.id !== id));
        if (editTempProjId === id) {
            setEditTempProjId(null);
            setProjForm({ ...BLANK_PROJ });
        }
    }

    function startEditTempProj(p: TempProject) {
        setEditTempProjId(p.id || null);
        setProjForm({
            name: p.name,
            description: p.description,
            category_id: p.category_id,
            order: String(p.order),
            difficulty: String(p.difficulty),
            date: p.date,
            github_url: p.github_url || "",
            demo_url: p.demo_url || "",
            skills: Array.isArray(p.skills) ? p.skills.join(", ") : p.skills || "",
            enabled: p.enabled,
            image: null,
        });
    }

    /* ── BACKEND CATEGORY OPERATIONS ── */
    async function addCategory() {
        if (!catForm.name) { toast("Name required", "error"); return; }
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("name", catForm.name);
            if (catForm.description) fd.append("description", catForm.description);
            fd.append("order", catForm.order);
            fd.append("enabled", String(catForm.enabled));
            if (catForm.image) fd.append("image", catForm.image);
            await apiFormRequest("/api/project-categories/", "POST", fd);
            setCatForm({ ...BLANK_CAT }); 
            setShowAddCat(false);
            await fetchAll(); 
            toast("Category added to backend!", "success");
        } catch (e) { 
            toast(e instanceof Error ? e.message : "Failed", "error"); 
        } finally { 
            setLoading(false); 
        }
    }

    async function updateCategory(id: string) {
        setLoading(true);
        try {
            await apiRequest(`/api/project-categories/${id}`, "PUT", {
                name: catForm.name || undefined,
                description: catForm.description || undefined,
                order: catForm.order ? Number(catForm.order) : undefined,
                enabled: catForm.enabled,
            });
            setEditCatId(null); 
            setCatForm({ ...BLANK_CAT });
            await fetchAll(); 
            toast("Category updated in backend!", "success");
        } catch (e) { 
            toast(e instanceof Error ? e.message : "Failed", "error"); 
        } finally { 
            setLoading(false); 
        }
    }

    async function deleteCategory(id: string) {
        if (!confirm("Delete this category from backend? Projects will be moved to Others.")) return;
        setLoading(true);
        try {
            await apiRequest(`/api/project-categories/${id}`, "DELETE");
            await fetchAll(); 
            toast("Category deleted from backend", "success");
        } catch (e) { 
            toast(e instanceof Error ? e.message : "Failed", "error"); 
        } finally { 
            setLoading(false); 
        }
    }

    /* ── BACKEND PROJECT OPERATIONS ── */
    async function addProject() {
        if (!projForm.name || !projForm.category_id || !projForm.description ) { 
            toast("Name, description and category required", "error"); 
            return; 
        }
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("name", projForm.name);
            fd.append("description", projForm.description);
            fd.append("category_id", projForm.category_id);
            fd.append("difficulty", projForm.difficulty);
            fd.append("date", projForm.date);
            fd.append("enabled", String(projForm.enabled));
            if (projForm.order) fd.append("order", projForm.order);
            if (projForm.github_url) fd.append("github_url", projForm.github_url);
            if (projForm.demo_url) fd.append("demo_url", projForm.demo_url);
            if (projForm.skills) fd.append("skills", projForm.skills);
            if (projForm.image) fd.append("image", projForm.image);
            await apiFormRequest("/api/projects/", "POST", fd);
            setProjForm({ ...BLANK_PROJ, category_id: projForm.category_id }); 
            setShowAddProj(false);
            await fetchAll(); 
            toast("Project added to backend!", "success");
        } catch (e) { 
            toast(e instanceof Error ? e.message : "Failed", "error"); 
        } finally { 
            setLoading(false); 
        }
    }

    async function updateProject(id: string) {
        setLoading(true);
        try {
            await apiRequest(`/api/projects/${id}`, "PUT", {
                name: projForm.name || undefined,
                description: projForm.description || undefined,
                category_id: projForm.category_id || undefined,
                difficulty: projForm.difficulty ? Number(projForm.difficulty) : undefined,
                date: projForm.date || undefined,
                github_url: projForm.github_url || undefined,
                demo_url: projForm.demo_url || undefined,
                skills: projForm.skills ? projForm.skills.split(",").map(s => s.trim()).filter(Boolean) : undefined,
                enabled: projForm.enabled,
                order: projForm.order ? Number(projForm.order) : undefined,
            });
            setEditProjId(null); 
            setProjForm({ ...BLANK_PROJ });
            await fetchAll(); 
            toast("Project updated in backend!", "success");
        } catch (e) { 
            toast(e instanceof Error ? e.message : "Failed", "error"); 
        } finally { 
            setLoading(false); 
        }
    }

    async function deleteProject(id: string) {
        if (!confirm("Delete this project from backend?")) return;
        setLoading(true);
        try {
            await apiRequest(`/api/projects/${id}`, "DELETE");
            await fetchAll(); 
            toast("Project deleted from backend", "success");
        } catch (e) { 
            toast(e instanceof Error ? e.message : "Failed", "error"); 
        } finally { 
            setLoading(false); 
        }
    }

    /* ── EDIT HELPERS ── */
    function startEditCat(c: Category) {
        setEditCatId(c.id); 
        setShowAddCat(false);
        setCatForm({ 
            name: c.name, 
            description: c.description || "", 
            order: String(c.order), 
            enabled: c.enabled, 
            image: null 
        });
    }

    function startEditProj(p: Project) {
        setEditProjId(p.id); 
        setShowAddProj(false);
        setProjForm({ 
            name: p.name, 
            description: p.description,
            category_id: p.category_id, 
            order: String(p.order), 
            difficulty: String(p.difficulty), 
            date: p.date, 
            github_url: p.github_url || "", 
            demo_url: p.demo_url || "", 
            skills: p.skills.join(", "), 
            enabled: p.enabled, 
            image: null 
        });
    }

    const catName = (id: string) => {
        const cat = categories.find(c => c.id === id);
        if (cat) return cat.name;
        const tempCat = tempCategories.find(c => c.id === id);
        return tempCat?.name || id;
    };
    
    const diffLabel = (d: number) => ["", "⭐ Easy", "⭐⭐ Medium", "⭐⭐⭐ Hard"][d] || String(d);

    /* ── FORM RENDERERS ── */
    const renderCategoryForm = (onSubmit: () => void, label: string, isTemp: boolean = false) => (
        <div className="card" style={{ marginTop: 10 }}>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input className="form-input" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="Web Dev" />
                </div>
                <div className="form-group">
                    <label className="form-label">Order</label>
                    <input className="form-input" type="number" value={catForm.order} onChange={e => setCatForm(f => ({ ...f, order: e.target.value }))} />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Image (optional)</label>
                    <input className="form-input" type="file" accept="image/*" onChange={e => setCatForm(f => ({ ...f, image: e.target.files?.[0] || null }))} />
                </div>
                <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem", marginBottom: 4 }}>
                        <input type="checkbox" checked={catForm.enabled} onChange={e => setCatForm(f => ({ ...f, enabled: e.target.checked }))} /> Enabled
                    </label>
                </div>
            </div>
            <div className="btn-group">
                <button className="btn btn-success" disabled={loading} onClick={() => onSubmit()}>
                    {loading ? "Saving…" : label}
                </button>
                <button className="btn btn-ghost" onClick={() => { 
                    setEditCatId(null); 
                    setEditTempCatId(null);
                    setShowAddCat(false); 
                    setCatForm({ ...BLANK_CAT });
                }}>
                    Cancel
                </button>
            </div>
        </div>
    );

    const renderProjectForm = (onSubmit: () => void, label: string, isTemp: boolean = false) => (
        <div className="card" style={{ marginTop: 10 }}>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input className="form-input" value={projForm.name} onChange={e => setProjForm(f => ({ ...f, name: e.target.value }))} placeholder="Portfolio Website" />
                </div>
                <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" value={projForm.category_id} onChange={e => setProjForm(f => ({ ...f, category_id: e.target.value }))}>
                        <option value="">-- Select --</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        {tempCategories.map(c => <option key={c.id} value={c.id}>{c.name} (Preview)</option>)}
                    </select>
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea 
                    className="form-textarea" 
                    rows={3} 
                    value={projForm.description} 
                    onChange={e => setProjForm(f => ({ ...f, description: e.target.value }))} 
                    placeholder="Describe the project, its purpose, technologies used, etc."
                />
            </div>
            <div className="form-row-3">
                <div className="form-group">
                    <label className="form-label">Difficulty (1-3)</label>
                    <select className="form-select" value={projForm.difficulty} onChange={e => setProjForm(f => ({ ...f, difficulty: e.target.value }))}>
                        <option value="1">1 – Easy</option><option value="2">2 – Medium</option><option value="3">3 – Hard</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Date (MM/YYYY)</label>
                    <input className="form-input" value={projForm.date} onChange={e => setProjForm(f => ({ ...f, date: e.target.value }))} placeholder="01/2024" />
                </div>
                <div className="form-group">
                    <label className="form-label">Order</label>
                    <input className="form-input" type="number" value={projForm.order} onChange={e => setProjForm(f => ({ ...f, order: e.target.value }))} placeholder="Auto" />
                </div>
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">GitHub URL</label>
                    <input className="form-input" value={projForm.github_url} onChange={e => setProjForm(f => ({ ...f, github_url: e.target.value }))} placeholder="https://github.com/..." />
                </div>
                <div className="form-group">
                    <label className="form-label">Demo URL</label>
                    <input className="form-input" value={projForm.demo_url} onChange={e => setProjForm(f => ({ ...f, demo_url: e.target.value }))} placeholder="https://..." />
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Skills (comma-separated)</label>
                <input className="form-input" value={projForm.skills} onChange={e => setProjForm(f => ({ ...f, skills: e.target.value }))} placeholder="React, TypeScript, FastAPI" />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Image (optional)</label>
                    <input className="form-input" type="file" accept="image/*" onChange={e => setProjForm(f => ({ ...f, image: e.target.files?.[0] || null }))} />
                </div>
                <div className="form-group" style={{ display: "flex", alignItems: "flex-end" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.875rem", marginBottom: 4 }}>
                        <input type="checkbox" checked={projForm.enabled} onChange={e => setProjForm(f => ({ ...f, enabled: e.target.checked }))} /> Enabled
                    </label>
                </div>
            </div>
            <div className="btn-group">
                <button className="btn btn-success" disabled={loading} onClick={() => onSubmit()}>
                    {loading ? "Saving…" : label}
                </button>
                <button className="btn btn-ghost" onClick={() => { 
                    setEditProjId(null); 
                    setEditTempProjId(null);
                    setShowAddProj(false); 
                    setProjForm({ ...BLANK_PROJ });
                }}>
                    Cancel
                </button>
            </div>
        </div>
    );

    // Combine saved and temp items for display
    const allCategories = [...categories, ...tempCategories];
    const allProjects = [...projects, ...tempProjects];
    const totalPending = tempCategories.length + tempProjects.length;

    return (
        <div>
            <div className="section-header">
                <h2>🗂 Projects</h2>
                <p>Manage project categories and individual projects.</p>
            </div>

            {/* Apply / Submit strip - three button pattern */}
            <div className="action-strip">
                <span className="action-strip-text">
                    📋 Edit below. Add to preview, Apply to localStorage, Submit to backend.
                </span>
                <button 
                    className="btn btn-warning btn-sm" 
                    onClick={applyPreview}
                    disabled={loading}
                >
                    ⚡ Apply (Preview)
                </button>
                <button 
                    className="btn btn-success btn-sm" 
                    disabled={loading || totalPending === 0} 
                    onClick={() => requireAuth(() => submitAll())}
                >
                    {loading ? "Saving…" : `✅ Submit All${totalPending > 0 ? ` (${totalPending} pending)` : ''}`}
                </button>
            </div>

            {/* Pending items indicator */}
            {totalPending > 0 && (
                <div className="info-message" style={{ 
                    padding: '8px 16px', 
                    marginBottom: '16px', 
                    backgroundColor: '#fef3c7', 
                    borderRadius: '8px', 
                    color: '#92400e' 
                }}>
                    ⏳ You have {totalPending} unsaved item{totalPending > 1 ? 's' : ''} in preview. 
                    Click "Apply" to see in portfolio or "Submit All" to save to backend.
                </div>
            )}

            <div className="tab-bar">
                <button className={`tab-btn${tab === "categories" ? " active" : ""}`} onClick={() => setTab("categories")}>
                    📁 Categories ({allCategories.length}) {tempCategories.length > 0 && <span className="badge badge-warning" style={{ marginLeft: '4px' }}>{tempCategories.length} new</span>}
                </button>
                <button className={`tab-btn${tab === "projects" ? " active" : ""}`} onClick={() => setTab("projects")}>
                    🚀 Projects ({allProjects.length}) {tempProjects.length > 0 && <span className="badge badge-warning" style={{ marginLeft: '4px' }}>{tempProjects.length} new</span>}
                </button>
            </div>

            {/* Categories Tab */}
            {tab === "categories" && (
                <div>
                    <div style={{ marginBottom: 12, display: 'flex', gap: '8px' }}>
                        <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => { 
                                setShowAddCat(true); 
                                setEditCatId(null); 
                                setEditTempCatId(null);
                                setCatForm({ ...BLANK_CAT }); 
                            }}
                        >
                            + Add Category (Preview)
                        </button>
                    </div>
                    
                    {showAddCat && renderCategoryForm(addTempCategory, "➕ Add to Preview", true)}

                    <div className="items-list">
                        {allCategories.map(c => {
                            const isTemp = 'isTemp' in c && c.isTemp;
                            const tempCat = isTemp ? c as TempCategory : null;
                            
                            return (
                                <div key={isTemp ? tempCat?.id : (c as Category).id}>
                                    <div className="item-row" style={isTemp ? { backgroundColor: '#fef3c7', borderRadius: '4px', padding: '8px' } : {}}>
                                        <div className="item-thumb">
                                            {isTemp ? (
                                                tempCat?.image_preview ? (
                                                    <img src={tempCat.image_preview} alt={c.name} style={{ maxWidth: '40px', maxHeight: '40px' }} />
                                                ) : "📁"
                                            ) : (
                                                (c as Category).image_link ? 
                                                    <img src={`${BASE_URL}/static${(c as Category).image_link}`} alt={c.name} /> : 
                                                    "📁"
                                            )}
                                        </div>
                                        <div className="item-info">
                                            <div className="item-name">
                                                {c.name}
                                                {isTemp && <span className="badge badge-warning" style={{ marginLeft: '8px' }}>Preview</span>}
                                            </div>
                                            <div className="item-sub">
                                                Order #{c.order} — {allProjects.filter(p => p.category_id === c.id).length} projects — 
                                                {c.enabled ? <span className="badge badge-green">on</span> : <span className="badge badge-red">off</span>}
                                            </div>
                                        </div>
                                        <div className="item-actions">
                                            {isTemp ? (
                                                <>
                                                    <button 
                                                        className="btn btn-ghost btn-sm" 
                                                        onClick={() => {
                                                            if(tempCat){
                                                                startEditTempCat(tempCat);
                                                                setShowAddCat(false);
                                                            }
                                                        }}
                                                        disabled={loading || !tempCat}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-sm" 
                                                        disabled={loading || !tempCat} 
                                                        onClick={() => {
                                                            if (tempCat?.id){
                                                                deleteTempCategory(tempCat.id);
                                                            }
                                                        }}
                                                    >
                                                        🗑
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button 
                                                        className="btn btn-ghost btn-sm" 
                                                        onClick={() => startEditCat(c as Category)}
                                                        disabled={loading}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button 
                                                        className="btn btn-danger btn-sm" 
                                                        disabled={loading} 
                                                        onClick={() => requireAuth(() => deleteCategory((c as Category).id))}
                                                    >
                                                        🗑
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Edit forms */}
                                    {!isTemp && editCatId === (c as Category).id && renderCategoryForm(() => updateCategory((c as Category).id), "✅ Save to Backend")}
                                    {isTemp && editTempCatId === tempCat?.id && renderCategoryForm(() => updateTempCategory(tempCat.id!), "💾 Update Preview", true)}
                                </div>
                            );
                        })}
                        {allCategories.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">📭</div>
                                <p>No categories yet. Add one to get started!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Projects Tab */}
            {tab === "projects" && (
                <div>
                    <div style={{ marginBottom: 12 }}>
                        <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => { 
                                setShowAddProj(true); 
                                setEditProjId(null); 
                                setEditTempProjId(null);
                                setProjForm({ ...BLANK_PROJ }); 
                            }}
                        >
                            + Add Project (Preview)
                        </button>
                    </div>
                    
                    {showAddProj && renderProjectForm(addTempProject, "➕ Add to Preview", true)}

                    {categories.map(cat => {
                        const catProjs = allProjects.filter(p => p.category_id === cat.id);
                        if (catProjs.length === 0) return null;
                        
                        return (
                            <div key={cat.id} className="card">
                                <div className="card-title">
                                    <span>📁</span> {cat.name} 
                                    <span className="badge badge-purple">{catProjs.length}</span>
                                    {tempProjects.filter(p => p.category_id === cat.id).length > 0 && (
                                        <span className="badge badge-warning" style={{ marginLeft: '8px' }}>
                                            {tempProjects.filter(p => p.category_id === cat.id).length} pending
                                        </span>
                                    )}
                                </div>
                                <div className="items-list">
                                    {catProjs.map(p => {
                                        const isTemp = 'isTemp' in p && p.isTemp;
                                        const tempProj = isTemp ? p as TempProject : null;
                                        
                                        return (
                                            <div key={isTemp ? tempProj?.id : (p as Project).id}>
                                                <div className="item-row" style={isTemp ? { backgroundColor: '#fef3c7', borderRadius: '4px', padding: '8px' } : {}}>
                                                    <div className="item-thumb">
                                                        {isTemp ? (
                                                            tempProj?.image_preview ? (
                                                                <img src={tempProj.image_preview} alt={p.name} style={{ maxWidth: '40px', maxHeight: '40px' }} />
                                                            ) : "🚀"
                                                        ) : (
                                                            (p as Project).image_link ? 
                                                                <img src={`${BASE_URL}/static${(p as Project).image_link}`} alt={p.name} /> : 
                                                                "🚀"
                                                        )}
                                                    </div>
                                                    <div className="item-info">
                                                        <div className="item-name">
                                                            {p.name}
                                                            {isTemp && <span className="badge badge-warning" style={{ marginLeft: '8px' }}>Preview</span>}
                                                        </div>
                                                        <div className="item-sub">
                                                            {p.date} · {diffLabel(p.difficulty)} · {catName(p.category_id)} · 
                                                            {p.enabled ? <span className="badge badge-green">on</span> : <span className="badge badge-red">off</span>}
                                                        </div>
                                                    </div>
                                                    <div className="item-actions">
                                                        {isTemp ? (
                                                            <>
                                                                <button 
                                                                    className="btn btn-ghost btn-sm" 
                                                                    onClick={() => {
                                                                        if(tempProj){
                                                                            startEditTempProj(tempProj);
                                                                            setShowAddProj(false);
                                                                        }
                                                                    }}
                                                                    disabled={loading || !tempProj}
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button 
                                                                    className="btn btn-danger btn-sm" 
                                                                    disabled={loading || !tempProj} 
                                                                    onClick={() => {
                                                                        if (tempProj?.id){
                                                                            deleteTempProject(tempProj.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    🗑
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button 
                                                                    className="btn btn-ghost btn-sm" 
                                                                    onClick={() => startEditProj(p as Project)}
                                                                    disabled={loading}
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button 
                                                                    className="btn btn-danger btn-sm" 
                                                                    disabled={loading} 
                                                                    onClick={() => requireAuth(() => deleteProject((p as Project).id))}
                                                                >
                                                                    🗑
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Edit forms */}
                                                {!isTemp && editProjId === (p as Project).id && renderProjectForm(() => updateProject((p as Project).id), "✅ Save to Backend")}
                                                {isTemp && editTempProjId === tempProj?.id && renderProjectForm(() => updateTempProject(tempProj.id!), "💾 Update Preview", true)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                    
                    {allProjects.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">📭</div>
                            <p>No projects yet. Add categories first, then add projects.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}