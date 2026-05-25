interface AvatarProps {
  initials: string;
  background?: string;
  color?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function Avatar({
  initials,
  background,
  color,
  size = "default",
  className = "",
}: AvatarProps) {
  const sizeClass = size === "sm" ? "avatar-sm" : size === "lg" ? "avatar-lg" : "";

  return (
    <div
      className={`avatar${sizeClass ? ` ${sizeClass}` : ""}${className ? ` ${className}` : ""}`}
      style={
        background || color
          ? { background: background || undefined, color: color || undefined }
          : undefined
      }
    >
      {initials}
    </div>
  );
}
