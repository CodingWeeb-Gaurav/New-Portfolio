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

  // 🔹 Listen for portfolio-ready event
  useEffect(() => {
    const handleReady = () => setReady(true);
    window.addEventListener("portfolio-ready", handleReady);
    return () =>
      window.removeEventListener("portfolio-ready", handleReady);
  }, []);

  // 🔹 WebSocket connection
  useEffect(() => {
    if (!ready) return;

    chatIdRef.current = generateChatId();

    // ✅ Use ENV instead of hardcoded localhost
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL!;

    const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";
    const wsHost = baseUrl.replace(/^https?:\/\//, "");

    const fullWsUrl = `${wsProtocol}://${wsHost}/chat/ws`;

    const ws = new WebSocket(fullWsUrl);
    wsRef.current = ws;

    let currentStreaming = "";

    ws.onopen = () => {
      // 🔹 Send handshake (chatId only)
      ws.send(
        JSON.stringify({
          chatId: chatIdRef.current,
        })
      );
    };

    ws.onmessage = (event) => {
      // 🔹 Try parsing JSON (for history)
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === "history") {
          const formatted: Message[] = parsed.messages.map(
            (m: any) => ({
              role: m.role === "ai" ? "ai" : "user",
              content: m.message,
            })
          );

          setMessages(formatted);
          return;
        }
      } catch {
        // Not JSON → continue (stream tokens)
      }

      const data = event.data;

      if (data === "__END__") {
        setGifMode("idle");
        currentStreaming = "";
        return;
      }

      // First token → create AI message
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

  // 🔹 Open chat (only inject welcome if no history)
  const openChat = () => {
    setOpen(true);

    setMessages((prev) => {
      if (prev.length > 0) return prev;

      return [
        {
          role: "ai",
          content:
            "Hello! I'm Yuki 🤗 — I can help you explore Gaurav's projects, experience, tech stack, and more. Ask me anything!",
        },
      ];
    });

    setGifMode("idle");
  };

  // 🔹 Send message
  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    if (!wsRef.current) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
    ]);

    setGifMode("waiting");

    // ✅ New protocol (NO chatId here)
    wsRef.current.send(
      JSON.stringify({
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