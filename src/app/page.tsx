import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SimulationPreview } from "@/components/landing/SimulationPreview";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="flex-1">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <SimulationPreview />
      <FAQ />
      <Footer />
    </main>
  );
}
