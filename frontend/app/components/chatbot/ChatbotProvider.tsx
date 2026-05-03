"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import "./chat.css";

type Role = "user" | "ai";

type Message = {
  role: Role;
  content: string;
};

type GifMode =
  | "launcher"
  | "idle"
  | "typing"
  | "waiting"
  | "streaming";

type ChatContextType = {
  ready: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  openChat: () => void;
  messages: Message[];
  sendMessage: (text: string) => void;
  gifMode: GifMode;
  setGifMode: (m: GifMode) => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatbot() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatbot must be inside provider");
  return ctx;
}

function generateChatId() {
  const existing = localStorage.getItem("portfolio_chat_id");
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem("portfolio_chat_id", id);
  return id;
}

export default function ChatbotProvider({
  children,
}: {
  children: ReactNode;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const chatIdRef = useRef("");

  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [gifMode, setGifMode] = useState<GifMode>("launcher");

  // Listen for portfolio-ready event (fired when welcome screen ends)
  useEffect(() => {
    const handleReady = () => setReady(true);
    window.addEventListener("portfolio-ready", handleReady);
    return () => window.removeEventListener("portfolio-ready", handleReady);
  }, []);

  // Connect WebSocket only once the portfolio is ready
  useEffect(() => {
    if (!ready) return;

    chatIdRef.current = generateChatId();

    const ws = new WebSocket("ws://localhost:8000/chat/ws");
    wsRef.current = ws;

    let currentStreaming = "";

    ws.onmessage = (event) => {
      const data = event.data;

      if (data === "__END__") {
        setGifMode("idle");
        currentStreaming = "";
        return;
      }

      if (currentStreaming === "") {
        setGifMode("streaming");

        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "" },
        ]);
      }

      currentStreaming += data;

      setMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          role: "ai",
          content: currentStreaming,
        };

        return updated;
      });
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => ws.close();
  }, [ready]);

  const openChat = () => {
    setOpen(true);

    setMessages((prev) => {
      if (prev.length > 0) return prev;

      return [
        {
          role: "ai",
          content:
            "Hello! I'm Yuki🤗, here to answer any questions you have about Gaurav's: Projects, Experience  Tech stack Timeline Extracurricular work I can explain how each project was built step by step. Because if that info was already in his resume, I'd be out of a job 😢.",
        },
      ];
    });

    setGifMode("idle");
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    if (!wsRef.current) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
    ]);

    setGifMode("waiting");

    wsRef.current.send(
      JSON.stringify({
        chatId: chatIdRef.current,
        message: text,
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
        ready,
        open,
        setOpen,
        openChat,
        messages,
        sendMessage,
        gifMode,
        setGifMode,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}