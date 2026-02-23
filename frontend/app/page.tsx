/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { login } from "@/services/auth";
import { apiRequest } from "@/services/api";

export default function DevConsole() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [endpoint, setEndpoint] = useState("/projects/");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState("{}");
  const [response, setResponse] = useState<any>(null);

  async function handleLogin() {
    try {
      const data = await login(email, password);
      setResponse(data);
    } catch (err: any) {
      setResponse(err.message);
    }
  }

  async function handleRequest() {
    try {
      const parsedBody = body ? JSON.parse(body) : undefined;
      const data = await apiRequest(endpoint, method, parsedBody);
      setResponse(data);
    } catch (err: any) {
      setResponse(err.message);
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>Dev API Console</h1>

      <h3>Login</h3>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>

      <hr />

      <h3>Custom API Tester</h3>

      <div>
        <input
          style={{ width: 400 }}
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
        />

        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>

      <textarea
        rows={8}
        cols={80}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <br />
      <button onClick={handleRequest}>Send Request</button>

      <hr />

      <h3>Response</h3>
      <pre style={{ background: "#111", color: "#0f0", padding: 20 }}>
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
}