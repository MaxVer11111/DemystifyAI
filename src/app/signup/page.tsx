import Link from "next/link";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <>
      <nav className="mini-nav">
        <Link href="/" className="nav-logo">
          <mark>DA</mark>
          DemystifyAI
        </Link>
        <div className="nav-links">
          <Link href="/" className="btn-outline">Home</Link>
        </div>
      </nav>

      <section className="auth-section">
        <div className="auth-card">
          <p className="eyebrow">Get started</p>
          <h1>Create your account</h1>
          <p className="subtitle">
            Already have one? <a href="/signin">Sign in</a>
          </p>

          <SignUpForm />
        </div>
      </section>

      <footer className="pagefoot" style={{ marginTop: "auto" }}>
        <div className="container row-between">
          <span className="footer-meta" style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
            &copy; 2026 DemystifyAI
          </span>
          <div className="footer-social" style={{ display: "flex", gap: 16 }}>
            <a href="#" aria-label="YouTube" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", color: "var(--muted)" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", color: "var(--muted)" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="#" aria-label="X / Twitter" style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", color: "var(--muted)" }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
