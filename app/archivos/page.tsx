"use client"

import { AnimatedBackground } from "@/components/animated-background"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileAudio, Download, Trash2, Search, Clock, FileText } from "lucide-react"
import { useState, useEffect } from "react"

const mockFiles = [
  {
    id: 1,
    name: "Reunión de equipo - 15 Enero",
    date: "2024-01-15",
    duration: "45:23",
    size: "32.5 MB",
    status: "completed",
  },
  {
    id: 2,
    name: "Entrevista cliente - Proyecto Alpha",
    date: "2024-01-14",
    duration: "1:12:45",
    size: "68.2 MB",
    status: "completed",
  },
  {
    id: 3,
    name: "Conferencia Marketing Digital",
    date: "2024-01-12",
    duration: "2:34:12",
    size: "145.8 MB",
    status: "completed",
  },
  {
    id: 4,
    name: "Podcast episodio 47",
    date: "2024-01-10",
    duration: "58:30",
    size: "42.1 MB",
    status: "completed",
  },
  {
    id: 5,
    name: "Webinar análisis de datos",
    date: "2024-01-08",
    duration: "1:45:20",
    size: "98.5 MB",
    status: "processing",
  },
]

export default function ArchivosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [files] = useState(mockFiles)
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setIsVisible(true); }, []);

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="relative min-h-screen animate-fade-in">
      <AnimatedBackground />
      <main className="relative z-10 container mx-auto px-4 py-16 animate-fade-in-up">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h1
                className={`text-4xl md:text-5xl font-bold mb-2 text-balance transition-all duration-700 delay-100 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                }`}
              >
                Mis <span className="text-primary">Archivos</span>
              </h1>
              <p
                className={`text-muted-foreground transition-all duration-700 delay-200 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                }`}
              >
                Gestiona todas tus transcripciones en un solo lugar
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <a href="/subir-audio">Subir audio</a>
              </Button>
              <Button asChild>
                <a href="/grabar-audio">Grabar nuevo</a>
              </Button>
            </div>
          </div>

          <div className="mb-8 animate-fade-in-up">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar archivos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className={`grid gap-4 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}> 
            {filteredFiles.map((file) => (
              <Card key={file.id} className="p-6 hover:border-primary/50 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FileAudio className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 truncate">{file.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {file.duration}
                      </span>
                      <span>{file.size}</span>
                      <span>{new Date(file.date).toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === "completed" ? (
                      <>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <FileText className="w-4 h-4" />
                          Ver transcripción
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Procesando...
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredFiles.length === 0 && (
            <Card className="p-12 text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileAudio className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No se encontraron archivos</h3>
              <p className="text-muted-foreground mb-6">Intenta con otro término de búsqueda</p>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
