"use client"
import { Button } from "@/components/ui/button"
import { WhisperModel } from "@/lib/apiService"

interface ModelSelectorProps {
  value: WhisperModel
  onChange: (model: WhisperModel) => void
  disabled?: boolean
}

const MODELS: { value: WhisperModel; label: string; size: string; description: string; speed: string }[] = [
  {
    value: "tiny",
    label: "Tiny",
    size: "39M",
    description: "Muy rápido, baja calidad",
    speed: "⚡⚡⚡ Muy rápido"
  },
  {
    value: "base",
    label: "Base",
    size: "140M",
    description: "Balance rápido/calidad",
    speed: "⚡⚡ Rápido"
  },
  {
    value: "small",
    label: "Small",
    size: "77M",
    description: "RECOMENDADO - Balance óptimo",
    speed: "⚡ Balance"
  },
  {
    value: "medium",
    label: "Medium",
    size: "769M",
    description: "Buena calidad",
    speed: "🐢 Más lento"
  },
  {
    value: "large",
    label: "Large",
    size: "1.5GB",
    description: "Máxima calidad",
    speed: "🐢🐢 Muy lento"
  },
]

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold block">Selecciona modelo de transcripción</label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {MODELS.map((model) => (
          <button
            key={model.value}
            onClick={() => onChange(model.value)}
            disabled={disabled}
            className={`relative rounded-lg border-2 p-3 text-left transition-all ${
              value === model.value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 bg-muted/30"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}`}
          >
            <p className="font-semibold text-sm">{model.label}</p>
            <p className="text-xs text-muted-foreground">{model.size}</p>
            <p className="text-xs mt-1">{model.speed}</p>
            {value === model.value && (
              <div className="absolute top-2 right-2 h-3 w-3 rounded-full bg-primary"></div>
            )}
          </button>
        ))}
      </div>
      {value === "small" && (
        <p className="text-xs text-green-600 font-medium">✓ Recomendado para la mayoría de casos</p>
      )}
    </div>
  )
}
