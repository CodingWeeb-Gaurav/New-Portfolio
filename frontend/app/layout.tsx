import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ChatbotProvider from "./components/chatbot/ChatbotProvider";
import ChatLauncher from "./components/chatbot/ChatLauncher";
import ChatWindow from "./components/chatbot/ChatWindow";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GKG | Portfolio",
  description: "Gaurav's developer portfolio — projects, skills, and timeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChatbotProvider>
          {children}
          <ChatLauncher />
          <ChatWindow />
        </ChatbotProvider>
      </body>
    </html>
  );
}