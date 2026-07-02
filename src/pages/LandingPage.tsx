import { useScrollReveal } from "../lib/useScrollReveal";
import { NavHeader } from "../components/NavHeader";
import { Hero } from "../components/Hero";
import { ExperienceJourney } from "../components/ExperienceJourney";
import { CulinaryHighlights } from "../components/CulinaryHighlights";
import { CulturalExchange } from "../components/CulturalExchange";
import { Stewardship } from "../components/Stewardship";
import { CampMap } from "../components/CampMap";
import { Memories } from "../components/Memories";
import { JoinTheTable } from "../components/JoinTheTable";
import { Partners } from "../components/Partners";
import { Footer } from "../components/Footer";

export function LandingPage() {
  useScrollReveal();
  return (
    <>
      <NavHeader />
      <main>
        <Hero />
        <ExperienceJourney />
        <CulinaryHighlights />
        <CulturalExchange />
        <Stewardship />
        <CampMap />
        <Memories />
        <JoinTheTable />
        <Partners />
      </main>
      <Footer />
    </>
  );
}
