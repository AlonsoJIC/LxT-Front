"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Mic } from "lucide-react"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="container mx-auto px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className={`mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
            </span>
            <span className="text-muted-foreground">IA de última generación</span>
          </div>

          <h1
            className={`mb-10 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Transcripción profesional{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-in">
              impulsada por IA
            </span>
          </h1>

          <p
            className={`mb-12 text-pretty text-lg text-muted-foreground sm:text-xl transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Convierte audio a texto con precisión excepcional. Soporta múltiples idiomas, identificación de hablantes y
            edición en tiempo real.
          </p>

          <div
            className={`flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <a href="/subir-audio">
              <Button
                size="lg"
                className="gap-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20 group"
              >
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                Subir audio
              </Button>
            </a>
            <a href="/grabar-audio">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 transition-all hover:scale-105 hover:border-primary hover:text-primary bg-transparent group"
              >
                <Mic className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Grabar audio
              </Button>
            </a>
          </div>

          <div
            className={`mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent animate-pulse"></div>
              <span>98% precisión</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent animate-pulse"></div>
              <span>Grabacion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-accent animate-pulse"></div>
              <span>Seguridad de tus archivos</span>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
