import { TopNav, Footer, Container, Section } from "@/components/layout";
import { Button } from "@/components/ui";
import { Feature } from "@/components/landing";
import {
  AnimatedInView,
  ScrollProgressBar,
  StaggerText,
  TiltCard,
  MagneticLink,
} from "@/components/animations";

export default function LandingPage() {
  return (
    <>
      <ScrollProgressBar />
      <TopNav
        links={[
          { label: "Discovery", href: "/discovery" },
          { label: "Courses", href: "#", disabled: true },
          { label: "Account", href: "#", disabled: true },
        ]}
        cta={
          <MagneticLink>
            <Button variant="primary" href="/discovery">
              Start exploring
            </Button>
          </MagneticLink>
        }
      />

      <main>
        <section className="section hero">
          <div className="container hero-center">
            <AnimatedInView>
              <p className="eyebrow">AI literacy &middot; for everyone</p>
            </AnimatedInView>
            <StaggerText as="h1">
              The fastest, clearest way for non-technical people to stay current on AI.
            </StaggerText>
            <AnimatedInView delay={0.3}>
              <p className="lead">
                Curated signal from the people building AI — filtered, summarized, and explained
                in plain language. No jargon, no hype, no scrolling through noise.
              </p>
            </AnimatedInView>
            <AnimatedInView delay={0.45}>
              <div className="hero-cta">
                <MagneticLink>
                  <Button variant="primary" href="/discovery">
                    Explore the feed
                  </Button>
                </MagneticLink>
                <MagneticLink>
                  <Button variant="secondary" href="#why-demystifyai">
                    How it works
                  </Button>
                </MagneticLink>
              </div>
            </AnimatedInView>
          </div>
          <div className="hero-scroll">
            <span>Scroll</span>
            <div className="line" style={{ animation: "pulse-line 2.2s ease-in-out infinite" }} />
          </div>
        </section>

        <Section>
          <Container>
            <div className="stack" style={{ gap: 56 }}>
              <AnimatedInView>
                <div style={{ maxWidth: "36ch", scrollMarginTop: 80 }} id="why-demystifyai">
                  <p className="eyebrow">Why DemystifyAI</p>
                  <h2>AI news that actually makes sense.</h2>
                </div>
              </AnimatedInView>
              <div className="grid-3">
                <AnimatedInView delay={0}>
                  <TiltCard scale={1} className="feature-tilt">
                    <Feature
                      title="Curated live feed"
                      description="Posts from the top AI minds — filtered for relevance, scored, and summarized. You see what matters, not the noise."
                      icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                        </svg>
                      }
                    />
                  </TiltCard>
                </AnimatedInView>
                <AnimatedInView delay={0.1}>
                  <TiltCard scale={1} className="feature-tilt">
                    <Feature
                      title="Hand-picked people to follow"
                      description="A starter pack of the voices worth hearing — educators, researchers, product leaders, and builders."
                      icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      }
                    />
                  </TiltCard>
                </AnimatedInView>
                <AnimatedInView delay={0.2}>
                  <TiltCard scale={1} className="feature-tilt">
                    <Feature
                      title="Curated skills &amp; library"
                      description="The best open-source tools, learning repos, podcasts, and videos — vetted and explained so you know where to start."
                      icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                      }
                    />
                  </TiltCard>
                </AnimatedInView>
              </div>
            </div>
          </Container>
        </Section>

        <Section>
          <Container>
            <AnimatedInView>
              <div style={{ maxWidth: "36ch", marginBottom: 56 }}>
                <p className="eyebrow">How it works</p>
                <h2>Three steps to AI clarity</h2>
              </div>
            </AnimatedInView>
            <div className="props-list">
              <div className="prop-row" data-reveal>
                <div className="prop-num">01</div>
                <div>
                  <h3>Discover</h3>
                  <p>
                    Browse a live feed of the most important AI developments, curated daily by
                    humans who care about clarity.
                  </p>
                </div>
              </div>
              <div className="prop-row" data-reveal>
                <div className="prop-num">02</div>
                <div>
                  <h3>Understand</h3>
                  <p>
                    Every post includes context and plain-language explanations. No prior knowledge
                    assumed — we meet you where you are.
                  </p>
                </div>
              </div>
              <div className="prop-row" data-reveal>
                <div className="prop-num">03</div>
                <div>
                  <h3>Apply</h3>
                  <p>
                    Find tools, skills, and resources you can actually use, with honest
                    beginner-friendly ratings and real recommendations.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section>
          <div className="cta-banner-wrapper">
            <AnimatedInView>
              <div className="cta-banner">
                <h2>Stop scrolling. Start understanding.</h2>
                <p>
                  AI doesn&apos;t have to feel overwhelming. DemystifyAI gives you the signal —
                  clear, curated, and jargon-free.
                </p>
                <MagneticLink>
                  <Button variant="primary" href="/discovery">
                    Open the discovery page
                  </Button>
                </MagneticLink>
              </div>
            </AnimatedInView>
          </div>
        </Section>
      </main>

      <Footer />
    </>
  );
}
