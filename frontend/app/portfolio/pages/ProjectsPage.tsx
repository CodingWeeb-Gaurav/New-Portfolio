"use client";

import { useEffect, useState } from "react";
import { getFromStorage } from "@/services/adminData";
import { FaGithub } from "react-icons/fa";
import { FiExternalLink } from "react-icons/fi";
import "./projects.css";

interface Project {
    id?: string;
    name?: string;
    description?: string;
    skills?: string[];
    github_url?: string;
    demo_url?: string;
    image_link?: string;
    image_preview?: string;
    category_id?: string;
    difficulty?: number;
    enabled?: boolean;
    order?: number;
}

interface Category {
    id?: string;
    name?: string;
    enabled?: boolean;
    order?: number;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    function resolveImg(raw?: string) {
        if (!raw) return "";
        if (raw.startsWith("http") || raw.startsWith("blob:")) return raw;
        return BASE.replace(/\/$/, "") + "/static" + (raw.startsWith("/") ? raw : "/" + raw);
    }

    useEffect(() => {
        const p = getFromStorage<Project[]>("projects");
        if (Array.isArray(p)) setProjects(p.filter(pr => pr.enabled !== false));
        const c = getFromStorage<Category[]>("projectCategories");
        if (Array.isArray(c)) setCategories(c.filter(cat => cat.enabled !== false));
    }, []);

    /* Group projects by category, sorted by category order */
    const sortedCats = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const grouped = sortedCats
        .map(cat => ({
            cat,
            items: [...projects.filter(p => p.category_id === cat.id)]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        }))
        .filter(g => g.items.length > 0);

    return (
        <div className="page-container projects-page">
            <h1 className="section-title">Projects</h1>
            <p className="section-subtitle">Things I&apos;ve built</p>

            {grouped.length === 0 ? (
                <div className="empty-state glass-card">
                    <p>No projects yet. Add them via the Admin panel.</p>
                </div>
            ) : (
                grouped.map(({ cat, items }) => (
                    <div className="projects-category" key={cat.id}>
                        <h2 className="projects-cat-title">{cat.name}</h2>

                        <div className="projects-row">
                            {items.map((proj, idx) => {
                                const imgSrc = resolveImg(proj.image_preview || proj.image_link);

                                return (
                                    <div className="project-card glass-card" key={proj.id ?? idx}>
                                        {/* Image — top 50% */}
                                        <div className="project-img-area">
                                            {imgSrc ? (
                                                <img
                                                    src={imgSrc}
                                                    alt={proj.name}
                                                    className="project-img"
                                                />
                                            ) : (
                                                <div className="project-img-placeholder">
                                                    <span>{cat.name ?? "PROJECT"}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Body — bottom 50% */}
                                        <div className="project-body">
                                            <h3 className="project-title">{proj.name}</h3>
                                            <p className="project-desc">{proj.description}</p>

                                            {Array.isArray(proj.skills) && proj.skills.length > 0 && (
                                                <div className="project-tech">
                                                    {proj.skills.map(s => (
                                                        <span className="tech-tag" key={s}>{s}</span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="project-links">
                                                {proj.github_url && (
                                                    <a
                                                        href={proj.github_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="proj-icon-link"
                                                        title="GitHub"
                                                    >
                                                        <FaGithub size={20} />
                                                    </a>
                                                )}
                                                {proj.demo_url && (
                                                    <a
                                                        href={proj.demo_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="proj-icon-link"
                                                        title="Live Demo"
                                                    >
                                                        <FiExternalLink size={20} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
