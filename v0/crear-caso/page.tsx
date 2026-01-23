"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FolderPlus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CrearCasoPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return

    setIsLoading(true)
    
    // Simular creación del caso
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    // En una app real, aquí guardarías el caso en la base de datos
    // y obtendrías el ID del nuevo caso
    const nuevoId = Date.now().toString()
    
    router.push(`/casos/${nuevoId}`)
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Botón volver */}
        <Link
          href="/casos"
          className="mb-8 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a casos
        </Link>

        {/* Card principal */}
        <div className="rounded-2xl border border-border bg-card p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <FolderPlus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Crear nuevo <span className="text-primary">caso</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Organiza tus transcripciones en un nuevo caso
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-foreground">
                Nombre del caso
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Ej: Audiencia 2024-001"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="bg-input border-border focus:border-primary focus:ring-primary"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Usa un nombre descriptivo para identificar fácilmente este caso
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!nombre.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Crear caso
                </>
              )}
            </Button>
          </form>

          {/* Tip */}
          <div className="mt-6 rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> Una vez creado el caso, 
              podrás subir audios, grabar directamente y gestionar todas tus transcripciones.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
