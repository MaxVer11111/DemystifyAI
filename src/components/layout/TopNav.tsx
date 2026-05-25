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
  return (
    <header className="topnav">
      <Container className="topnav-inner">
        <LogoMark href="/" />
        {links && links.length > 0 && (
          <nav>
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
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        {cta && cta}
      </Container>
    </header>
  );
}
