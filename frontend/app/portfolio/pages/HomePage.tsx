"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFromStorage } from "@/services/adminData";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FiExternalLink, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import "./home.css";

type Page = "center" | "left" | "right" | "top" | "bottom";

interface HomePageProps {
    onNavigate: (page: Page) => void;
}

interface TimelineEntry {
    header?: string;
    subheader?: string;
    date?: string;
    logo_path?: string;
    order?: number;
}

interface Skill {
    name?: string;
    icon?: string;
    logo_path?: string;
    category?: string;
    order?: number;
    [key: string]: unknown;
}

interface Project {
    name?: string;
    description?: string;
    image_link?: string;
    image_preview?: string;
    skills?: string[];
    github_url?: string;
    demo_url?: string;
    difficulty?: number;
    category_id?: string;
    enabled?: boolean;
}

interface Category {
    id?: string;
    name?: string;
}

interface ProfileHighlight {
    title?: string;
    subtitle?: string;
    enabled?: boolean;
}

interface ProfileWhatIDo {
    title?: string;
    subtitle?: string;
    enabled?: boolean;
}

interface ProfileContact {
    email?: string;
    phone?: string;
    location?: string;
    enabled?: boolean;
}

interface ProfileData {
    github_url?: string;
    linkedin_url?: string;
    resume_webdev?: string;
    resume_ai_ml?: string;
    description1?: string;
    description2?: string;
    highlights?: ProfileHighlight[];
    what_i_do?: ProfileWhatIDo[];
    soft_skills?: string[];
    contact?: ProfileContact;
    enabled?: boolean;
}

