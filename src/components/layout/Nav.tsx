"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "./TopNav";

const NAV_LINKS = [
  { label: "Discovery", href: "/discovery" },
  { label: "Courses", href: "/courses" },
  { label: "Account", href: "/account" },
];

export function Nav() {
  const pathname = usePathname();
  const links = NAV_LINKS.map((link) => ({
    ...link,
    active: pathname.startsWith(link.href),
  }));
  return <TopNav links={links} />;
}
