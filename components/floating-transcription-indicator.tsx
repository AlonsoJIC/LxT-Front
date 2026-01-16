"use client"

import { useTranscription } from "@/contexts/TranscriptionContext"
import { CheckCircle2, FileAudio, Loader2, XCircle } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export function FloatingTranscriptionIndicator() {
  const { activeTasks, hasActiveTasks } = useTranscription()
  const router = useRouter()
  const pathname = usePathname()

  // No mostrar en /subir-audio ni en /archivos
  if (pathname === "/subir-audio" || pathname === "/archivos") return null
  
  if (!hasActiveTasks) return null

  const tasksArray = Array.from(activeTasks.values())
  const activeCount = tasksArray.filter(t => t.status === "pendiente" || t.status === "procesando").length
  const completedCount = tasksArray.filter(t => t.status === "completada").length
  const errorCount = tasksArray.filter(t => t.status === "error").length

  // Calcular progreso promedio
  const avgProgress = tasksArray.length > 0
    ? tasksArray.reduce((sum, task) => sum + (task.progress || 0), 0) / tasksArray.length
    : 0

  return (
    <Card 
      className="fixed bottom-4 right-4 z-50 w-64 p-3 shadow-lg cursor-pointer hover:shadow-xl transition-shadow bg-background/95 backdrop-blur border-2"
      onClick={() => router.push("/subir-audio")}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <FileAudio className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Transcripciones</span>
            <span className="text-xs text-muted-foreground">{tasksArray.length}</span>
          </div>

          <div className="space-y-1">
            {activeCount > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                <span className="text-muted-foreground">{activeCount} en proceso</span>
              </div>
            )}
            {completedCount > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-muted-foreground">{completedCount} completadas</span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <XCircle className="h-3 w-3 text-red-500" />
                <span className="text-muted-foreground">{errorCount} con error</span>
              </div>
            )}
          </div>

          {activeCount > 0 && (
            <div className="space-y-1">
              <Progress value={avgProgress} className="h-1.5" />
              <div className="text-xs text-right text-muted-foreground">
                {Math.round(avgProgress)}%
              </div>
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground pt-1 border-t">
            Click para ver detalles
          </div>
        </div>
      </div>
    </Card>
  )
}
