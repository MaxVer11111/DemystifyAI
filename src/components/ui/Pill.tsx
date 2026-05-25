interface PillProps {
  children: React.ReactNode;
  className?: string;
}

export function Pill({ children, className = "" }: PillProps) {
  return <span className={`pill${className ? ` ${className}` : ""}`}>{children}</span>;
}
