"use client"

import { useTranscription } from "@/contexts/TranscriptionContext"
import { CheckCircle2, FileAudio, Loader2, XCircle } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Definir los pasos del proceso de transcripción
const TRANSCRIPTION_STEPS = [
  { id: 'queued', label: 'En cola' },
  { id: 'uploading', label: 'Subiendo' },
  { id: 'transcribing', label: 'Transcribiendo' },
  { id: 'diarizing', label: 'Diarizando' },
  { id: 'assigning', label: 'Asignando hablantes' },
  { id: 'finalizing', label: 'Finalizando' },
]

function getStepIndex(task: any): number {
  if (task.status === 'completada') return TRANSCRIPTION_STEPS.length
  if (task.status === 'error') return -1
  if (task.status === 'pendiente') return 0
  
  // Mapear current_step del backend a nuestros steps
  const stepMap: Record<string, number> = {
    'queued': 0,
    'uploading': 1,
    'loading_model': 1,
    'transcribing': 2,
    'diarizing': 3,
    'assigning_speakers': 4,
    'finalizing': 5,
  }
  
  const step = task.current_step?.toLowerCase() || ''
  return stepMap[step] ?? 2 // Default a transcribiendo
}

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

  // Obtener la primera tarea activa para mostrar su progreso
  const activeTask = tasksArray.find(t => t.status === "procesando") || tasksArray.find(t => t.status === "pendiente")

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

          {activeTask && (
            <div className="space-y-2">
              {/* Contenedor de pasos con círculos y líneas */}
              <div className="relative flex items-center justify-between px-1">
                {TRANSCRIPTION_STEPS.map((step, index) => {
                  const currentStepIndex = getStepIndex(activeTask)
                  const isCompleted = index < currentStepIndex
                  const isCurrent = index === currentStepIndex
                  const isPending = index > currentStepIndex
                  const isLast = index === TRANSCRIPTION_STEPS.length - 1
                  
                  return (
                    <div key={step.id} className="flex items-center flex-1">
                      {/* Círculo del paso */}
                      <div className="relative z-10 flex items-center justify-center">
                        <div
                          className="rounded-full transition-all duration-500 flex items-center justify-center"
                          style={{
                            width: isCurrent ? '14px' : '10px',
                            height: isCurrent ? '14px' : '10px',
                            backgroundColor: isCompleted 
                              ? 'hsl(var(--primary))' 
                              : isCurrent 
                                ? 'hsl(var(--primary))' 
                                : 'transparent',
                            border: isPending 
                              ? '2px solid hsl(var(--muted))' 
                              : isCurrent 
                                ? '3px solid hsl(var(--primary))' 
                                : 'none',
                            animation: isCurrent ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                            boxShadow: isCurrent ? '0 0 8px hsl(var(--primary))' : 'none'
                          }}
                        />
                      </div>
                      
                      {/* Línea conectora (excepto en el último paso) */}
                      {!isLast && (
                        <div
                          className="h-0.5 flex-1 transition-all duration-500"
                          style={{
                            backgroundColor: index < currentStepIndex 
                              ? 'hsl(var(--primary))' 
                              : 'hsl(var(--muted))',
                            opacity: index < currentStepIndex ? 1 : 0.3
                          }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Texto del paso actual */}
              <div className="text-xs text-center text-muted-foreground font-medium">
                {activeTask.current_step ? (
                  TRANSCRIPTION_STEPS.find(s => s.id === activeTask.current_step?.toLowerCase())?.label ||
                  activeTask.current_step
                ) : (
                  activeTask.status === 'pendiente' ? 'En cola' : 'Procesando...'
                )}
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
