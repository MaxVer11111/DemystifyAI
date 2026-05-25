import { TopNav, Footer, Container, Section } from "@/components/layout";
import { Button } from "@/components/ui";
import { HeroSection, Feature } from "@/components/landing";

export default function LandingPage() {
  return (
    <>
      <TopNav
        links={[
          { label: "Discovery", href: "/discovery" },
          { label: "Courses", href: "#", disabled: true },
          { label: "Account", href: "#", disabled: true },
        ]}
        cta={
          <Button variant="primary" href="/discovery">
            Start exploring
          </Button>
        }
      />

      <main>
        <HeroSection
          eyebrow="AI literacy · for everyone"
          title="The fastest, clearest way for non-technical people to stay current on AI."
          lead="Curated signal from the people building AI — filtered, summarized, and explained in plain language. No jargon, no hype, no scrolling through noise."
        >
          <Button variant="primary" href="/discovery">
            Explore the feed
          </Button>
          <Button variant="secondary" href="/discovery">
            Browse people &amp; skills
          </Button>
        </HeroSection>

        <Section>
          <Container>
            <div className="stack" style={{ gap: 56 }}>
              <div style={{ maxWidth: "36ch" }}>
                <p className="eyebrow">How it works</p>
                <h2>Three things that make staying informed actually easy.</h2>
              </div>
              <div className="grid-3">
                <Feature
                  title="Curated live feed"
                  description="Posts from the top AI minds — filtered by DeepSeek for relevance, scored, and summarized. You see what matters, not the noise."
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                    </svg>
                  }
                />
                <Feature
                  title="Hand-picked people to follow"
                  description="A starter pack of the voices worth hearing — educators, researchers, product leaders, and builders. Each with a real explanation of why they matter."
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  }
                />
                <Feature
                  title="Curated skills &amp; library"
                  description="The best open-source tools, learning repos, podcasts, and videos — vetted and explained so you know where to start, whatever your level."
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </Container>
        </Section>

        <Section style={{ textAlign: "center" }}>
          <Container>
            <div style={{ maxWidth: 600, marginInline: "auto" }}>
              <h2>Stop scrolling. Start understanding.</h2>
              <p className="lead" style={{ margin: "16px auto 32px" }}>
                AI doesn&apos;t have to feel overwhelming. DemystifyAI gives you the signal — clear,
                curated, and jargon-free.
              </p>
              <Button variant="primary" href="/discovery">
                Open the discovery page
              </Button>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
