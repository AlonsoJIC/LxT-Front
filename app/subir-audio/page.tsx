"use client"

import type React from "react"

import { AnimatedBackground } from "@/components/animated-background"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileAudio, CheckCircle, Loader2 } from "lucide-react"
import { useState, useCallback } from "react"

export default function SubirAudioPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("audio/")) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsUploading(false)
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Subir <span className="text-primary">Audio</span>
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Sube tus archivos de audio para transcribirlos automáticamente con IA de última generación
            </p>
          </div>

          <Card
            className={`p-8 mb-8 border-2 transition-all duration-300 animate-fade-in-up ${
              isDragging ? "border-primary bg-primary/5" : "border-dashed"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!file ? (
              <div className="text-center py-12">
                <div className="mb-6 flex justify-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Upload className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Arrastra tu archivo aquí</h3>
                <p className="text-muted-foreground mb-6">O haz clic para seleccionar un archivo</p>
                <input type="file" accept="audio/*" onChange={handleFileInput} className="hidden" id="file-input" />
                <label htmlFor="file-input">
                  <Button asChild className="cursor-pointer">
                    <span>Seleccionar archivo</span>
                  </Button>
                </label>
                <p className="text-sm text-muted-foreground mt-4">
                  Formatos soportados: MP3, WAV, M4A, OGG (máx. 500MB)
                </p>
              </div>
            ) : (
              <div className="py-8">
                <div className="flex items-center gap-4 mb-6 p-4 bg-muted rounded-lg">
                  <FileAudio className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{file.name}</h4>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {!isUploading && (
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                      Eliminar
                    </Button>
                  )}
                </div>
                <Button onClick={handleUpload} disabled={isUploading} className="w-full" size="lg">
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Iniciar transcripción
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>

          <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
            <Card className="p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Rápido</h3>
              <p className="text-sm text-muted-foreground">Transcripción en minutos</p>
            </Card>
            <Card className="p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Preciso</h3>
              <p className="text-sm text-muted-foreground">99% de precisión con IA</p>
            </Card>
            <Card className="p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold mb-2">Seguro</h3>
              <p className="text-sm text-muted-foreground">Cifrado de extremo a extremo</p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
