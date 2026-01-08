import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { TranscriptionDemo } from "@/components/transcription-demo"
import { Footer } from "@/components/footer"
import { AnimatedBackground } from "@/components/animated-background"

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <HeroSection />
        <TranscriptionDemo />
        <FeaturesSection />
        <Footer />
      </div>
    </main>
  )
}
