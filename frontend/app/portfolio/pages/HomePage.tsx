"use client";

import { useEffect, useState } from "react";
import { getFromStorage } from "@/services/adminData";
import "./home.css";

type Page = "center" | "left" | "right" | "top" | "bottom";

interface HomePageProps {
    onNavigate: (page: Page) => void;
}

interface ProfileData {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    github?: string;
    linkedin?: string;
    codeforces?: string;
    leetcode?: string;
}

interface ProfileStats {
    github_stars?: number;
    github_repos?: number;
    leetcode_solved?: number;
    codeforces_rating?: number;
    codeforces_max_rating?: number;
    codeforces_rank?: string;
}

const NAV_TILES = [
    { page: "left" as Page, label: "Timeline", icon: "⏳", desc: "My journey & experience" },
    { page: "bottom" as Page, label: "Skills", icon: "🛠", desc: "Tools & technologies I use" },
    { page: "right" as Page, label: "Projects", icon: "🗂", desc: "Things I have built" },
    { page: "top" as Page, label: "Admin", icon: "⚙️", desc: "Dev console & data management" },
];

export default function HomePage({ onNavigate }: HomePageProps) {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [aboutMe, setAboutMe] = useState<string>("");
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [profileImage, setProfileImage] = useState<string>("");

    useEffect(() => {
        setProfile(getFromStorage<ProfileData>("profileData"));
        setAboutMe(getFromStorage<string>("aboutMe") ?? "");
        setStats(getFromStorage<ProfileStats>("profileStats"));
        const imgData = getFromStorage<{ url?: string; image_url?: string }>("profileImage");
        let rawUrl = imgData?.url ?? imgData?.image_url ?? "";
        if (rawUrl && !rawUrl.startsWith("http") && !rawUrl.startsWith("blob:") && !rawUrl.startsWith("data:")) {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
            // Ensure no double slashes if baseUrl ends with slash and rawUrl starts with slash
            rawUrl = baseUrl.replace(/\/$/, "") + "/" + rawUrl.replace(/^\//, "");
        }
        setProfileImage(rawUrl);
    }, []);

    return (
        <div className="page-container home-page">
            {/* Hero */}
            <div className="home-hero glass-card">
                {profileImage && (
                    <img src={profileImage} alt="Profile" className="home-avatar" />
                )}
                <div className="home-hero-text">
                    <h1 className="section-title home-name">
                        {profile?.name ?? "Loading…"}
                    </h1>
                    <p className="home-bio">{aboutMe || "Welcome to my portfolio."}</p>

                    <div className="home-links">
                        {profile?.github && (
                            <a href={`https://github.com/${profile.github}`} target="_blank" rel="noreferrer" className="home-link-btn">
                                GitHub
                            </a>
                        )}
                        {profile?.linkedin && (
                            <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noreferrer" className="home-link-btn">
                                LinkedIn
                            </a>
                        )}
                        {profile?.codeforces && (
                            <a href={`https://codeforces.com/profile/${profile.codeforces}`} target="_blank" rel="noreferrer" className="home-link-btn">
                                Codeforces
                            </a>
                        )}
                        {profile?.leetcode && (
                            <a href={`https://leetcode.com/${profile.leetcode}`} target="_blank" rel="noreferrer" className="home-link-btn">
                                LeetCode
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats row */}
            {stats && (
                <div className="home-stats-row">
                    {stats.github_stars !== undefined && (
                        <div className="home-stat-card glass-card">
                            <div className="home-stat-icon">⭐</div>
                            <div className="home-stat-value">{stats.github_stars}</div>
                            <div className="home-stat-label">GitHub Stars</div>
                        </div>
                    )}
                    {stats.github_repos !== undefined && (
                        <div className="home-stat-card glass-card">
                            <div className="home-stat-icon">📦</div>
                            <div className="home-stat-value">{stats.github_repos}</div>
                            <div className="home-stat-label">Repos</div>
                        </div>
                    )}
                    {stats.leetcode_solved !== undefined && (
                        <div className="home-stat-card glass-card">
                            <div className="home-stat-icon">🧩</div>
                            <div className="home-stat-value">{stats.leetcode_solved}</div>
                            <div className="home-stat-label">LeetCode Solved</div>
                        </div>
                    )}
                    {stats.codeforces_rating !== undefined && (
                        <div className="home-stat-card glass-card">
                            <div className="home-stat-icon">🏆</div>
                            <div className="home-stat-value">{stats.codeforces_rating}</div>
                            <div className="home-stat-label">CF Rating</div>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation tiles */}
            <div className="home-tiles grid-2">
                {NAV_TILES.map(({ page, label, icon, desc }) => (
                    <button
                        key={page}
                        className="home-tile glass-card"
                        onClick={() => onNavigate(page)}
                    >
                        <span className="home-tile-icon">{icon}</span>
                        <span className="home-tile-label">{label}</span>
                        <span className="home-tile-desc">{desc}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
