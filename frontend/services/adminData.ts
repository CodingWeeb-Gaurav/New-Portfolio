import { apiRequest } from "./api";

export const STORAGE_KEYS = {
    skills: "portfolio_skills",
    projects: "portfolio_projects",
    projectCategories: "portfolio_project_categories",
    timelines: "portfolio_timelines",
    profileData: "portfolio_profile_data",
    aboutMe: "portfolio_aboutme",
    profileImage: "portfolio_profile_image",
    profileStats: "portfolio_profile_stats",
} as const;

type StorageKey = keyof typeof STORAGE_KEYS;

async function fetchAndStore(key: StorageKey, endpoint: string) {
    try {
        const data = await apiRequest(endpoint);
        // aboutMe comes back as { content: "..." }, store just the string
        const toStore = key === "aboutMe" ? (data.content ?? "") : data;
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(toStore));
        return toStore;
    } catch (e) {
        console.error(`Failed to fetch ${endpoint}:`, e);
        return null;
    }
}

export async function fetchAllData() {
    return Promise.allSettled([
        fetchAndStore("skills", "/api/skills/"),
        fetchAndStore("projects", "/api/projects/"),
        fetchAndStore("projectCategories", "/api/project-categories/"),
        fetchAndStore("timelines", "/api/timelines/"),
        fetchAndStore("profileData", "/profile/data"),
        fetchAndStore("aboutMe", "/profile/aboutme"),
        fetchAndStore("profileImage", "/profile/image"),
        fetchAndStore("profileStats", "/profile/stats"),
    ]);
}

export function getFromStorage<T>(key: StorageKey): T | null {
    if (typeof window === "undefined") return null;
    const val = localStorage.getItem(STORAGE_KEYS[key]);
    if (!val) return null;
    try {
        return JSON.parse(val) as T;
    } catch {
        return val as unknown as T;
    }
}

export function saveToStorage(key: StorageKey, data: unknown) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
}
