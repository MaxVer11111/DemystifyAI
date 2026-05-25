interface HeroSectionProps {
  eyebrow: string;
  title: string;
  lead: string;
  children?: React.ReactNode;
}

export function HeroSection({ eyebrow, title, lead, children }: HeroSectionProps) {
  return (
    <section className="section hero">
      <div className="container hero-center">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
        {children && <div className="hero-cta">{children}</div>}
      </div>
    </section>
  );
}
