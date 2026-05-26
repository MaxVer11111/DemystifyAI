"use client";

import Link from "next/link";
import { TiltCard } from "@/components/animations";

interface AppCardProps {
  name: string;
  domain: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export function AppCard({ name, domain, description, href, icon }: AppCardProps) {
  return (
    <TiltCard>
      <Link className="app-card" href={href} target="_blank" rel="noopener">
        <div className="app-icon">{icon}</div>
        <div className="app-name">{name}</div>
        <div className="app-domain">{domain}</div>
        <div className="app-desc">{description}</div>
      </Link>
    </TiltCard>
  );
}
