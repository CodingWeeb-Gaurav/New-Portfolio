"use client";

import { useEffect, useState } from "react";
import { getFromStorage } from "@/services/adminData";
import "./timeline.css";

interface TimelineEntry {
    id?: number | string;
    header?: string;
    subheader?: string;
    description?: string;
    date?: string;
    logo_path?: string;
    order?: number;
}

export default function TimelinePage() {
    const [entries, setEntries] = useState<TimelineEntry[]>([]);

    useEffect(() => {
        const data = getFromStorage<TimelineEntry[]>("timelines");
        if (Array.isArray(data)) {
            const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
            setEntries(sorted);
        }
    }, []);

    return (
        <div className="page-container timeline-page">
            <h1 className="section-title">Timeline</h1>
            <p className="section-subtitle">My journey — education, work &amp; milestones</p>

            {entries.length === 0 ? (
                <div className="empty-state glass-card">
                    <p>No timeline data yet. Add entries via the Admin panel.</p>
                </div>
            ) : (
                <div className="timeline-list">
                    {entries.map((entry, idx) => (
                        <div className="timeline-item glass-card" key={entry.id ?? idx}>
                            <div className="timeline-dot" style={{ left: '-6px' }} />
                            <div className="timeline-body flex flex-col md:flex-row gap-6">
                                {/* Left Side: Logo */}
                                <div className="flex-shrink-0 w-20 h-20 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center p-2 hidden sm:flex">
                                    {entry.logo_path ? (
                                        <img
                                            src={entry.logo_path.startsWith('http') || entry.logo_path.startsWith('blob:') ? entry.logo_path : `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/static${entry.logo_path.startsWith('/') ? '' : '/'}${entry.logo_path}`}
                                            alt={entry.header}
                                            className="w-full h-full object-contain filter drop-shadow-md"
                                        />
                                    ) : (
                                        <span className="text-3xl">📅</span>
                                    )}
                                </div>

                                {/* Right Side: Content */}
                                <div className="flex-1">
                                    <div className="timeline-meta flex items-center justify-between mb-2">
                                        <span className="timeline-dates font-bold text-blue-400">
                                            {entry.date}
                                        </span>
                                    </div>
                                    <h3 className="timeline-title text-2xl font-bold text-white mb-1">
                                        {entry.header}
                                    </h3>
                                    {entry.subheader && (
                                        <p className="timeline-org text-lg text-gray-300 font-semibold mb-3">📍 {entry.subheader}</p>
                                    )}
                                    {entry.description && (
                                        <p className="timeline-desc text-gray-400 whitespace-pre-wrap">{entry.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
