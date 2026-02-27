"use client";
import { useState, useEffect, useCallback } from "react";
import { apiRequest, apiFormRequest } from "@/services/api";
import { saveToStorage, getFromStorage } from "@/services/adminData";

interface Skill {
  id: string;
  name: string;
  category: string;
  order: number;
  hover_color_primary: string;
  hover_color_secondary?: string;
  logo_path?: string;
}

// Temporary skill interface for UI-only skills (without backend ID)
interface TempSkill extends Omit<Skill, 'id' | 'order'> {
  id?: string;  // optional for temp skills
  order: number | string;
  isTemp?: boolean;
  logoFile?: File | null; // For temp skills with logo file
  logo_preview?: string; // For preview
}

const CATEGORIES = [
  { label: "Programming Languages", value: "Programming Languages" },
  { label: "Frameworks & Libraries", value: "Frameworks & Libraries" },
  { label: "Databases & Tools", value: "Databases & Tools" },
];

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Props {
  requireAuth: (cb: () => void) => void;
  toast: (msg: string, type?: string) => void;
}

const BLANK_FORM = {
  name: "",
  category: CATEGORIES[0].value,
  order: "",
  hover_color_primary: "#6366f1",
  hover_color_secondary: "",
  logo: null as File | null,
};

export default function SkillsSection({ requireAuth, toast }: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [tempSkills, setTempSkills] = useState<TempSkill[]>([]); // UI-only skills
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTempId, setEditTempId] = useState<string | null>(null); // For editing temp skills
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [showAdd, setShowAdd] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      const data = await apiRequest("/api/skills/");
      setSkills(data);
      saveToStorage("skills", data);
    } catch { }
  }, []);

  useEffect(() => {
    // Load from localStorage first for instant display
    const cached = getFromStorage<Skill[]>("skills");
    if (cached) setSkills(cached);
    
    // Refresh from backend
    fetchSkills();
  }, [fetchSkills]);

  // Generate a temporary ID for UI-only skills
  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Apply changes to local storage only
  function applyPreview() {
    // Combine saved skills with temp skills (temp skills will be included in localStorage)
    const allSkills = [...skills, ...tempSkills];
    saveToStorage("skills", allSkills);
    toast("Skills synced to local storage! Portfolio preview updated.", "success");
  }

  // Submit all skills to backend
  async function submitAllSkills() {
    setLoading(true);
    try {
      // Submit all temp skills first
      for (const tempSkill of tempSkills) {
        if (tempSkill.name && tempSkill.logoFile) {
          const fd = new FormData();
          fd.append("name", tempSkill.name);
          fd.append("category", tempSkill.category);
          fd.append("hover_color_primary", tempSkill.hover_color_primary);
          if (tempSkill.hover_color_secondary)
            fd.append("hover_color_secondary", tempSkill.hover_color_secondary);
          if (tempSkill.order) fd.append("order", String(tempSkill.order));
          fd.append("logo", tempSkill.logoFile);

          await apiFormRequest("/api/skills/", "POST", fd);
        }
      }

      // Submit any edits to existing skills (you might need to track edited skills)
      // For now, we'll refetch from backend
      await fetchSkills();
      
      // Clear temp skills after successful submission
      setTempSkills([]);
      
      toast("All skills saved to backend!", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to save skills", "error");
    } finally {
      setLoading(false);
    }
  }

  // Add a temporary skill (UI only)
  function addTempSkill() {
    if (!form.name || !form.logo) {
      toast("Name and logo are required", "error");
      return;
    }

    // Create preview URL for the logo
    const logoPreview = form.logo ? URL.createObjectURL(form.logo) : undefined;

    const newTempSkill: TempSkill = {
      id: generateTempId(),
      name: form.name,
      category: form.category,
      order: form.order || 0,
      hover_color_primary: form.hover_color_primary,
      hover_color_secondary: form.hover_color_secondary,
      logo_path: undefined, // Will be set after backend save
      logoFile: form.logo,
      logo_preview: logoPreview,
      isTemp: true,
    };

    setTempSkills([...tempSkills, newTempSkill]);
    setForm({ ...BLANK_FORM });
    setShowAdd(false);
    toast("Skill added to preview! Click Apply to see in portfolio or Submit to save to backend.", "info");
  }

  // Update a temporary skill
  function updateTempSkill(id: string) {
    if (!form.name) {
      toast("Name is required", "error");
      return;
    }

    let logoPreview = undefined;
    if (form.logo) {
      logoPreview = URL.createObjectURL(form.logo);
    }

    setTempSkills(tempSkills.map(s => 
      s.id === id ? {
        ...s,
        name: form.name,
        category: form.category,
        order: form.order || 0,
        hover_color_primary: form.hover_color_primary,
        hover_color_secondary: form.hover_color_secondary,
        logoFile: form.logo || s.logoFile,
        logo_preview: logoPreview || s.logo_preview,
      } : s
    ));

    setEditTempId(null);
    setForm({ ...BLANK_FORM });
    toast("Skill updated in preview!", "info");
  }

  // Delete a temporary skill
  function deleteTempSkill(id: string) {
    if (!confirm("Remove this skill from preview?")) return;
    setTempSkills(tempSkills.filter(s => s.id !== id));
    if (editTempId === id) {
      setEditTempId(null);
      setForm({ ...BLANK_FORM });
    }
  }

  // Start editing a temporary skill
  function startEditTemp(s: TempSkill) {
    setEditTempId(s.id || null);
    setForm({
      name: s.name,
      category: s.category,
      order: String(s.order),
      hover_color_primary: s.hover_color_primary,
      hover_color_secondary: s.hover_color_secondary || "",
      logo: null,
    });
  }

  // Original backend operations (now only used for existing skills)
  async function deleteSkill(id: string) {
    if (!confirm("Delete this skill from backend?")) return;

    setLoading(true);
    try {
      await apiRequest(`/api/skills/${id}`, "DELETE");
      await fetchSkills(); // Refresh from backend
      toast("Skill deleted from backend", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(s: Skill) {
    setEditId(s.id);
    setForm({
      name: s.name,
      category: s.category,
      order: String(s.order),
      hover_color_primary: s.hover_color_primary,
      hover_color_secondary: s.hover_color_secondary || "",
      logo: null,
    });
    setShowAdd(false);
  }

  async function submitEdit(id: string) {
    setLoading(true);
    try {
      const fd = new FormData();

      if (form.name) fd.append("name", form.name);
      if (form.category) fd.append("category", form.category);
      if (form.hover_color_primary)
        fd.append("hover_color_primary", form.hover_color_primary);
      if (form.hover_color_secondary)
        fd.append("hover_color_secondary", form.hover_color_secondary);
      if (form.order) fd.append("order", form.order);
      if (form.logo) fd.append("logo", form.logo);

      await apiFormRequest(`/api/skills/${id}`, "PUT", fd);

      setEditId(null);
      setForm({ ...BLANK_FORM });
      await fetchSkills(); // Refresh from backend
      toast("Skill updated in backend!", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    } finally {
      setLoading(false);
    }
  }

  const renderSkillForm = (onSubmit: () => void, submitLabel: string, isTemp: boolean = false) => (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input
            className="form-input"
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category *</label>
          <select
            className="form-select"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Primary Color</label>
          <input
            type="color"
            value={form.hover_color_primary}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                hover_color_primary: e.target.value,
              }))
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">Secondary Color</label>
          <input
            type="color"
            value={form.hover_color_secondary || "#000000"}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                hover_color_secondary: e.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Order (optional)</label>
          <input
            type="number"
            className="form-input"
            value={form.order}
            onChange={(e) =>
              setForm((f) => ({ ...f, order: e.target.value }))
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Logo Image {submitLabel.includes("Add") ? "*" : "(optional)"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                logo: e.target.files?.[0] || null,
              }))
            }
          />
        </div>
      </div>

      <div className="btn-group">
        <button
          className="btn btn-success"
          disabled={loading}
          onClick={() => onSubmit()}
        >
          {loading ? "Saving…" : submitLabel}
        </button>

        <button
          className="btn btn-ghost"
          onClick={() => {
            setEditId(null);
            setEditTempId(null);
            setShowAdd(false);
            setForm({ ...BLANK_FORM });
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Combine saved and temp skills for display
  const allSkills = [...skills, ...tempSkills];
  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: allSkills.filter((s) => s.category === cat.value),
  }));

  return (
    <div>
      <div className="section-header">
        <h2>🛠 Skills</h2>
        <p>Manage your technical skills grouped by category.</p>
      </div>

      {/* Apply / Submit strip */}
      <div className="action-strip">
        <span className="action-strip-text">
          📋 Edit your skills below. Apply previews locally; Submit saves all changes to the backend.
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
          disabled={loading || tempSkills.length === 0} 
          onClick={() => requireAuth(submitAllSkills)}
        >
          {loading ? "Saving…" : `✅ Submit All${tempSkills.length > 0 ? ` (${tempSkills.length} pending)` : ''}`}
        </button>
        <button 
          className="btn btn-primary btn-sm" 
          onClick={() => { 
            setShowAdd(true); 
            setEditId(null); 
            setEditTempId(null);
            setForm({ ...BLANK_FORM }); 
          }}
        >
          + Add Skill
        </button>
      </div>

      {/* Show pending skills indicator */}
      {tempSkills.length > 0 && (
        <div className="info-message" style={{ padding: '8px 16px', marginBottom: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#92400e' }}>
          ⏳ You have {tempSkills.length} unsaved skill{tempSkills.length > 1 ? 's' : ''} in preview. Click "Apply" to see in portfolio or "Submit All" to save to backend.
        </div>
      )}

      {showAdd && renderSkillForm(addTempSkill, "➕ Add to Preview", true)}

      {grouped.map(({ cat, items }) => (
        <div key={cat.value} className="card">
          <div className="card-title">
            <span>📦</span> {cat.label} <span className="badge badge-purple">{items.length}</span>
            {cat.value === CATEGORIES[0].value && tempSkills.length > 0 && (
              <span className="badge badge-warning" style={{ marginLeft: '8px' }}>{tempSkills.length} pending</span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No skills in this category yet</p>
            </div>
          ) : (
            <div className="items-list">
              {items.map((s) => {
                const isTemp = 'isTemp' in s && s.isTemp;
                const tempSkill = isTemp ? s as TempSkill : null;
                
                return (
                  <div key={isTemp ? tempSkill?.id : (s as Skill).id}>
                    <div className="item-row" style={isTemp ? { backgroundColor: '#fef3c7', borderRadius: '4px', padding: '8px' } : {}}>
                      <div className="item-thumb">
                        {isTemp ? (
                          tempSkill?.logo_preview ? (
                            <img src={tempSkill.logo_preview} alt={s.name} style={{ maxWidth: '40px', maxHeight: '40px' }} />
                          ) : "🆕"
                        ) : (
                          (s as Skill).logo_path ? 
                            <img src={`${BASE_URL}/static${(s as Skill).logo_path}`} alt={s.name} /> : 
                            "🔧"
                        )}
                      </div>
                      <div className="item-info">
                        <div className="item-name">
                          {s.name}
                          {isTemp && <span className="badge badge-warning" style={{ marginLeft: '8px' }}>Preview</span>}
                        </div>
                        <div className="item-sub" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          Order #{s.order}
                          <span className="color-dot" style={{ backgroundColor: s.hover_color_primary }} />
                          {s.hover_color_secondary && <span className="color-dot" style={{ backgroundColor: s.hover_color_secondary }} />}
                        </div>
                      </div>
                      <div className="item-actions">
                        {isTemp ? (
                          <>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              onClick={() => {
                                if(tempSkill){
                                  startEditTemp(tempSkill)
                                }
                              }}
                              disabled={loading || !tempSkill}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              disabled={loading || !tempSkill} 
                              onClick={() => {
                                if (tempSkill?.id){
                                  deleteTempSkill(tempSkill.id)
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
                              onClick={() => startEdit(s as Skill)}
                              disabled={loading}
                            >
                              ✏️ Edit
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              disabled={loading} 
                              onClick={() => requireAuth(() => deleteSkill((s as Skill).id))}
                            >
                              🗑
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Edit forms */}
                    {!isTemp && editId === (s as Skill).id && renderSkillForm(() => submitEdit((s as Skill).id), "✅ Save Changes")}
                    {isTemp && editTempId === tempSkill?.id && renderSkillForm(() => updateTempSkill(tempSkill.id!), "💾 Update Preview", true)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}