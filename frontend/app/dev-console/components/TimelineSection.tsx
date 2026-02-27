"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { apiRequest, apiFormRequest } from "@/services/api";
import { saveToStorage, getFromStorage } from "@/services/adminData";

interface Timeline { 
  id: string; 
  header: string; 
  subheader: string; 
  date: string; 
  description: string; 
  order: number; 
  logo_path?: string; 
}

// Temporary interface for UI-only items
interface TempTimeline extends Omit<Timeline, 'id' | 'order'> {
  id?: string;
  order: number | string;
  isTemp?: boolean;
  logoFile?: File | null;
  logo_preview?: string;
}

interface Props { 
  requireAuth: (cb: () => void) => void; 
  toast: (msg: string, type?: string) => void; 
}

const BLANK = { 
  header: "", 
  subheader: "", 
  date: "", 
  description: "", 
  order: "1", 
  dateType: "single" as "single" | "range",
  startDate: "",
  endDate: "",
  logo: null as File | null 
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Month picker component
const MonthYearPicker = ({ value, onChange, placeholder, min, max }: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string;
  min?: string;
  max?: string;
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - 30 + i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Parse initial values from props.value
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (value) {
      const [month] = value.split('/');
      return month || "";
    }
    return "";
  });
  
  const [selectedYear, setSelectedYear] = useState(() => {
    if (value) {
      const [, year] = value.split('/');
      return year || "";
    }
    return "";
  });

  // Update local state when props.value changes (for edit forms)
  useEffect(() => {
    if (value) {
      const [month, year] = value.split('/');
      if (month !== selectedMonth) setSelectedMonth(month || "");
      if (year !== selectedYear) setSelectedYear(year || "");
    } else {
      if (selectedMonth !== "") setSelectedMonth("");
      if (selectedYear !== "") setSelectedYear("");
    }
  }, [value]); // Only depend on value, not on selectedMonth/selectedYear

  // Handle month change without causing infinite loop
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    if (newMonth && selectedYear) {
      onChange(`${newMonth}/${selectedYear}`);
    } else {
      onChange("");
    }
  };

  // Handle year change without causing infinite loop
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    if (selectedMonth && newYear) {
      onChange(`${selectedMonth}/${newYear}`);
    } else {
      onChange("");
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <select 
        className="form-select" 
        value={selectedMonth}
        onChange={handleMonthChange}
        style={{ flex: 1 }}
      >
        <option value="">Month</option>
        {months.map((month, index) => (
          <option key={month} value={String(index + 1).padStart(2, '0')}>
            {month}
          </option>
        ))}
      </select>
      <select 
        className="form-select" 
        value={selectedYear}
        onChange={handleYearChange}
        style={{ flex: 1 }}
      >
        <option value="">Year</option>
        {years.map(year => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  );
};

export default function TimelineSection({ requireAuth, toast }: Props) {
    const [items, setItems] = useState<Timeline[]>([]);
    const [tempItems, setTempItems] = useState<TempTimeline[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Edit states
    const [editId, setEditId] = useState<string | null>(null);
    const [editTempId, setEditTempId] = useState<string | null>(null);
    
    // Form state
    const [form, setForm] = useState({ ...BLANK });
    const [showAdd, setShowAdd] = useState(false);

    const fetchItems = useCallback(async () => {
        try {
            const data = await apiRequest("/api/timelines/");
            setItems(data); 
            saveToStorage("timelines", data);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        const cached = getFromStorage<Timeline[]>("timelines");
        if (cached) setItems(cached);
        fetchItems();
    }, [fetchItems]);

    // Generate temporary ID
    const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Apply changes to local storage only
    function applyPreview() {
        const allItems = [...items, ...tempItems];
        saveToStorage("timelines", allItems);
        toast("Timeline synced to local storage! Portfolio preview updated.", "success");
    }

    // Submit all changes to backend
    async function submitAll() {
        setLoading(true);
        try {
            // Submit all temp items
            for (const tempItem of tempItems) {
                if (tempItem.header && tempItem.logoFile) {
                    const fd = new FormData();
                    fd.append("header", tempItem.header);
                    fd.append("subheader", tempItem.subheader || "");
                    fd.append("date", tempItem.date);
                    fd.append("description", tempItem.description || "");
                    fd.append("order", String(tempItem.order));
                    fd.append("logo", tempItem.logoFile);
                    
                    await apiFormRequest("/api/timelines/", "POST", fd);
                }
            }

            // Refresh from backend
            await fetchItems();
            
            // Clear temp items
            setTempItems([]);
            
            toast("All timeline entries saved to backend!", "success");
        } catch (e) {
            toast(e instanceof Error ? e.message : "Failed to save changes", "error");
        } finally {
            setLoading(false);
        }
    }

    // Format date based on type
    const formatDate = (type: "single" | "range", start: string, end: string): string => {
        if (type === "single") {
            return start;
        } else {
            return `${start} – ${end}`;
        }
    };

    // Parse date string into components
    const parseDateString = (dateStr: string) => {
        if (dateStr.includes('–')) {
            const [start, end] = dateStr.split('–').map(s => s.trim());
            return { type: 'range' as const, startDate: start || '', endDate: end || '' };
        } else {
            return { type: 'single' as const, startDate: dateStr, endDate: '' };
        }
    };

    // Add temporary timeline entry (UI only)
    function addTempItem() {
        if (!form.header || !form.logo) { 
            toast("Header and logo are required", "error"); 
            return; 
        }

        let dateValue = "";
        if (form.dateType === "single") {
            if (!form.startDate) {
                toast("Date is required", "error");
                return;
            }
            dateValue = form.startDate;
        } else {
            if (!form.startDate || !form.endDate) {
                toast("Both start and end dates are required", "error");
                return;
            }
            dateValue = `${form.startDate} – ${form.endDate}`;
        }

        const logoPreview = form.logo ? URL.createObjectURL(form.logo) : undefined;

        const newTempItem: TempTimeline = {
            id: generateTempId(),
            header: form.header,
            subheader: form.subheader,
            date: dateValue,
            description: form.description,
            order: form.order || 1,
            logoFile: form.logo,
            logo_preview: logoPreview,
            isTemp: true,
        };

        setTempItems([...tempItems, newTempItem]);
        setForm({ ...BLANK });
        setShowAdd(false);
        toast("Timeline entry added to preview! Click Apply to see in portfolio or Submit to save to backend.", "info");
    }

    // Update temporary timeline entry
    function updateTempItem(id: string) {
        if (!form.header) {
            toast("Header is required", "error");
            return;
        }

        let dateValue = "";
        if (form.dateType === "single") {
            if (!form.startDate) {
                toast("Date is required", "error");
                return;
            }
            dateValue = form.startDate;
        } else {
            if (!form.startDate || !form.endDate) {
                toast("Both start and end dates are required", "error");
                return;
            }
            dateValue = `${form.startDate} – ${form.endDate}`;
        }

        const logoPreview = form.logo ? URL.createObjectURL(form.logo) : undefined;

        setTempItems(tempItems.map(item => 
            item.id === id ? {
                ...item,
                header: form.header,
                subheader: form.subheader,
                date: dateValue,
                description: form.description,
                order: form.order || 1,
                logoFile: form.logo || item.logoFile,
                logo_preview: logoPreview || item.logo_preview,
            } : item
        ));

        setEditTempId(null);
        setForm({ ...BLANK });
        toast("Timeline entry updated in preview!", "info");
    }

    // Delete temporary timeline entry
    function deleteTempItem(id: string) {
        if (!confirm("Remove this timeline entry from preview?")) return;
        setTempItems(tempItems.filter(item => item.id !== id));
        if (editTempId === id) {
            setEditTempId(null);
            setForm({ ...BLANK });
        }
    }

    // Start editing temporary item
    function startEditTemp(item: TempTimeline) {
        setEditTempId(item.id || null);
        
        // Parse the date string
        const { type, startDate, endDate } = parseDateString(item.date);
        
        setForm({
            header: item.header,
            subheader: item.subheader || "",
            date: item.date,
            description: item.description || "",
            order: String(item.order),
            dateType: type,
            startDate: startDate,
            endDate: endDate,
            logo: null,
        });
    }

    // Backend operations
    async function submitAdd() {
        if (!form.header || !form.logo) { 
            toast("Header and logo required", "error"); 
            return; 
        }

        let dateValue = "";
        if (form.dateType === "single") {
            if (!form.startDate) {
                toast("Date is required", "error");
                return;
            }
            dateValue = form.startDate;
        } else {
            if (!form.startDate || !form.endDate) {
                toast("Both start and end dates are required", "error");
                return;
            }
            dateValue = `${form.startDate} – ${form.endDate}`;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("header", form.header);
            fd.append("subheader", form.subheader);
            fd.append("date", dateValue);
            fd.append("description", form.description);
            fd.append("order", form.order);
            fd.append("logo", form.logo);
            await apiFormRequest("/api/timelines/", "POST", fd);
            setForm({ ...BLANK }); 
            setShowAdd(false);
            await fetchItems(); 
            toast("Timeline entry added to backend!", "success");
        } catch (e) { 
            toast(e instanceof Error ? e.message : "Failed", "error"); 
        } finally { 
            setLoading(false); 
        }
    }

    async function submitEdit(id: string) {
        let dateValue = "";
        if (form.dateType === "single") {
            if (!form.startDate) {
                toast("Date is required", "error");
                return;
            }
            dateValue = form.startDate;
        } else {
            if (!form.startDate || !form.endDate) {
                toast("Both start and end dates are required", "error");
                return;
            }
            dateValue = `${form.startDate} – ${form.endDate}`;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            if (form.header) fd.append("header", form.header);
            if (form.subheader) fd.append("subheader", form.subheader);
            fd.append("date", dateValue);
            if (form.description) fd.append("description", form.description);
            if (form.order) fd.append("order", form.order);
            if (form.logo) fd.append("logo", form.logo);
            await apiFormRequest(`/api/timelines/${id}`, "PUT", fd);
            setEditId(null); 
            setForm({ ...BLANK });
            await fetchItems(); 
            toast("Timeline entry updated in backend!", "success");
        } catch (e) { 
            toast(e instanceof Error ? e.message : "Failed", "error"); 
        } finally { 
            setLoading(false); 
        }
    }

    async function deleteItem(id: string) {
        if (!confirm("Delete this timeline entry from backend?")) return;
        setLoading(true);
        try {
            await apiRequest(`/api/timelines/${id}`, "DELETE");
            await fetchItems(); 
            toast("Deleted from backend", "success");
        } catch (e) { 
            toast(e instanceof Error ? e.message : "Failed", "error"); 
        } finally { 
            setLoading(false); 
        }
    }

    function startEdit(t: Timeline) {
        setEditId(t.id); 
        setShowAdd(false);
        
        // Parse the date string
        const { type, startDate, endDate } = parseDateString(t.date);
        
        setForm({ 
            header: t.header, 
            subheader: t.subheader, 
            date: t.date,
            description: t.description, 
            order: String(t.order),
            dateType: type,
            startDate: startDate,
            endDate: endDate,
            logo: null 
        });
    }

    const renderItemForm = (onSubmit: () => void, label: string, isAdd: boolean = false, isTemp: boolean = false) => (
        <div className="card" style={{ marginTop: 10 }}>
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Header *</label>
                    <input 
                        className="form-input" 
                        value={form.header} 
                        onChange={e => setForm(f => ({ ...f, header: e.target.value }))} 
                        placeholder="B.Tech Computer Science" 
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Subheader</label>
                    <input 
                        className="form-input" 
                        value={form.subheader} 
                        onChange={e => setForm(f => ({ ...f, subheader: e.target.value }))} 
                        placeholder="XYZ University" 
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Date Type</label>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input 
                            type="radio" 
                            checked={form.dateType === 'single'} 
                            onChange={() => setForm(f => ({ ...f, dateType: 'single' }))}
                        /> Single Date
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input 
                            type="radio" 
                            checked={form.dateType === 'range'} 
                            onChange={() => setForm(f => ({ ...f, dateType: 'range' }))}
                        /> Date Range
                    </label>
                </div>
            </div>

            {form.dateType === 'single' ? (
                <div className="form-group">
                    <label className="form-label">Date *</label>
                    <MonthYearPicker 
                        value={form.startDate} 
                        onChange={(val) => setForm(f => ({ ...f, startDate: val }))}
                        placeholder="MM/YYYY"
                    />
                </div>
            ) : (
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Start Date *</label>
                        <MonthYearPicker 
                            value={form.startDate} 
                            onChange={(val) => setForm(f => ({ ...f, startDate: val }))}
                            placeholder="MM/YYYY"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">End Date *</label>
                        <MonthYearPicker 
                            value={form.endDate} 
                            onChange={(val) => setForm(f => ({ ...f, endDate: val }))}
                            placeholder="MM/YYYY"
                            min={form.startDate}
                        />
                    </div>
                </div>
            )}

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Order</label>
                    <input 
                        className="form-input" 
                        type="number" 
                        value={form.order} 
                        onChange={e => setForm(f => ({ ...f, order: e.target.value }))} 
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                    className="form-textarea" 
                    rows={3} 
                    value={form.description} 
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
                    placeholder="Brief description..." 
                />
            </div>

            <div className="form-group">
                <label className="form-label">
                    Logo {isAdd ? "* (required)" : "(leave empty to keep current)"}
                </label>
                <input 
                    className="form-input" 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setForm(f => ({ ...f, logo: e.target.files?.[0] || null }))} 
                />
            </div>

            <div className="btn-group">
                <button 
                    className="btn btn-success" 
                    disabled={loading} 
                    onClick={() => onSubmit()}
                >
                    {loading ? "Saving…" : label}
                </button>
                <button 
                    className="btn btn-ghost" 
                    onClick={() => { 
                        setEditId(null); 
                        setEditTempId(null);
                        setShowAdd(false); 
                        setForm({ ...BLANK });
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    // Combine saved and temp items for display
    const allItems = [...items, ...tempItems];
    const totalPending = tempItems.length;

    return (
        <div>
            <div className="section-header">
                <h2>⏳ Timeline</h2>
                <p>Manage your education, experience, and other timeline entries.</p>
            </div>

            {/* Three-button pattern */}
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
                <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => { 
                        setShowAdd(true); 
                        setEditId(null); 
                        setEditTempId(null);
                        setForm({ ...BLANK }); 
                    }}
                >
                    + Add Entry (Preview)
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
                    ⏳ You have {totalPending} unsaved timeline entr{totalPending > 1 ? 'ies' : 'y'} in preview. 
                    Click "Apply" to see in portfolio or "Submit All" to save to backend.
                </div>
            )}

            {showAdd && renderItemForm(addTempItem, "➕ Add to Preview", true, true)}

            <div className="items-list">
                {allItems.map(item => {
                    const isTemp = 'isTemp' in item && item.isTemp;
                    const tempItem = isTemp ? item as TempTimeline : null;
                    
                    return (
                        <div key={isTemp ? tempItem?.id : (item as Timeline).id}>
                            <div className="item-row" style={isTemp ? { 
                                backgroundColor: '#fef3c7', 
                                borderRadius: '4px', 
                                padding: '8px' 
                            } : {}}>
                                <div className="item-thumb">
                                    {isTemp ? (
                                        tempItem?.logo_preview ? (
                                            <img src={tempItem.logo_preview} alt={item.header} style={{ maxWidth: '40px', maxHeight: '40px' }} />
                                        ) : "📅"
                                    ) : (
                                        (item as Timeline).logo_path ? 
                                            <img src={`${BASE_URL}/static${(item as Timeline).logo_path}`} alt={item.header} /> : 
                                            "📅"
                                    )}
                                </div>
                                <div className="item-info">
                                    <div className="item-name">
                                        {item.header}
                                        {isTemp && <span className="badge badge-warning" style={{ marginLeft: '8px' }}>Preview</span>}
                                    </div>
                                    <div className="item-sub">
                                        {item.subheader} · {item.date} · Order #{item.order}
                                    </div>
                                </div>
                                <div className="item-actions">
                                    {isTemp ? (
                                        <>
                                            <button 
                                                className="btn btn-ghost btn-sm" 
                                                onClick={() => {
                                                    if(tempItem) {
                                                        startEditTemp(tempItem);
                                                        setShowAdd(false);
                                                    }
                                                }}
                                                disabled={loading || !tempItem}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className="btn btn-danger btn-sm" 
                                                disabled={loading || !tempItem} 
                                                onClick={() => {
                                                    if (tempItem?.id) {
                                                        deleteTempItem(tempItem.id);
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
                                                onClick={() => startEdit(item as Timeline)}
                                                disabled={loading}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className="btn btn-danger btn-sm" 
                                                disabled={loading} 
                                                onClick={() => requireAuth(() => deleteItem((item as Timeline).id))}
                                            >
                                                🗑
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Edit forms */}
                            {!isTemp && editId === (item as Timeline).id && renderItemForm(() => submitEdit((item as Timeline).id), "✅ Save to Backend")}
                            {isTemp && editTempId === tempItem?.id && renderItemForm(() => updateTempItem(tempItem.id!), "💾 Update Preview", false, true)}
                        </div>
                    );
                })}
                {allItems.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <p>No timeline entries yet. Add one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}