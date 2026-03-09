"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

type Page = "center" | "left" | "right" | "top" | "bottom";
type Direction = "center" | "left" | "right" | "up" | "down";

interface NavProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    onNavigateDir: (dir: Direction) => void;
}

const NAV_LINKS: { page: Page; label: string; icon: string }[] = [
    { page: "center", label: "Home", icon: "⌂" },
    { page: "left", label: "Timeline", icon: "⏳" },
    { page: "bottom", label: "Skills", icon: "🛠" },
    { page: "right", label: "Projects", icon: "🗂" },
    { page: "top", label: "Admin", icon: "⚙️" },
];

export default function Navigation({ activePage, onNavigate }: NavProps) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const el = document.getElementById("portfolio-scroll");
        if (!el) return;
        const handler = () => setScrolled(el.scrollTop > 40);
        el.addEventListener("scroll", handler);
        return () => el.removeEventListener("scroll", handler);
    }, []);

    const handleClick = (page: Page) => {
        onNavigate(page);
        setMobileOpen(false);
    };

    return (
        <nav
            className={`portfolio-nav${scrolled ? " scrolled" : ""}`}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: "var(--nav-height)",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 1.5rem",
                background: scrolled
                    ? "rgba(10, 10, 25, 0.92)"
                    : "rgba(10, 10, 25, 0.7)",
                backdropFilter: "blur(14px)",
                borderBottom: "1px solid var(--border)",
                transition: "background 0.3s ease",
            }}
        >
            {/* Logo */}
            <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 900,
                fontSize: "1.6rem",
                letterSpacing: "0.15em",
                background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
            }}>
                GKG
            </div>

            {/* Desktop nav links */}
            <div className="nav-desktop" style={{ display: "flex", gap: "0.25rem" }}>
                {NAV_LINKS.map(({ page, label, icon }) => (
                    <button
                        key={page}
                        onClick={() => handleClick(page)}
                        style={{
                            padding: "0.4rem 1.1rem",
                            borderRadius: "999px",
                            border: activePage === page
                                ? "1px solid var(--accent)"
                                : "1px solid transparent",
                            background: activePage === page
                                ? "rgba(167, 139, 250, 0.15)"
                                : "transparent",
                            color: activePage === page ? "var(--accent)" : "var(--text-main)",
                            fontWeight: activePage === page ? 600 : 400,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                        }}
                    >
                        <span style={{ fontSize: "0.85rem" }}>{icon}</span>
                        {label}
                    </button>
                ))}
            </div>

            {/* Mobile hamburger */}
            <button
                className="nav-hamburger"
                onClick={() => setMobileOpen((o) => !o)}
                style={{
                    display: "none",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    padding: "0.4rem",
                }}
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "var(--nav-height)",
                        left: 0,
                        right: 0,
                        background: "rgba(10, 10, 25, 0.97)",
                        backdropFilter: "blur(16px)",
                        borderBottom: "1px solid var(--border)",
                        padding: "0.75rem 1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                    }}
                >
                    {NAV_LINKS.map(({ page, label, icon }) => (
                        <button
                            key={page}
                            onClick={() => handleClick(page)}
                            style={{
                                padding: "0.7rem 1rem",
                                borderRadius: "10px",
                                border: activePage === page ? "1px solid var(--accent)" : "1px solid var(--border)",
                                background: activePage === page ? "rgba(167, 139, 250, 0.15)" : "transparent",
                                color: activePage === page ? "var(--accent)" : "var(--text-main)",
                                fontWeight: activePage === page ? 600 : 400,
                                fontSize: "1rem",
                                cursor: "pointer",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.6rem",
                            }}
                        >
                            {icon} {label}
                        </button>
                    ))}
                </div>
            )}

            {/* CSS override for mobile hamburger visibility */}
            <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
      `}</style>
        </nav>
    );
}
