import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, MessageCircle, Video, FileQuestion, Search, HelpCircle } from "lucide-react"

export default function SoportePage() {
  const faqs = [
    {
      question: "¿Qué formatos de audio soporta LxT?",
      answer:
        "LxT soporta todos los formatos de audio más comunes incluyendo MP3, WAV, M4A, FLAC, OGG, y AAC. También puedes subir videos en MP4, MOV, AVI y extraeremos el audio automáticamente.",
    },
    {
      question: "¿Cuánto tiempo tarda una transcripción?",
      answer:
        "El tiempo de transcripción depende de la duración del audio. Generalmente, procesamos el audio más rápido que su duración real. Un archivo de 30 minutos usualmente toma 5-10 minutos en procesarse.",
    },
    {
      question: "¿Puedo editar las transcripciones?",
      answer:
        "Sí, todas las transcripciones son completamente editables. Puedes hacer correcciones directamente en el editor, cambiar timestamps, y exportar en múltiples formatos como TXT, SRT, VTT, y DOCX.",
    },
    {
      question: "¿Qué idiomas están disponibles?",
      answer:
        "LxT soporta más de 50 idiomas incluyendo español, inglés, francés, alemán, italiano, portugués, chino, japonés, coreano, y muchos más. La detección de idioma es automática.",
    },
    {
      question: "¿Hay límite de duración por archivo?",
      answer:
        "En el plan gratuito puedes subir archivos de hasta 30 minutos. Los planes de pago permiten archivos de hasta 5 horas. Para archivos más largos, contáctanos para soluciones empresariales.",
    },
    {
      question: "¿Cómo funciona la facturación?",
      answer:
        "Los planes se facturan mensualmente o anualmente. Puedes cancelar en cualquier momento. Ofrecemos una garantía de devolución de 30 días si no estás satisfecho con el servicio.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">Centro de Soporte</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Encuentra respuestas rápidas a tus preguntas o contacta con nuestro equipo de soporte
            </p>
          </div>

          <div className="mb-12 grid gap-6 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
            <Card className="group border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg text-center">
              <MessageCircle className="mb-4 h-10 w-10 text-primary transition-transform group-hover:scale-110" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">Centro de contacto</h3>
              <p className="mb-4 text-sm text-muted-foreground">Habla con nuestro equipo de soporte para lo que necesites!</p>
              
              <Button asChild variant="outline" size="sm">
                <Link href="/contacto">Ver maneras de contactarnos</Link>
              </Button>
            </Card>
          </div>

          <div className="mb-12">
            <h2 className="mb-6 text-3xl font-bold text-foreground">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                  <div className="flex gap-4">
                    <HelpCircle className="h-6 w-6 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <h3 className="mb-2 font-semibold text-foreground">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
