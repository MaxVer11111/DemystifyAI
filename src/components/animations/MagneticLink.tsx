"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";

interface MagneticLinkProps {
  children: ReactNode;
  href?: string;
  className?: string;
  strength?: number;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

export function MagneticLink({
  children,
  href,
  className,
  strength = 0.3,
  onClick,
  target,
  rel,
}: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  }

  function handleMouseLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
  }

  const commonProps = {
    ref,
    className,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    style: {
      transition: "transform 0.3s ease-out",
      display: "inline-block",
    } as React.CSSProperties,
  };

  if (href) {
    return (
      <a href={href} {...commonProps} onClick={onClick} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  return (
    <span
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: "transform 0.3s ease-out",
        display: "inline-block",
        cursor: "pointer",
      }}
    >
      {children}
    </span>
  );
}
