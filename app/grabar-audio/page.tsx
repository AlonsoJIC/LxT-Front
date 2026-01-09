"use client"

import { AnimatedBackground } from "@/components/animated-background"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Square, Play, Pause, Trash2, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function GrabarAudioPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        if (timerRef.current) clearInterval(timerRef.current)
      }
      setIsPaused(!isPaused)
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
      setRecordingTime(0)
    }
  }

  const transcribeAudio = async () => {
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsProcessing(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Grabar <span className="text-primary">Audio</span>
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Graba directamente desde tu micrófono y obtén transcripciones en tiempo real
            </p>
          </div>

          <Card className="p-8 mb-8 animate-fade-in-up">
            <div className="flex flex-col items-center">
              <div
                className={`relative w-48 h-48 mb-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording ? "bg-destructive/20 animate-pulse" : audioUrl ? "bg-accent/20" : "bg-primary/10"
                }`}
              >
                <div
                  className={`absolute inset-0 rounded-full ${isRecording ? "animate-ping bg-destructive/20" : ""}`}
                />
                <Mic
                  className={`relative z-10 transition-all duration-300 ${
                    isRecording ? "w-24 h-24 text-destructive" : "w-20 h-20 text-primary"
                  }`}
                />
              </div>

              <div className="text-center mb-6">
                <div className="text-5xl font-bold font-mono mb-2">{formatTime(recordingTime)}</div>
                {isRecording && (
                  <p className="text-sm text-muted-foreground">{isPaused ? "Grabación pausada" : "Grabando..."}</p>
                )}
              </div>

              {!audioUrl ? (
                <div className="flex gap-4">
                  {!isRecording ? (
                    <Button onClick={startRecording} size="lg" className="gap-2">
                      <Mic className="w-5 h-5" />
                      Comenzar a grabar
                    </Button>
                  ) : (
                    <>
                      <Button onClick={pauseRecording} variant="secondary" size="lg" className="gap-2">
                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        {isPaused ? "Reanudar" : "Pausar"}
                      </Button>
                      <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
                        <Square className="w-5 h-5" />
                        Detener
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <audio src={audioUrl} controls className="w-full" />
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={deleteRecording} variant="outline" className="gap-2 bg-transparent">
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </Button>
                    <Button onClick={transcribeAudio} disabled={isProcessing} className="gap-2">
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        "Transcribir audio"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
            <Card className="p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎙️</span>
              </div>
              <h3 className="font-semibold mb-2">Alta calidad</h3>
              <p className="text-sm text-muted-foreground">Grabación en formato profesional</p>
            </Card>
            <Card className="p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="font-semibold mb-2">Sin límites</h3>
              <p className="text-sm text-muted-foreground">Graba todo el tiempo que necesites</p>
            </Card>
            <Card className="p-6 text-center hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💾</span>
              </div>
              <h3 className="font-semibold mb-2">Guardar</h3>
              <p className="text-sm text-muted-foreground">Descarga tus grabaciones</p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
