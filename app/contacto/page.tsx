"use client"

import type React from "react"

import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react"
import { useState } from "react"

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Formulario enviado:", formData)
  }

  return (
    
    <div className="min-h-screen bg-background">
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">Contacta con nosotros</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              ¿Tienes alguna pregunta sobre LxT? Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo
              antes posible.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <Card className="border-border/50 bg-card/50 p-6 backdrop-blur-sm flex flex-col items-center text-center transition-all hover:border-primary/60 hover:shadow-lg hover:bg-card/80">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-bold text-primary text-lg md:text-xl lg:text-2xl">Email</h3>
              <p className="text-base text-foreground font-medium">soporte@lxt.app</p>
              <p className="text-base text-foreground font-medium">ventas@lxt.app</p>
            </Card>
            <Card className="border-border/50 bg-card/50 p-6 backdrop-blur-sm flex flex-col items-center text-center transition-all hover:border-primary/60 hover:shadow-lg hover:bg-card/80">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-bold text-primary text-lg md:text-xl lg:text-2xl">Whatsapp</h3>
              <p className="mb-3 text-base text-foreground font-medium">Disponible 24/7</p>
              <Button asChild variant="outline" size="sm">
                <a href="https://wa.link/cdyele" target="_blank" rel="noopener noreferrer">Iniciar chat</a>
              </Button>
            </Card>
            <Card className="border-border/50 bg-card/50 p-6 backdrop-blur-sm flex flex-col items-center text-center transition-all hover:border-primary/60 hover:shadow-lg hover:bg-card/80">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-bold text-primary text-lg md:text-xl lg:text-2xl">Teléfono</h3>
              <p className="mb-3 text-base text-foreground font-medium">Disponible de lunes a sábado de 9:00 a 18:00</p>
              <p className="text-base text-foreground font-medium">6395-7916</p>
            </Card>
            <Card className="border-border/50 bg-card/50 p-6 backdrop-blur-sm flex flex-col items-center text-center transition-all hover:border-primary/60 hover:shadow-lg hover:bg-card/80">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-bold text-primary text-lg md:text-xl lg:text-2xl">Oficina</h3>
              <p className="text-base text-foreground font-medium">
                LxT no cuenta con una oficina física. Operamos de manera remota, lo que nos permite ofrecer un mejor servicio a
                nuestros clientes de manera rápida, eficiente, segura y 24/7. 
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
