import { Container } from "./Container";

interface FooterProps {
  copyright?: string;
  tagline?: string;
}

export function Footer({
  copyright = "© DemystifyAI · 2026",
  tagline = "Breaking the AI information gap · one curated signal at a time",
}: FooterProps) {
  return (
    <footer className="pagefoot">
      <Container className="row-between">
        <span>{copyright}</span>
        <span className="meta">{tagline}</span>
      </Container>
    </footer>
  );
}
