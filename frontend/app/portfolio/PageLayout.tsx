"use client";

import { useState, useEffect, useCallback } from "react";
import Navigation from "./Navigation";
import HomePage from "./pages/HomePage";
import TimelinePage from "./pages/TimelinePage";
import SkillsPage from "./pages/SkillsPage";
import ProjectsPage from "./pages/ProjectsPage";
import AdminPage from "./pages/AdminPage";
import "../portfolio/portfolio.css";

// ── Page map ─────────────────────────────────────────────────────────────────
// center = Home, left = Timeline, right = Projects, bottom = Skills, top = Admin
// ──────────────────────────────────────────────────────────────────────────────

type Page = "center" | "left" | "right" | "top" | "bottom";
type Direction = "center" | "left" | "right" | "up" | "down";

const PAGE_TRANSITIONS: Record<Page, Partial<Record<Direction, Page>>> = {
    center: { left: "left", right: "right", up: "top", down: "bottom" },
    left: { left: "right", right: "center", up: "top", down: "bottom" },
    right: { left: "center", right: "left", up: "top", down: "bottom" },
    top: { up: "bottom", down: "center", left: "left", right: "right" },
    bottom: { up: "center", down: "top", left: "left", right: "right" },
};

/** Background-position for each page (bg-size 250% 250%) */
const BG_POSITION: Record<Page, string> = {
    center: "50% 50%",
    left: "20% 50%",
    right: "80% 50%",
    top: "50% 20%",
    bottom: "50% 80%",
};

/** Pairs of pages that are "opposite" — transition must pass through center */
const NEEDS_CENTER_HOP: Array<[Page, Page]> = [
    ["left", "right"],
    ["top", "bottom"],
];

function needsCenterHop(a: Page, b: Page) {
    return NEEDS_CENTER_HOP.some(
        ([x, y]) => (a === x && b === y) || (a === y && b === x)
    );
}

export default function PageLayout() {
    const [activePage, setActivePage] = useState<Page>("center");
    const [transitioning, setTransitioning] = useState(false);

    /** Navigate by page name (center/left/right/top/bottom) */
    const navigateTo = useCallback(
        (target: Page) => {
            if (transitioning || target === activePage) return;

            if (needsCenterHop(activePage, target)) {
                setTransitioning(true);
                setActivePage("center");
                setTimeout(() => {
                    setActivePage(target);
                    setTransitioning(false);
                }, 650); // wait for bg slide to center, then slide to target
            } else {
                setActivePage(target);
            }
        },
        [activePage, transitioning]
    );

    /** Navigate by direction (up/down/left/right) */
    const navigateDir = useCallback(
        (dir: Direction) => {
            const target = PAGE_TRANSITIONS[activePage]?.[dir];
            if (target) navigateTo(target);
        },
        [activePage, navigateTo]
    );

    // ── Keyboard navigation ────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Do not intercept if user is typing in an input, textarea, or contenteditable
            const target = e.target as HTMLElement;
            if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
                return;
            }

            const map: Partial<Record<string, Direction>> = {
                ArrowLeft: "left",
                ArrowRight: "right",
                ArrowUp: "up",
                ArrowDown: "down",
            };
            const dir = map[e.key];
            if (dir) {
                e.preventDefault();
                navigateDir(dir);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [navigateDir]);

    // ── Scroll to top after each page change ──────────────────────────────────
    useEffect(() => {
        const el = document.getElementById("portfolio-scroll");
        if (el) el.scrollTo({ top: 0, behavior: "smooth" });
    }, [activePage]);

    const renderPage = () => {
        switch (activePage) {
            case "center": return <HomePage onNavigate={navigateTo} />;
            case "left": return <TimelinePage />;
            case "right": return <ProjectsPage />;
            case "top": return <AdminPage />;
            case "bottom": return <SkillsPage />;
        }
    };

    return (
        <div className="portfolio-wrapper">
            {/* Sliding background */}

            <div
                className="portfolio-bg"
                style={{ backgroundPosition: BG_POSITION[activePage] }}
            />
            <div className="portfolio-overlay" />

            {/* Fixed navigation */}
            <Navigation
                activePage={activePage}
                onNavigate={(page: Page) => navigateTo(page)}
                onNavigateDir={navigateDir}
            />

            {/* Scrollable page content */}
            <div className="portfolio-content" id="portfolio-scroll">
                {renderPage()}
            </div>
        </div>
    );
}
