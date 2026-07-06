import { useScrollReveal } from "../lib/useScrollReveal";
import { NavHeader } from "../components/NavHeader";
import { Hero } from "../components/Hero";
import { ExperienceJourney } from "../components/ExperienceJourney";
import { OpeningCeremony } from "../components/OpeningCeremony";
import { CulinaryHighlights } from "../components/CulinaryHighlights";
import { CulturalExchange } from "../components/CulturalExchange";
import { Stewardship } from "../components/Stewardship";
import { CampMap } from "../components/CampMap";
import { Memories } from "../components/Memories";
import { JoinTheTable } from "../components/JoinTheTable";
import { FAQ } from "../components/FAQ";
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
        <OpeningCeremony />
        <CulinaryHighlights />
        <CulturalExchange />
        <Stewardship />
        <CampMap />
        <Memories />
        <JoinTheTable />
        <FAQ />
        <Partners />
      </main>
      <Footer />
    </>
  );
}
