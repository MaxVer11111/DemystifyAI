interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "flat";
  hover?: boolean;
  className?: string;
}

export function Card({ children, variant = "default", hover = true, className = "" }: CardProps) {
  const classes = [
    variant === "flat" ? "card-flat" : "card",
    !hover ? "card-no-hover" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!hover) {
    return (
      <div className={classes} style={variant !== "flat" ? { borderColor: "var(--border)" } : undefined}>
        {children}
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
}
