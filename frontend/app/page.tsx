"use client";

import { useState, useEffect } from "react";
import WelcomeScreen from "@/app/components/WelcomeScreen";
import PageLayout from "@/app/portfolio/PageLayout";
import { fetchAllData } from "@/services/adminData";

type AppState = "welcome" | "portfolio";

export default function App() {
  const [appState, setAppState] = useState<AppState>("welcome");
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    // Kick off all GET API fetches immediately — populates localStorage
    fetchAllData().finally(() => setDataReady(true));
    // Max 2.5s timeout enforced inside WelcomeScreen itself
  }, []);

  const handleContinue = () => {
    setAppState("portfolio");
  };

  return (
    <>
      {appState === "welcome" && (
        <WelcomeScreen onContinue={handleContinue} />
      )}
      {appState === "portfolio" && <PageLayout />}
    </>
  );
}