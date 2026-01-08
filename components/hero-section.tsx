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
      <div className="container mx-auto sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className={` inline-flex items-center gap-2 rounded-full border border-border bg-muted text-sm transition-all duration-700 ${
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
            className={`text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Transcripción profesional{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-in">
              impulsada por IA
            </span>
          </h1>
        </div>
      </div>
    </section>
  )
}
