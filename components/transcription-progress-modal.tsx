"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { TranscriptionTask, WhisperModel } from "@/lib/apiService"

interface TranscriptionProgressModalProps {
  open: boolean
  task: TranscriptionTask | null
  onClose?: () => void
}

const MODEL_INFO: Record<WhisperModel, { label: string; description: string }> = {
  tiny: { label: "Tiny (39M)", description: "Muy rápido, baja calidad" },
  base: { label: "Base (140M)", description: "Balance rápido/calidad" },
  small: { label: "Small (77M)", description: "Recomendado - Balance óptimo" },
  medium: { label: "Medium (769M)", description: "Buena calidad" },
  large: { label: "Large (1.5GB)", description: "Máxima calidad, más lento" },
}

export function TranscriptionProgressModal({
  open,
  task,
  onClose,
}: TranscriptionProgressModalProps) {
  if (!task) return null

  const modelInfo = MODEL_INFO[task.model] || { label: task.model, description: "" }
  const isProcessing = task.status === "procesando"
  const isCompleted = task.status === "completada"
  const isError = task.status === "error"
  const isPending = task.status === "pendiente"

  const getStatusLabel = () => {
    if (isPending) return "⏳ En cola - esperando procesamiento"
    if (isProcessing) return "🔄 Procesando..."
    if (isCompleted) return "✓ Transcripción completada"
    if (isError) return "✗ Error en la transcripción"
    return task.status
  }

  const getStatusColor = () => {
    if (isCompleted) return "text-green-600"
    if (isError) return "text-red-600"
    if (isPending) return "text-yellow-600"
    return "text-blue-600"
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && onClose) onClose()
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Transcribiendo</DialogTitle>
          <DialogDescription>
            {task.filename}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del modelo */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-sm font-medium">{modelInfo.label}</p>
            <p className="text-xs text-muted-foreground">{modelInfo.description}</p>
          </div>

          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progreso</span>
              <span className="text-sm font-bold">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>

          {/* Estado */}
          <div className={`flex items-center gap-2 rounded-lg p-3 ${
            isCompleted ? "bg-green-50 dark:bg-green-950" :
            isError ? "bg-red-50 dark:bg-red-950" :
            isPending ? "bg-yellow-50 dark:bg-yellow-950" :
            "bg-blue-50 dark:bg-blue-950"
          }`}>
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
            {isError && <AlertCircle className="h-4 w-4 text-red-600" />}
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />}
            <div className="flex-1">
              <p className={`text-sm font-medium ${getStatusColor()}`}>
                {getStatusLabel()}
              </p>
              {isError && task.error && (
                <p className="text-xs text-red-600 mt-1">{task.error}</p>
              )}
            </div>
          </div>

          {/* Información de tiempos (si está disponible) */}
          {task.started_at && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Iniciado: {new Date(task.started_at).toLocaleTimeString()}</p>
              {task.completed_at && (
                <p>Completado: {new Date(task.completed_at).toLocaleTimeString()}</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