export default function HomePage({ onNavigate }: HomePageProps) {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
    const [profileImage, setProfileImage] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

    /* Profile image: simple URL resolution — no /static prefix,
       since /profile/image likely returns an already-full URL or
       a path the backend serves directly. */
    function resolveProfileImg(raw?: string) {
        if (!raw) return "";
        if (raw.startsWith("http") || raw.startsWith("blob:")) return raw;
        return BASE.replace(/\/$/, "") + (raw.startsWith("/") ? raw : "/" + raw);
    }

    /* Project / timeline / skill images — backend serves from /static/ */
    function resolveStaticImg(raw?: string) {
        if (!raw) return "";
        if (raw.startsWith("http") || raw.startsWith("blob:")) return raw;
        const path = raw.startsWith("/static")
            ? raw
            : `/static${raw.startsWith("/") ? "" : "/"}${raw}`;
        return BASE.replace(/\/$/, "") + path;
    }

    useEffect(() => {
        setProfileData(getFromStorage<ProfileData>("profileData"));

        const proj = getFromStorage<Project[]>("projects");
        if (Array.isArray(proj)) {
            setProjects(
                proj
                    .filter(p => (p.difficulty ?? 0) >= 3 && p.enabled !== false)
                    .slice(0, 3)
            );
        }

        const s = getFromStorage<Skill[]>("skills");
        if (Array.isArray(s)) setSkills(s);

        const t = getFromStorage<TimelineEntry[]>("timelines");
        if (Array.isArray(t)) {
            const sorted = [...t].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            setTimeline(sorted.slice(0, 3));
        }

        const imgData = getFromStorage<{ url?: string; image_url?: string }>("profileImage");
        const rawImg = imgData?.url ?? imgData?.image_url ?? "";
        setProfileImage(resolveProfileImg(rawImg));

        const cats = getFromStorage<Category[]>("projectCategories");
        if (Array.isArray(cats)) setCategories(cats);
    }, []);

    /* ---- SKILLS PREVIEW — top 2 per category by order (total 6) ---- */
    const catGroups = skills.reduce<Record<string, Skill[]>>((acc, sk) => {
        let cat = sk.category ?? "lang";
        if (cat.toLowerCase().includes("database") || cat.toLowerCase().includes("tool")) cat = "tools";
        else if (cat.toLowerCase().includes("frame") || cat.toLowerCase().includes("libr")) cat = "frameworks";
        else cat = "lang";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(sk);
        return acc;
    }, {});

    const topFromGroup = (g: Skill[]) =>
        [...g]
            .sort((a, b) => ((a.order as number) ?? 0) - ((b.order as number) ?? 0))
            .slice(0, 2);

    const previewSkills = [
        ...topFromGroup(catGroups["lang"] ?? []),
        ...topFromGroup(catGroups["frameworks"] ?? []),
        ...topFromGroup(catGroups["tools"] ?? []),
        
        
    ].slice(0, 6);

    /* Category name for project placeholder */
    const getCatName = (catId?: string) =>
        categories.find(c => c.id === catId)?.name ?? "PROJECT";

    return (
        <div className="page-container home-page">

            {/* ── HERO ── */}
            <motion.section
                className="home-hero glass-card"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="hero-text">
                    <p className="hero-intro">Welcome to my portfolio</p>
                    <h1 className="hero-name">Gaurav Kumar Gupta</h1>
                    <p className="hero-tagline">Full Stack Developer | ML Engineer | Competitive Programmer</p>
                    <p className="hero-cred">IIT Patna | Research Paper @ RITEEC 2025</p>
                    <div className="hero-buttons">
                        {profileData?.resume_ai_ml && (
                            <a href={profileData.resume_ai_ml} target="_blank" className="home-link-btn">
                                Data Science Resume ⬇
                            </a>
                        )}
                        {profileData?.resume_webdev && (
                            <a href={profileData.resume_webdev} target="_blank" className="home-link-btn">
                                Web Dev Resume ⬇
                            </a>
                        )}
                        {profileData?.github_url && (
                            <a href={profileData.github_url} target="_blank" className="icon-link" aria-label="GitHub">
                                <FaGithub size={24} />
                            </a>
                        )}
                        {profileData?.linkedin_url && (
                            <a href={profileData.linkedin_url} target="_blank" className="icon-link" aria-label="LinkedIn">
                                <FaLinkedin size={24} />
                            </a>
                        )}
                    </div>
                </div>

                {profileImage && (
                    <motion.img
                        src={profileImage}
                        className="hero-avatar"
                        alt="Profile"
                        initial={{ y: 0 }}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    />
                )}
            </motion.section>


            {/* ── FEATURED PROJECTS (3 cards, image top / title+links bottom) ── */}
            {projects.length > 0 && (
                <section className="glass-card">
                    <h2 className="section-title">Featured Projects</h2>

                    <div className="home-projects-grid">
                        {projects.map((p, i) => {
                            const imgSrc = resolveStaticImg(p.image_preview || p.image_link);
                            const catName = getCatName(p.category_id);
                            return (
                                <div key={i} className="home-project-card">
                                    <div className="home-proj-img">
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={p.name} />
                                        ) : (
                                            <div className="home-proj-placeholder">
                                                <span>{catName}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="home-proj-body">
                                        <h3 className="home-proj-title">{p.name}</h3>
                                        <div className="home-proj-links">
                                            {p.github_url && (
                                                <a href={p.github_url} target="_blank" rel="noreferrer"
                                                    className="proj-icon-link" title="GitHub">
                                                    <FaGithub size={18} />
                                                </a>
                                            )}
                                            {p.demo_url && (
                                                <a href={p.demo_url} target="_blank" rel="noreferrer"
                                                    className="proj-icon-link" title="Live Demo">
                                                    <FiExternalLink size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button className="view-more-btn" onClick={() => onNavigate("right")}>
                        View All Projects →
                    </button>
                </section>
            )}


            {/* ── SKILLS PREVIEW — large floating icons, 6 across on desktop ── */}
            {previewSkills.length > 0 && (
                <section className="glass-card">
                    <h2 className="section-title">Skills</h2>

                    <div className="skills-float-row">
                        {previewSkills.map((s, i) => {
                            const iconSrc = resolveStaticImg(
                                (s.icon as string) || (s.logo_path as string) || ""
                            );
                            return iconSrc ? (
                                <motion.div
                                    key={i}
                                    className="skill-float-icon"
                                    title={s.name as string}
                                    initial={{ y: 0 }}
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2.8 + i * 0.4,
                                        ease: "easeInOut",
                                        delay: i * 0.2,
                                    }}
                                >
                                    <img src={iconSrc} alt={s.name as string} />
                                </motion.div>
                            ) : null;
                        })}
                    </div>

                    <button className="view-more-btn" onClick={() => onNavigate("bottom")}>
                        All Skills →
                    </button>
                </section>
            )}


            {/* ── ABOUT ME (expanded, no contact here) ── */}
            <section className="glass-card about-section">
                <h2 className="section-title">About Me</h2>

                {profileData?.description1 && <p className="about-para">{profileData.description1}</p>}
                {profileData?.description2 && <p className="about-para">{profileData.description2}</p>}

                {/* Highlights */}
                {(profileData?.highlights?.filter(h => h.enabled !== false) ?? []).length > 0 && (
                    <div className="about-highlights">
                        {profileData!.highlights!.filter(h => h.enabled !== false).map((h, i) => (
                            <div key={i} className="highlight-box glass-card">
                                <span className="highlight-val">{h.title}</span>
                                <span className="highlight-lab">{h.subtitle}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* What I Do */}
                {(profileData?.what_i_do?.filter(w => w.enabled !== false) ?? []).length > 0 && (
                    <div className="about-what-i-do">
                        <h3 className="about-subheader">What I Do</h3>
                        <div className="what-i-do-grid">
                            {profileData!.what_i_do!.filter(w => w.enabled !== false).map((w, i) => (
                                <div key={i} className="what-i-do-card glass-card">
                                    <strong className="wid-title">{w.title}</strong>
                                    <p className="wid-sub">{w.subtitle}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Soft Skills */}
                {(profileData?.soft_skills ?? []).length > 0 && (
                    <div className="about-soft-skills">
                        <h3 className="about-subheader">Soft Skills</h3>
                        <div className="soft-skills-tags">
                            {profileData!.soft_skills!.map((sk, i) => (
                                <span key={i} className="soft-skill-tag">{sk}</span>
                            ))}
                        </div>
                    </div>
                )}
            </section>


            {/* ── RECENT JOURNEY — horizontal timeline cards ── */}
            {timeline.length > 0 && (
                <section className="glass-card">
                    <h2 className="section-title">Recent Journey</h2>

                    <div className="timeline-preview-row">
                        {timeline.map((t, i) => {
                            const logoSrc = resolveStaticImg(t.logo_path);
                            return (
                                <div key={i} className="timeline-mini-card glass-card">
                                    <div className="timeline-mini-logo">
                                        {logoSrc ? (
                                            <img src={logoSrc} alt={t.header} />
                                        ) : (
                                            <span>📅</span>
                                        )}
                                    </div>
                                    <div className="timeline-mini-body">
                                        <span className="timeline-mini-date">{t.date}</span>
                                        <strong className="timeline-mini-header">{t.header}</strong>
                                        {t.subheader && (
                                            <span className="timeline-mini-sub">📍 {t.subheader}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button className="view-more-btn" onClick={() => onNavigate("left")}>
                        View Full Timeline →
                    </button>
                </section>
            )}


            {/* ── GET IN TOUCH — contact card at bottom ── */}
            {profileData?.contact && profileData.contact.enabled !== false && (
                <section className="glass-card contact-card">
                    <h2 className="section-title">Get In Touch</h2>
                    <p className="contact-tagline">
                        Feel free to reach out for collaboration, opportunities, or just a quick hello.
                    </p>

                    <div className="contact-grid">
                        {profileData.contact.email && (
                            <a href={`mailto:${profileData.contact.email}`} className="contact-item-box">
                                <span className="contact-icon"><FiMail size={22} /></span>
                                <div>
                                    <span className="contact-label">Email</span>
                                    <span className="contact-value">{profileData.contact.email}</span>
                                </div>
                            </a>
                        )}
                        {profileData.contact.phone && (
                            <a href={`tel:${profileData.contact.phone}`} className="contact-item-box">
                                <span className="contact-icon"><FiPhone size={22} /></span>
                                <div>
                                    <span className="contact-label">Phone / WhatsApp</span>
                                    <span className="contact-value">{profileData.contact.phone}</span>
                                </div>
                            </a>
                        )}
                        {profileData.contact.location && (
                            <div className="contact-item-box">
                                <span className="contact-icon"><FiMapPin size={22} /></span>
                                <div>
                                    <span className="contact-label">Location</span>
                                    <span className="contact-value">{profileData.contact.location}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="contact-footer">
                        <strong>Gaurav Kumar Gupta</strong>
                        <p>Building the future through code, one project at a time.</p>
                    </div>
                </section>
            )}

        </div>
    );
}