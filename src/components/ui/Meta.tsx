interface MetaProps {
  children: React.ReactNode;
  className?: string;
}

export function Meta({ children, className = "" }: MetaProps) {
  return <span className={`meta${className ? ` ${className}` : ""}`}>{children}</span>;
}
