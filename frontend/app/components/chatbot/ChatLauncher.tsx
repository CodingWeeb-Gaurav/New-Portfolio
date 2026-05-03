"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useChatbot } from "./ChatbotProvider";

export default function ChatLauncher() {
  const { open, openChat } = useChatbot();
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowBubble(true), 2500);
    return () => clearTimeout(t);
  }, []);

  if (open) return null;

  return (
    <div className="chat-launcher" onClick={openChat}>
      <Image
        src="/chatbot/GIF1.gif"
        alt="chatbot"
        width={90}
        height={90}
        unoptimized
      />

      {showBubble && (
        <div className="chat-bubble">
          Have some questions?
        </div>
      )}
    </div>
  );
}