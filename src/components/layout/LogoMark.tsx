import Link from "next/link";

interface LogoMarkProps {
  href?: string;
  size?: "sm" | "lg";
  showText?: boolean;
}

export function LogoMark({ href = "/", size = "sm", showText = true }: LogoMarkProps) {
  const inner = (
    <span className="logo-mark">
      <span className={size === "lg" ? "cg-monogram-lg" : "cg-monogram"}>DA</span>
      {showText && <span className="logo">DemystifyAI</span>}
    </span>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
