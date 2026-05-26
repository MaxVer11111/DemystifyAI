"use client";

import { useEffect, useRef } from "react";

interface StaggerTextProps {
  children: string;
  as?: "h1" | "h2" | "h3" | "span";
  className?: string;
}

export function StaggerText({ children, as: Tag = "h1", className }: StaggerTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const text = el.textContent?.trim() || "";
    el.textContent = "";

    const chars: HTMLSpanElement[] = [];
    const words = text.split(" ");

    words.forEach((word, wi) => {
      const wordSpan = document.createElement("span");
      wordSpan.style.display = "inline-block";
      wordSpan.style.whiteSpace = "nowrap";

      for (let j = 0; j < word.length; j++) {
        const span = document.createElement("span");
        span.className = "stagger-char";
        span.textContent = word[j];
        span.style.opacity = "0";
        span.style.transform = "translateY(24px) rotateX(-24deg)";
        wordSpan.appendChild(span);
        chars.push(span);
      }
      el.appendChild(wordSpan);
      if (wi < words.length - 1) {
        el.appendChild(document.createTextNode(" "));
      }
    });

    chars.forEach((c, i) => {
      setTimeout(() => {
        c.style.transition =
          "opacity 0.5s cubic-bezier(0.14, 0.62, 0.34, 0.99), transform 0.6s cubic-bezier(0.14, 0.62, 0.34, 0.99)";
        c.style.opacity = "1";
        c.style.transform = "translateY(0px) rotateX(0deg)";
      }, i * 35);
    });
  }, [children]);

  return (
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}
