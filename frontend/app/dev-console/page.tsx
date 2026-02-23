/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { login } from "@/services/auth";
import { apiRequest } from "@/services/api";

export default function DevConsole() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [endpoint, setEndpoint] = useState("/projects/");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("{}");
  const [response, setResponse] = useState<any>(null);

  async function handleLogin() {
    try {
      const data = await login(email, password);
      setResponse(data);
    } catch (err: any) {
      setResponse(err.message || "Login failed");
    }
  }

  async function handleRequest() {
    try {
      const parsedBody =
        method === "GET" || method === "DELETE"
          ? undefined
          : body
          ? JSON.parse(body)
          : undefined;

      const data = await apiRequest(endpoint, method, parsedBody);
      setResponse(data);
    } catch (err: any) {
      setResponse(err.message || "Request failed");
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: "8px",
    marginRight: "8px",
    marginBottom: "10px",
    borderRadius: 6,
    border: "1px solid #ccc",
  };

  const buttonPrimary: React.CSSProperties = {
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginRight: "10px",
  };

  const buttonSuccess: React.CSSProperties = {
    padding: "10px 16px",
    backgroundColor: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    marginTop: "10px",
  };

  const buttonSecondary: React.CSSProperties = {
    padding: "6px 12px",
    backgroundColor: "#444",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  };

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "monospace",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: 20 }}>Dev API Console</h1>

      {/* LOGIN SECTION */}
      <h3>Login</h3>
      <div style={{ marginBottom: 20 }}>
        <input
          style={inputStyle}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={inputStyle}
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={buttonSecondary}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>

        <br />

        <button style={buttonPrimary} onClick={handleLogin}>
          Login
        </button>
      </div>

      <hr />

      {/* API TESTER SECTION */}
      <h3 style={{ marginTop: 20 }}>Custom API Tester</h3>

      <div style={{ marginBottom: 10 }}>
        <input
          style={{ ...inputStyle, width: 400 }}
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
        />

        <select
          style={inputStyle}
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>

      {method !== "GET" && method !== "DELETE" && (
        <textarea
          rows={8}
          cols={80}
          style={{
            ...inputStyle,
            width: "100%",
            fontFamily: "monospace",
          }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      )}

      <br />

      <button style={buttonSuccess} onClick={handleRequest}>
        Send Request
      </button>

      <hr style={{ marginTop: 30 }} />

      {/* RESPONSE SECTION */}
      <h3>Response</h3>
      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 20,
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {response
          ? JSON.stringify(response, null, 2)
          : "No response yet..."}
      </pre>
    </div>
  );
}