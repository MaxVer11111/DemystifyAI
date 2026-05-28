// src/components/auth/SignInForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { createMockClient } from "@/lib/supabase/mock";

// Toggle this boolean to switch between mock and real Supabase
const USE_MOCK = false;

function getClient() {
  if (USE_MOCK) return createMockClient();
  // Dynamic import to avoid build issues when no real client
  const { createClient } = require("@/lib/supabase/client");
  return createClient();
}

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Client-side validation
    if (!email.trim()) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const client = getClient();
    const { error: authError } = await client.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // Redirect to account page on success
    window.location.href = "/account";
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <div className="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <input
            type="email"
            id="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type={showPw ? "text" : "password"}
            id="password"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-pw"
            onClick={() => setShowPw(!showPw)}
            aria-label="Toggle password visibility"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" style={{ opacity: showPw ? 0.5 : 1 }}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="form-options">
        <label>
          <input type="checkbox" defaultChecked /> Remember me
        </label>
        <a href="/forgot-password">Forgot password?</a>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px 28px", fontSize: "1rem" }} disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <div className={`form-error${error ? " visible" : ""}`}>{error}</div>
    </form>
  );
}
