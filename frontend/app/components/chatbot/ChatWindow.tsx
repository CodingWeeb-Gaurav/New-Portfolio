"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useChatbot } from "./ChatbotProvider";
import Markdown from "./Markdown";

export default function ChatWindow() {
  const {
    ready,
    open,
    setOpen,
    messages,
    sendMessage,
    gifMode,
    setGifMode,
  } = useChatbot();

  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (!ready || !open) return null;

  const gifSrc = {
    idle: "/chatbot/GIF2.gif",
    typing: "/chatbot/GIF3.gif",
    waiting: "/chatbot/GIF4.gif",
    streaming: "/chatbot/GIF5.gif",
    launcher: "/chatbot/GIF1.gif",
  }[gifMode];

  const handleSend = () => {
    if (!input.trim()) return;

    sendMessage(input);
    setInput("");
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-left">
          <Image
            src={gifSrc}
            alt="AI Assistant"
            width={55}
            height={55}
            className="chat-avatar"
            unoptimized
            priority
          />

          <div className="chat-title">Yuki-Chan 🥰</div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
        >
          ✕
        </button>

      </div>

      <div className="chat-body">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "msg user-msg"
                : "msg ai-msg"
            }
          >
            {m.role === "user" ? m.content : <Markdown content={m.content} />}
          </div>
        ))}

        <div ref={endRef} />
      </div>

      <div className="chat-input-row">
        <input
          value={input}
          placeholder="Ask anything..."
          onFocus={() => setGifMode("typing")}
          onBlur={() => setGifMode("idle")}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <button
          type="button"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>

  );
}