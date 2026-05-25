import type { CSSProperties } from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Section({ children, className, style }: SectionProps) {
  return (
    <section className={`section${className ? ` ${className}` : ""}`} style={style}>
      {children}
    </section>
  );
}
