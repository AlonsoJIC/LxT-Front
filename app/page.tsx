import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <Footer />
      </div>
    </main>
  )
}
