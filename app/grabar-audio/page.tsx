"use client"

import { AnimatedBackground } from "@/components/animated-background"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, Play, Pause, Trash2, Loader2, FileText, Download, Clipboard, FilePlus2 } from "lucide-react"
import { useState, useRef, useEffect, useCallback } from "react"
import { 
  uploadAudio, 
  fetchAudios as fetchAudiosApi, 
  fetchTranscription, 
  saveTranscription, 
  deleteAudio, 
  deleteTranscription, 
  API_BASE,
  enqueueTranscription,
  downloadTranscriptionDocx,
  TranscriptionTask,
  WhisperModel
} from "@/lib/apiService"
import { useToast } from "@/components/ui/use-toast"
import { useTranscription } from "@/contexts/TranscriptionContext"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

export default function GrabarAudioPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [isVisible, setIsVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null);
  const [confirmAction, setConfirmAction] = useState<null | { type: 'save' | 'download-txt' | 'download-docx'; payload?: any }>(null);
  
  // Estados para modelo y speakers con sistema simplificado
  const [selectedModel, setSelectedModel] = useState<WhisperModel>("small");
  
  type SpeakerOption = '1' | '2' | '3-5' | '5+' | 'auto';
  const [selectedSpeakerOption, setSelectedSpeakerOption] = useState<SpeakerOption>('auto');
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  
  // Usar contexto global para transcripciones
  const { addTask, activeTasks } = useTranscription();
  const previousTasksRef = useRef<Map<string, TranscriptionTask>>(new Map());
  
  // Estados y lógica de audios subidos y transcripción
  const [audios, setAudios] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<any | null>(null);
  const [transcription, setTranscription] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  // Declarar fetchAudios ANTES de los useEffect que lo usan
  const fetchAudios = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await fetchAudiosApi();
      if (Array.isArray(data)) {
        setAudios(data);
      } else if (data && Array.isArray(data.audios)) {
        setAudios(data.audios);
      } else {
        setAudios([]);
      }
    } catch (e) {
      setAudios([]);
    } finally {
      setLoadingList(false);
    }
  }, []);
  
  useEffect(() => { setIsVisible(true); }, []);

  useEffect(() => {
    fetchAudios();
  }, [fetchAudios]);

  // Detectar cuando una tarea cambia a "completada" y refrescar la lista
  useEffect(() => {
    const previousTasks = previousTasksRef.current;
    let shouldRefresh = false;

    activeTasks.forEach((task, taskId) => {
      const previousTask = previousTasks.get(taskId);
      
      // Si la tarea pasó de otro estado a "completada", refrescar
      if (task.status === "completada" && previousTask && previousTask.status !== "completada") {
        shouldRefresh = true;
      }
    });

    // Actualizar ref con el estado actual
    previousTasksRef.current = new Map(activeTasks);

    if (shouldRefresh) {
      // Refrescar la lista después de un pequeño delay
      const timeoutId = setTimeout(() => {
        fetchAudios();
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeTasks, fetchAudios]);

  const handleDeleteAudio = async (filename: string) => {
    setConfirmDelete(filename);
  };

  const confirmDeleteAudio = async () => {
    if (!confirmDelete) return;
    try {
      await deleteAudio(confirmDelete);
      // Eliminar transcript asociado (nombre base + .txt)
      const transcriptName = confirmDelete.replace(/\.[^/.]+$/, "") + ".txt";
      try {
        await deleteTranscription(transcriptName);
      } catch (e) {
        // Si no existe el transcript, ignorar el error
        console.warn("No se pudo eliminar el transcript asociado:", transcriptName);
      }
      await fetchAudios();
      setSelectedAudio(null);
      setTranscription("");
      toast({ title: "Audio eliminado", description: "El audio y su transcripción fueron eliminados.", variant: "default" });
    } catch (e) {
      toast({ title: "Error al eliminar", description: "No se pudo eliminar el audio.", variant: "destructive" });
    }
    setConfirmDelete(null);
  };

  const fetchTranscriptionLocal = async (filename: string) => {
    try {
      const data: any = await fetchTranscription(filename);
      setTranscription(data.text || "");
      setSelectedAudio({ filename });
      setEditing(false);
      toast({ title: "Transcripción cargada", description: "La transcripción se cargó correctamente.", variant: "default" });
    } catch (e) {
      setTranscription("");
      toast({ title: "Error", description: "No se pudo cargar la transcripción.", variant: "destructive" });
    }
  };

  const handleSaveTranscription = async () => {
    if (!selectedAudio) return;
    setSaving(true);
    try {
      await saveTranscription(selectedAudio.filename, transcription);
      setEditing(false);
      toast({ title: "Guardado", description: "Los cambios se guardaron correctamente.", variant: "default" });
    } catch (e) {
      toast({ title: "Error al guardar", description: "No se pudo guardar la transcripción.", variant: "destructive" });
    }
    setSaving(false);
  };

  // Confirmed action handlers
  const handleConfirmedAction = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'save') {
      await handleSaveTranscription();
    } else if (confirmAction.type === 'download-txt') {
      if (!selectedAudio) return;
      const url = `${API_BASE}/transcript/download/${selectedAudio.filename}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedAudio.filename || "transcripcion"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: "Descarga TXT", description: "La descarga del archivo TXT ha comenzado.", variant: "default" });
    } else if (confirmAction.type === 'download-docx') {
      if (!selectedAudio) return;
      const url = `${API_BASE}/transcript/export_docx/${selectedAudio.filename}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedAudio.filename.replace(/\.[^/.]+$/, "") + ".docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: "Descarga DOCX", description: "La descarga del archivo DOCX ha comenzado.", variant: "default" });
    }
    setConfirmAction(null);
  };

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
      toast({ title: "Grabación eliminada", description: "La grabación local fue eliminada.", variant: "default" });
    }
  }

  // Subir audio grabado
  const uploadRecordedAudio = () => {
    // Mostrar modal de configuración
    setShowSpeakerModal(true);
  };
  
  const confirmUploadRecordedAudio = async () => {
    if (!audioUrl) return;
    setIsProcessing(true);
    try {
      // Obtener el blob del audio grabado
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      // Crear un archivo con nombre y tipo adecuado
      const file = new File([blob], `grabacion_${Date.now()}.webm`, { type: blob.type });
      const uploadRes = await uploadAudio(file);
      
      // Encolar transcripción con el modelo seleccionado
      const filename = uploadRes.filename || file.name;
      
      // Mapear opción de speakers a parámetros técnicos
      let minSpeakers: number;
      let maxSpeakers: number | undefined;
      
      switch (selectedSpeakerOption) {
        case '1':
          minSpeakers = 1;
          maxSpeakers = 1;
          break;
        case '2':
          minSpeakers = 2;
          maxSpeakers = 2;
          break;
        case '3-5':
          minSpeakers = 3;
          maxSpeakers = 5;
          break;
        case '5+':
          minSpeakers = 6;
          maxSpeakers = undefined; // Sin límite
          break;
        case 'auto':
        default:
          minSpeakers = 2;
          maxSpeakers = undefined; // Detección automática
          break;
      }
      
      const taskId = await enqueueTranscription(
        filename,
        selectedModel,
        minSpeakers,
        maxSpeakers
      );
      
      // Agregar a tareas activas usando el contexto global
      addTask({
        task_id: taskId,
        status: "pendiente",
        progress: 0,
        filename: filename,
        model: selectedModel
      });
      
      setAudioUrl(null);
      setRecordingTime(0);
      await fetchAudios();
      toast({ title: "Transcribiendo audio", description: "El audio se está transcribiendo. Aparecerá en la lista cuando termine.", variant: "default" });
    } catch (e) {
      toast({ title: "Error", description: "No se pudo procesar el audio grabado.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setShowSpeakerModal(false);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative min-h-screen animate-fade-in">
      {/* Modal de configuración de hablantes */}
      <AlertDialog open={showSpeakerModal} onOpenChange={open => { if (!open) setShowSpeakerModal(false); }}>
        <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Configuración de transcripción</AlertDialogTitle>
            <AlertDialogDescription>
              Configura los parámetros para obtener la mejor transcripción posible
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {/* Sección: Modelo de Whisper */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base">1. Modelo de transcripción</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[
                { value: 'tiny', label: 'Tiny', desc: 'Muy rápido', icon: '⚡' },
                { value: 'base', label: 'Base', desc: 'Rápido', icon: '🚀' },
                { value: 'small', label: 'Small', desc: 'Equilibrado', icon: '⚖️' },
                { value: 'medium', label: 'Medium', desc: 'Preciso', icon: '🎯' },
                { value: 'large', label: 'Large', desc: 'Máx. calidad', icon: '👑' },
              ].map((model) => (
                <button
                  key={model.value}
                  onClick={() => setSelectedModel(model.value as WhisperModel)}
                  className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedModel === model.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{model.icon}</div>
                  <div className="font-semibold text-sm">{model.label}</div>
                  <div className="text-xs text-muted-foreground">{model.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t my-4" />

          {/* Sección: Número de hablantes */}
          <div className="space-y-3">
            <h3 className="font-semibold text-base">2. ¿Cuántas personas hablan?</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Opción: 1 persona */}
              <button
                onClick={() => setSelectedSpeakerOption('1')}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  selectedSpeakerOption === '1'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">👤</div>
                <div className="font-semibold">1 persona</div>
                <div className="text-xs text-muted-foreground mt-1">Sin etiquetas</div>
              </button>

              {/* Opción: 2 personas */}
              <button
                onClick={() => setSelectedSpeakerOption('2')}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  selectedSpeakerOption === '2'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">👥</div>
                <div className="font-semibold">2 personas</div>
                <div className="text-xs text-muted-foreground mt-1">Conversación</div>
              </button>

              {/* Opción: 3-5 personas */}
              <button
                onClick={() => setSelectedSpeakerOption('3-5')}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  selectedSpeakerOption === '3-5'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">👥👥</div>
                <div className="font-semibold">3-5 voces</div>
                <div className="text-xs text-muted-foreground mt-1">Grupo pequeño</div>
              </button>

              {/* Opción: Más de 5 */}
              <button
                onClick={() => setSelectedSpeakerOption('5+')}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  selectedSpeakerOption === '5+'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">👥+</div>
                <div className="font-semibold">Más de 5</div>
                <div className="text-xs text-muted-foreground mt-1">Reunión/Panel</div>
              </button>

              {/* Opción: Automático */}
              <button
                onClick={() => setSelectedSpeakerOption('auto')}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md md:col-span-2 ${
                  selectedSpeakerOption === 'auto'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">🤖</div>
                <div className="font-semibold">Detectar automáticamente</div>
                <div className="text-xs text-muted-foreground mt-1">Recomendado si no estás seguro</div>
              </button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg mt-4">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              💡 <strong>Tip:</strong> Small es el modelo más equilibrado. Large ofrece mejor calidad pero toma más tiempo.
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSpeakerModal(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmUploadRecordedAudio}>
              Transcribir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AnimatedBackground />
      <main className="relative z-10 container mx-auto px-4 py-16 animate-fade-in-up">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-4 text-balance transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Grabar <span className="text-primary">Audio</span>
          </h1>
          <p
            className={`text-lg text-muted-foreground text-pretty transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Graba directamente desde tu micrófono y obtén transcripciones en tiempo real
          </p>

          <Card
            className={`p-8 mb-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} border-border/50 transition-all hover:shadow-xl hover:shadow-primary/5`}
          >
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
                    <Button onClick={uploadRecordedAudio} disabled={isProcessing} className="gap-2 bg-primary text-white hover:bg-primary/90">
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        "Subir y transcribir"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
                <div className={`mb-6 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}> 
                  <h3 className="font-semibold mb-2">Audios</h3>
                  {loadingList ? (
                    <div className="text-muted-foreground">Cargando...</div>
                  ) : audios.filter(audio => {
                    // Filtrar audios que están en transcripción activa
                    const audioFilename = audio.filename || audio.name;
                    const isInTranscription = Array.from(activeTasks.values()).some(
                      task => task.filename === audioFilename && task.status !== 'completada' && task.status !== 'error'
                    );
                    return !isInTranscription;
                  }).length === 0 ? (
                    <div className="text-muted-foreground">No hay audios subidos.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left p-2">Archivo</th>
                            <th className="text-left p-2">Fecha</th>
                            <th className="text-left p-2">Duración</th>
                            <th className="text-left p-2">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {audios.filter(audio => {
                            // Filtrar audios que están en transcripción activa
                            const audioFilename = audio.filename || audio.name;
                            const isInTranscription = Array.from(activeTasks.values()).some(
                              task => task.filename === audioFilename && task.status !== 'completada' && task.status !== 'error'
                            );
                            return !isInTranscription;
                          }).map((audio: any, idx: any) => (
                            <tr key={audio.id || idx} className="border-b last:border-0">
                              <td className="p-2 align-middle whitespace-nowrap max-w-xs truncate text-left">{audio.filename || audio.name}</td>
                              <td className="p-2 align-middle whitespace-nowrap max-w-xs truncate text-left">{audio.created_at || '-'}</td>
                              <td className="p-2 align-middle whitespace-nowrap max-w-xs truncate text-left">{audio.duration ? `${audio.duration} s` : '-'}</td>
                              <td className="p-2 flex gap-2 align-middle whitespace-nowrap text-left">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="font-bold bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all shadow-md border-blue-700 border"
                                  onClick={() => {
                                    const baseName = (audio.name || audio.filename).replace(/\.[^/.]+$/, "");
                                    const transcriptName = `${baseName}.txt`;
                                    setSelectedAudio({ filename: transcriptName });
                                    setEditing(false);
                                    fetchTranscriptionLocal(transcriptName);
                                  }}
                                >
                                  Ver/Editar
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeleteAudio(audio.filename)}>
                                  Eliminar audio y transcripción
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {/* Transcripción seleccionada */}
                {selectedAudio && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Transcripción de: {selectedAudio.filename || selectedAudio.name}</h3>
                      <div className="flex items-center gap-2">
                        {!editing ? (
                          <Button
                            size="sm"
                            variant="default"
                            className="font-bold bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all shadow-md border-blue-700 border"
                            onClick={() => setEditing(true)}
                          >
                            Editar
                          </Button>
                        ) : (
                          <Button size="sm" variant="default" onClick={() => setConfirmAction({ type: 'save' })} disabled={saving}>
                            {saving ? "Guardando..." : "Guardar"}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="transition-all hover:scale-110"
                          title="Descargar TXT"
                          onClick={() => setConfirmAction({ type: 'download-txt' })}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="transition-all hover:scale-110"
                          title="Descargar DOCX"
                          onClick={() => setConfirmAction({ type: 'download-docx' })}
                        >
                          <FilePlus2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="transition-all hover:scale-110"
                          title="Copiar al portapapeles"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(transcription);
                              toast({ title: "Copiado", description: "La transcripción se copió al portapapeles.", variant: "default" });
                            } catch {
                              toast({ title: "Error", description: "No se pudo copiar al portapapeles.", variant: "destructive" });
                            }
                          }}
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="min-h-[200px] rounded-lg bg-muted/50 p-4 transition-all hover:bg-muted/70">
                      {editing ? (
                        <textarea
                          className="w-full h-40 p-2 rounded border"
                          value={transcription}
                          onChange={e => setTranscription(e.target.value)}
                          disabled={saving}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line text-left">
                          {transcription || "No hay transcripción disponible."}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
          </Card>

        </div>
      </main>

      <Footer />
      {/* Confirm delete audio dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={open => { if (!open) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Deseas eliminar el audio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el audio y su transcripción de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAudio}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Confirm other actions dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={open => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'save' && '¿Deseas guardar los cambios?'}
              {confirmAction?.type === 'download-txt' && '¿Deseas descargar el archivo TXT?'}
              {confirmAction?.type === 'download-docx' && '¿Deseas descargar el archivo DOCX?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'save' && 'Se guardarán los cambios realizados en la transcripción.'}
              {confirmAction?.type === 'download-txt' && 'Se descargará el archivo de transcripción en formato TXT.'}
              {confirmAction?.type === 'download-docx' && 'Se descargará el archivo de transcripción en formato DOCX.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedAction}>
              {confirmAction?.type === 'save' && 'Guardar'}
              {confirmAction?.type === 'download-txt' && 'Descargar TXT'}
              {confirmAction?.type === 'download-docx' && 'Descargar DOCX'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}