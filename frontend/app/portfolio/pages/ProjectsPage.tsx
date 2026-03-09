"use client";

import { useEffect, useState } from "react";
import { getFromStorage } from "@/services/adminData";
import "./projects.css";

interface Project {
    id?: number | string;
    title?: string;
    description?: string;
    tech_stack?: string[];
    github_url?: string;
    live_url?: string;
    image_url?: string;
    category?: string | { name?: string };
    featured?: boolean;
    status?: string;
}

interface Category {
    id?: number | string;
    name?: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("All");

    useEffect(() => {
        const p = getFromStorage<Project[]>("projects");
        if (Array.isArray(p)) setProjects(p);
        const c = getFromStorage<Category[]>("projectCategories");
        if (Array.isArray(c)) setCategories(c);
    }, []);

    const getCatName = (c: Project["category"]) => {
        if (!c) return "";
        if (typeof c === "string") return c;
        return c.name ?? "";
    };

    const filtered =
        activeCategory === "All"
            ? projects
            : projects.filter((p) => getCatName(p.category) === activeCategory);

    const allCats = ["All", ...categories.map((c) => c.name ?? "")];

    return (
        <div className="page-container projects-page">
            <h1 className="section-title">Projects</h1>
            <p className="section-subtitle">Things I've built</p>

            {/* Category filter */}
            {categories.length > 0 && (
                <div className="projects-filter">
                    {allCats.map((cat) => (
                        <button
                            key={cat}
                            className={`filter-btn${activeCategory === cat ? " active" : ""}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="empty-state glass-card">
                    <p>No projects yet. Add them via the Admin panel.</p>
                </div>
            ) : (
                <div className="projects-grid grid-2">
                    {filtered.map((proj, idx) => {
                        let finalImgUrl = proj.image_url;
                        if (finalImgUrl && !finalImgUrl.startsWith("http")) {
                            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
                            finalImgUrl = baseUrl.replace(/\/$/, "") + "/" + finalImgUrl.replace(/^\//, "");
                        }

                        return (
                            <div className="project-card glass-card" key={proj.id ?? idx}>
                                {finalImgUrl && (
                                    <img
                                        src={finalImgUrl}
                                        alt={proj.title}
                                        className="project-img"
                                    />
                                )}
                                <div className="project-body">
                                    <div className="project-meta">
                                        {proj.featured && <span className="badge">Featured</span>}
                                        {proj.status && (
                                            <span className="project-status">{proj.status}</span>
                                        )}
                                    </div>
                                    <h3 className="project-title">{proj.title}</h3>
                                    <p className="project-desc">{proj.description}</p>
                                    {Array.isArray(proj.tech_stack) && proj.tech_stack.length > 0 && (
                                        <div className="project-tech">
                                            {proj.tech_stack.map((t) => (
                                                <span className="tech-tag" key={t}>{t}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="project-links">
                                        {proj.github_url && (
                                            <a href={proj.github_url} target="_blank" rel="noreferrer" className="home-link-btn">
                                                GitHub
                                            </a>
                                        )}
                                        {proj.live_url && (
                                            <a href={proj.live_url} target="_blank" rel="noreferrer" className="home-link-btn">
                                                Live Demo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
