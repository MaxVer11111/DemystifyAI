interface LeadProps {
  children: React.ReactNode;
  className?: string;
}

export function Lead({ children, className = "" }: LeadProps) {
  return <p className={`lead${className ? ` ${className}` : ""}`}>{children}</p>;
}
