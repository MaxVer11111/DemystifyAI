"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/forgot-password");
      } else {
        setReady(true);
      }
    });
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => {
      router.push("/signin");
    }, 2000);
  }

  if (!ready && !done) {
    return (
      <>
        <nav className="mini-nav">
          <div className="nav-logo"><mark>DA</mark> DemystifyAI</div>
        </nav>
        <section className="auth-section">
          <div className="auth-card" style={{ textAlign: "center" }}>
            <p>Checking reset link…</p>
          </div>
        </section>
      </>
    );
  }

  if (done) {
    return (
      <>
        <nav className="mini-nav">
          <div className="nav-logo"><mark>DA</mark> DemystifyAI</div>
        </nav>
        <section className="auth-section">
          <div className="auth-card">
            <div className="form-success">
              <h2>Password updated!</h2>
              <p>Redirecting you to sign in…</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <nav className="mini-nav">
        <div className="nav-logo"><mark>DA</mark> DemystifyAI</div>
      </nav>

      <section className="auth-section">
        <div className="auth-card">
          <p className="eyebrow">New password</p>
          <h1>Reset your password</h1>
          <p className="subtitle">Choose a new password for your account.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="new-password">New password</label>
              <div className="input-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPw ? "text" : "password"}
                  id="new-password"
                  placeholder="At least 6 characters"
                  required
                  autoComplete="new-password"
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

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px 28px", fontSize: "1rem" }} disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </button>

            <div className={`form-error${error ? " visible" : ""}`}>{error}</div>
          </form>
        </div>
      </section>
    </>
  );
}
