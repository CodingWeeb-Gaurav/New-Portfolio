"use client";

import { useEffect, useState } from "react";
import { getFromStorage } from "@/services/adminData";
import SkillCard from "../components/SkillCard";
import GithubCard from "../components/stats/GithubCard";
import LeetcodeCard from "../components/stats/LeetcodeCard";
import CodeforcesCard from "../components/stats/CodeforcesCard";
import "./skills.css";

interface Skill {
    id?: number | string;
    name?: string;
    icon?: string;
    proficiency?: number;
    category?: string;
    color?: string;
}

interface ProfileStats {
    github?: {
        username: string;
        avatar_url: string;
        public_repos: Array<{ name: string; url: string; language: string }>;
        total_commits_last_30_days: number;
        top_languages: Record<string, number>;
    };
    leetcode?: {
        username: string;
        totalSolved: number;
        easySolved: number;
        mediumSolved: number;
        hardSolved: number;
    };
    codeforces?: {
        username: string;
        rating: number;
        maxRating: number;
        rank: string;
        profile: string;
        avatar_url: string;
        ratingHistory: Array<{ date: string; rating: number; contestName: string; contestId: number; rank: number }>;
    };
}

export default function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [stats, setStats] = useState<ProfileStats | null>(null);

    useEffect(() => {
        const s = getFromStorage<Skill[]>("skills");
        if (Array.isArray(s)) setSkills(s);
        setStats(getFromStorage<ProfileStats>("profileStats"));
    }, []);

    // Group skills strictly into the 3 defined categories
    const categories = skills.reduce<Record<string, Skill[]>>((acc, sk) => {
        let cat = sk.category ?? "Programming Languages";
        // Normalize any random or slightly misspelled categories into the 3 buckets
        if (cat.toLowerCase().includes("database") || cat.toLowerCase().includes("tool")) {
            cat = "Databases & Tools";
        } else if (cat.toLowerCase().includes("frame") || cat.toLowerCase().includes("libr")) {
            cat = "Frameworks & Libraries";
        } else {
            cat = "Programming Languages";
        }

        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(sk);
        return acc;
    }, {});

    // Ensure they render in a consistent order
    const ORDERED_CATS = ["Databases & Tools", "Frameworks & Libraries", "Programming Languages"];
    const displayCategories = ORDERED_CATS.filter(c => categories[c]?.length > 0);

    return (
        <div className="page-container skills-page">
            <h1 className="section-title">Skills</h1>
            <p className="section-subtitle">What I work with</p>

            {/* Skills by category */}
            {displayCategories.length === 0 ? (
                <div className="empty-state glass-card">
                    <p>No skills data yet. Add skills via the Admin panel.</p>
                </div>
            ) : (
                displayCategories.map((cat) => (
                    <div className="skills-category" key={cat}>
                        <h2 className="skills-cat-title">{cat}</h2>
                        <div className="skills-grid" style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center", marginBottom: "3rem" }}>
                            {categories[cat].map((sk, idx) => {
                                let finalIconUrl = sk.icon || (sk as any).logo_path;
                                if (finalIconUrl && !finalIconUrl.startsWith("http") && !finalIconUrl.startsWith("blob:")) {
                                    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
                                    // if it's already a static path from api, don't double append
                                    const path = finalIconUrl.startsWith("/static") ? finalIconUrl : `/static${finalIconUrl.startsWith("/") ? "" : "/"}${finalIconUrl}`;
                                    finalIconUrl = baseUrl.replace(/\/$/, "") + path;
                                }

                                return (
                                    <SkillCard
                                        key={sk.id ?? idx}
                                        logo={finalIconUrl || ""}
                                        text={sk.name || "Skill"}
                                        hoverColors={[(sk as any).hover_color_primary || "#ffd43b", (sk as any).hover_color_secondary]}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))
            )}

            {/* External Profile Stats */}
            {stats && (
                <div className="stats-section mt-12 flex flex-col gap-8 w-full max-w-5xl mx-auto">
                    <GithubCard data={stats.github} />
                    <LeetcodeCard data={stats.leetcode} />
                    <CodeforcesCard
                        data={stats.codeforces}
                        loading={false}
                        borderColor="rgba(255,204,0,0.3)"
                        logo={null}
                        gradientColors={null}
                    />
                </div>
            )}
        </div>
    );
}
