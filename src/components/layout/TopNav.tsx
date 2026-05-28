"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { LogoMark } from "./LogoMark";

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
  disabled?: boolean;
}

interface TopNavProps {
  links?: NavLink[];
  cta?: React.ReactNode;
}

export function TopNav({ links, cta }: TopNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="topnav">
      <Container className="topnav-inner">
        <LogoMark href="/" />
        {links && links.length > 0 && (
          <>
            <nav className={menuOpen ? "open" : ""}>
              {links.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className={link.active ? "active" : ""}
                  style={
                    link.disabled
                      ? { opacity: 0.5, pointerEvents: "none" }
                      : undefined
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <button
              className={`hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              <span />
              <span />
              <span />
            </button>
          </>
        )}
        {cta}
      </Container>
    </header>
  );
}
