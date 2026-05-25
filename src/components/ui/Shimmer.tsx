interface ShimmerProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Shimmer({ width, height, className = "" }: ShimmerProps) {
  return (
    <div
      className={`shimmer${className ? ` ${className}` : ""}`}
      style={{ width: width || "100%", height: height || "20px" }}
    />
  );
}
