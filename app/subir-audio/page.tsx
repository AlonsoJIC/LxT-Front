"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { AnimatedBackground } from "@/components/animated-background"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileAudio, CheckCircle, Loader2, FileText, FilePlus2, Clipboard, Settings2, Download } from "lucide-react"
import { 
  uploadAudio, 
  fetchAudios as fetchAudiosApi, 
  fetchTranscription, 
  saveTranscription, 
  deleteAudio, 
  deleteTranscription, 
  API_BASE, 
  enqueueTranscription,
  pollTranscriptionStatus,
  downloadTranscriptionDocx,
  TranscriptionTask,
  WhisperModel,
  getQueueInfo,
  QueueInfo
} from "@/lib/apiService"
import { useToast } from "@/components/ui/use-toast"
import { ModelSelector } from "@/components/model-selector"
import { TranscriptionProgressModal } from "@/components/transcription-progress-modal"
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

export default function SubirAudioPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [audios, setAudios] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<any | null>(null);
  const [transcription, setTranscription] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | { type: 'save' | 'download-txt' | 'download-docx', filename: string }>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  
  // Estados para modelo y speakers
  const [selectedModel, setSelectedModel] = useState<WhisperModel>("small");
  const [useCustomSpeakers, setUseCustomSpeakers] = useState(false);
  const [minSpeakers, setMinSpeakers] = useState<number>(1);
  const [maxSpeakers, setMaxSpeakers] = useState<number | null>(null);

  // Modal para configuración de hablantes al subir/dropear audio
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Estado para el polling de transcripciones
  const [currentTask, setCurrentTask] = useState<TranscriptionTask | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const stopPollingRef = useRef<(() => void) | null>(null);

  // Estado de cola
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  
  useEffect(() => { setIsVisible(true); }, []);

  useEffect(() => {
    fetchAudios();
    // Actualizar info de cola cada 3 segundos
    const queueInterval = setInterval(async () => {
      try {
        const info = await getQueueInfo();
        setQueueInfo(info);
      } catch (e) {
        console.error("Error al obtener info de la cola:", e);
      }
    }, 3000);
    return () => clearInterval(queueInterval);
  }, []);

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

  const handleFileUpload = (file: File) => {
    setPendingFile(file);
    setShowSpeakerModal(true);
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleConfirmSpeakerModal = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setShowSpeakerModal(false);
    try {
      // Subir audio
      const uploadRes = await uploadAudio(pendingFile);
      await fetchAudios();
      
      // Encolar transcripción con el modelo seleccionado
      const filename = uploadRes.filename || pendingFile.name;
      const taskId = await enqueueTranscription(
        filename,
        selectedModel,
        useCustomSpeakers ? minSpeakers : undefined,
        useCustomSpeakers ? maxSpeakers ?? undefined : undefined
      );
      
      // Iniciar polling
      const initialTask: TranscriptionTask = {
        task_id: taskId,
        status: "pendiente",
        progress: 0,
        filename: filename,
        model: selectedModel
      };
      setCurrentTask(initialTask);
      setShowProgressModal(true);
      
      // Detener polling anterior si existe
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
      
      // Iniciar nuevo polling
      stopPollingRef.current = pollTranscriptionStatus(taskId, (status) => {
        setCurrentTask(status);
        
        // Cuando se complete, cargar la transcripción
        if (status.status === "completada") {
          setTimeout(async () => {
            try {
              const baseName = filename.replace(/\.[^/.]+$/, "");
              const transcriptName = `${baseName}.txt`;
              await fetchTranscriptionLocal(transcriptName);
              setShowProgressModal(false);
              toast({ title: "Transcripción generada", description: "La transcripción se generó correctamente.", variant: "default" });
            } catch (e) {
              toast({ title: "Error", description: "No se pudo cargar la transcripción.", variant: "destructive" });
            }
          }, 1000);
        }
      });
    } catch (e) {
      toast({ title: "Error", description: "No se pudo encolar la transcripción.", variant: "destructive" });
      setShowProgressModal(false);
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  };

  const handleDeleteAudio = async (filename: string) => {
    setConfirmDelete(filename);
  };

  const confirmDeleteAudio = async () => {
    if (!confirmDelete) return;
    try {
      await deleteAudio(confirmDelete);
      const transcriptName = confirmDelete.replace(/\.[^/.]+$/, "") + ".txt";
      try {
        await deleteTranscription(transcriptName);
      } catch (e) {
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
    setConfirmAction({ type: 'save', filename: selectedAudio.filename });
  };

  const confirmSaveTranscription = async () => {
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
    setConfirmAction(null);
  };

  const handleDownloadTxt = () => {
    if (!selectedAudio) return;
    setConfirmAction({ type: 'download-txt', filename: selectedAudio.filename });
  };

  const handleDownloadDocx = () => {
    if (!selectedAudio) return;
    setConfirmAction({ type: 'download-docx', filename: selectedAudio.filename });
  };

  const confirmDownload = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'download-txt') {
      const url = `${API_BASE}/transcript/download/${confirmAction.filename}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = `${confirmAction.filename || "transcripcion"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast({ title: "Descarga TXT", description: "La descarga del archivo TXT ha comenzado.", variant: "default" });
    } else if (confirmAction.type === 'download-docx') {
      downloadTranscriptionDocx(confirmAction.filename);
      toast({ title: "Descarga DOCX", description: "La descarga del archivo DOCX ha comenzado.", variant: "default" });
    }
    setConfirmAction(null);
  };

  // Limpiar polling al desmontar
  useEffect(() => {
    return () => {
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Modal de progreso de transcripción */}
      <TranscriptionProgressModal 
        open={showProgressModal} 
        task={currentTask}
        onClose={() => {
          setShowProgressModal(false);
          if (stopPollingRef.current) {
            stopPollingRef.current();
          }
        }}
      />

      {/* Modal de configuración de hablantes */}
      <AlertDialog open={showSpeakerModal} onOpenChange={open => { if (!open) setShowSpeakerModal(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Sabes cuántas personas hablan en el audio?</AlertDialogTitle>
            <AlertDialogDescription>
              Puedes especificar el rango de hablantes para mejorar la detección de voces. Si no lo sabes, deja en automático.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useCustomSpeakers}
                onChange={e => setUseCustomSpeakers(e.target.checked)}
                id="modal-speaker-toggle"
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="modal-speaker-toggle" className="font-medium cursor-pointer">Quiero especificar el rango de hablantes</label>
            </div>
            {useCustomSpeakers && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Mínimo de hablantes</label>
                  <input
                    type="number"
                    min="1"
                    value={minSpeakers}
                    onChange={e => setMinSpeakers(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-2 py-1 rounded border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Máximo de hablantes (opcional)</label>
                  <input
                    type="number"
                    min="1"
                    value={maxSpeakers || ""}
                    onChange={e => setMaxSpeakers(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Automático"
                    className="w-full px-2 py-1 rounded border"
                  />
                </div>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowSpeakerModal(false); setPendingFile(null); }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSpeakerModal} disabled={uploading}>
              {uploading ? "Procesando..." : "Confirmar y transcribir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimatedBackground />
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            className={`text-4xl md:text-5xl font-bold mb-4 text-balance transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Subir <span className="text-primary">Audio</span>
          </h1>
          <p
            className={`text-lg text-muted-foreground text-pretty transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
          >
            Sube tus archivos de audio para transcribirlos automáticamente con IA de última generación
          </p>

          <Card className="border-border/50 transition-all hover:shadow-xl hover:shadow-primary/5">
            <CardContent className="p-8">
              {/* Estado de la cola */}
              {queueInfo && (queueInfo.queue_size > 0 || queueInfo.total_processed > 0) && (
                <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <div className="flex flex-col gap-2 text-sm">
                    {queueInfo.current_task && queueInfo.current_task.status === "procesando" && (
                      <p className="font-medium text-blue-700 dark:text-blue-300">
                        🔄 PROCESANDO: {queueInfo.current_task.filename} ({queueInfo.current_task.model}) {queueInfo.current_task.progress}%
                      </p>
                    )}
                    {queueInfo.queue_size > 0 && (
                      <p className="text-blue-600 dark:text-blue-400">
                        ⏳ EN COLA: {queueInfo.queue_size} {queueInfo.queue_size === 1 ? "archivo" : "archivos"} en espera
                      </p>
                    )}
                    {queueInfo.total_processed > 0 && (
                      <p className="text-green-600 dark:text-green-400">
                        ✓ COMPLETADAS: {queueInfo.total_processed} transcripción{queueInfo.total_processed !== 1 ? "es" : ""}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div
                className={`mb-8 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border/50 bg-muted/30 py-16 sm:flex-row transition-all hover:border-primary/30 hover:bg-muted/50 relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} ${dragActive ? 'border-primary bg-primary/10' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-transparent transition-all hover:scale-105"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-5 w-5" />
                  Sube o suelta un archivo de audio
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleInputChange}
                  disabled={uploading}
                />
                {dragActive && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 pointer-events-none">
                    <span className="text-primary font-semibold">Suelta el archivo aquí</span>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="text-white text-1xl font-bold animate-pulse p-8 rounded-xl shadow-xl bg-primary/80">
                      El audio se está subiendo...<br />por favor espera
                    </div>
                  </div>
                )}
              </div>

              {/* Selector de modelo */}
              {!uploading && (
                <div className="mb-6 p-4 rounded-lg bg-muted/50">
                  <ModelSelector 
                    value={selectedModel} 
                    onChange={setSelectedModel}
                    disabled={uploading}
                  />
                </div>
              )}

              {/* Audios subidos */}
              <div className="space-y-4">
                <div className="mb-6 animate-fade-in-up"> 
                  <h3 className="font-semibold mb-2">Audios</h3>
                  {loadingList ? (
                    <div className="text-muted-foreground">Cargando...</div>
                  ) : audios.length === 0 ? (
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
                          {audios.map((audio, idx) => (
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
                                    setSelectedAudio({ filename: transcriptName, audioFilename: audio.filename || audio.name });
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
                        {transcription ? (
                          <>
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
                              <Button size="sm" variant="default" onClick={handleSaveTranscription} disabled={saving}>
                                {saving ? "Guardando..." : "Guardar"}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="transition-all hover:scale-110"
                              title="Descargar TXT"
                              onClick={handleDownloadTxt}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="transition-all hover:scale-110"
                              title="Descargar DOCX"
                              onClick={handleDownloadDocx}
                            >
                              <Download className="h-4 w-4" />
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
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="min-h-[200px] rounded-lg bg-muted/50 p-4 transition-all hover:bg-muted/70">
                      {!transcription ? (
                        <div className="flex flex-col items-center justify-center h-[200px] gap-4">
                          <p className="text-muted-foreground text-center">
                            No hay transcripción disponible para este audio.
                          </p>
                        </div>
                      ) : editing ? (
                        <textarea
                          className="w-full h-40 p-2 rounded border"
                          value={transcription}
                          onChange={e => setTranscription(e.target.value)}
                          disabled={saving}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line text-left">
                          {transcription}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

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

      <AlertDialog open={!!confirmAction} onOpenChange={open => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'save' && '¿Deseas guardar los cambios?'}
              {confirmAction?.type === 'download-txt' && '¿Descargar transcripción en TXT?'}
              {confirmAction?.type === 'download-docx' && '¿Descargar transcripción en DOCX?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'save' && 'Se guardarán los cambios realizados en la transcripción.'}
              {confirmAction?.type === 'download-txt' && 'Se descargará la transcripción en formato TXT.'}
              {confirmAction?.type === 'download-docx' && 'Se descargará la transcripción en formato DOCX.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {confirmAction?.type === 'save' ? (
              <AlertDialogAction onClick={confirmSaveTranscription}>Guardar</AlertDialogAction>
            ) : (
              <AlertDialogAction onClick={confirmDownload}>Descargar</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}