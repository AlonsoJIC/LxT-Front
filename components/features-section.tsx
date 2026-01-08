"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Languages, Users, Zap, FileText, Shield, Cloud } from "lucide-react"
import { useEffect, useState, useRef } from "react"

const features = [
  {
    icon: Zap,
    title: "Velocidad excepcional",
    description: "Transcribe horas de audio en algunos minutos con nuestra tecnología de IA optimizada.",
  },
  {
    icon: FileText,
    title: "Formatos flexibles",
    description: "Exporta en SRT, VTT, TXT y más formatos profesionales.",
  },
  {
    icon: Shield,
    title: "Seguridad",
    description: "Cifrado de extremo a extremo, y en version escritorio los audios solo estaran en tu computadora, cumplimiento con GDPR y SOC 2.",
  },
]

export function FeaturesSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = Array.from({ length: features.length }, (_, i) => i)
            cards.forEach((index) => {
              setTimeout(() => {
                setVisibleCards((prev) => [...prev, index])
              }, index * 100)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="border-b border-border/40 py-24" ref={sectionRef}>
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold sm:text-4xl">Características profesionales</h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Todo lo que necesitas para transcribir, editar y compartir contenido de audio
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`border-border/50 transition-all duration-500 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 ${
                visibleCards.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary transition-transform hover:scale-110" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
