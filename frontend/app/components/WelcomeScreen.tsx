"use client";

import { useEffect, useState } from "react";
import "./stars.css";
import "./loadingButton.css";

const greetings: Record<string, string> = {
    IN: "नमस्ते",
    FR: "Bonjour",
    JP: "こんにちは",
    DE: "Hallo",
    ES: "Hola",
    CN: "你好",
    RU: "Здравствуйте",
    IT: "Ciao",
    KR: "안녕하세요",
    SA: "مرحبا",
    BR: "Olá",
    US: "Hello",
    GB: "Hello",
    CA: "Hello",
    AU: "Hello",
    default: "Hello",
};

interface WelcomeScreenProps {
    onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
    const [greeting, setGreeting] = useState(greetings.default);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // Max wait: 2.5 seconds, then button activates regardless
        const maxTimer = setTimeout(() => setReady(true), 2500);

        // Fetch country from ipapi.co (free, no key, CORS-friendly)
        fetch("https://ipapi.co/json/")
            .then((r) => r.json())
            .then((d) => {
                const code: string = d.country_code ?? "default";
                setGreeting(greetings[code] ?? greetings.default);
            })
            .catch(() => {
                /* silent fallback — keep default Hello */
            });

        return () => clearTimeout(maxTimer);
    }, []);

    return (
        <div className="welcome-root">
            {/* Stars layers */}
            <div id="stars" />
            <div id="stars2" />
            <div id="stars3" />

            <div id="title">
                <span className="welcome-label">WELCOME</span>
                <br />
                <span className="welcome-greeting">{greeting}</span>
                <br />

                <div className="button-container" style={{ marginTop: "2rem" }}>
                    <button
                        className={`animated-button${ready ? " ready" : ""}`}
                        onClick={ready ? onContinue : undefined}
                        disabled={!ready}
                    >
                        {ready ? "Continue" : "Loading…"}
                        {!ready && <span className="progress-border" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
