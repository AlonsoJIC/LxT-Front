"use client"

import { useState, useEffect, useRef, useCallback } from "react"

import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Upload, Play, Pause, Download } from "lucide-react"
import { uploadAudio, fetchAudios as fetchAudiosApi, fetchTranscription, saveTranscription, downloadTranscription, deleteAudio, deleteTranscription, fetchTranscripts } from "@/lib/apiService"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog"


export function TranscriptionDemo() {
    // Estados para modales
    const [confirmAction, setConfirmAction] = useState<null | {
      type: "delete-audio" | "delete-transcription" | "retranscribe" | "edit" | "download",
      filename: string
    }>(null);
  const { toast } = useToast();
  // Eliminar audio
  const handleDeleteAudio = async (filename: string) => {
    setConfirmAction({ type: "delete-audio", filename });
  };

  // Eliminar solo transcripción
  const handleDeleteTranscription = async (filename: string) => {
    setConfirmAction({ type: "delete-transcription", filename });
  };
  const [selectedAudio, setSelectedAudio] = useState<any | null>(null);
  const [transcription, setTranscription] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [audios, setAudios] = useState<any[]>([]);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [loadingList, setLoadingList] = useState(false);
    const [retranscribing, setRetranscribing] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Subir archivo
  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      await uploadAudio(file);
      await fetchAudios();
      toast({
        title: "Archivo subido",
        description: "El archivo de audio se subió correctamente.",
        variant: "default"
      });
    } catch (e) {
      toast({
        title: "Error al subir el archivo",
        description: "No se pudo subir el archivo de audio.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Obtener lista de audios
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
      // Obtener lista de transcripciones reales
      const transcriptData = await fetchTranscripts();
      if (Array.isArray(transcriptData)) {
        setTranscripts(transcriptData);
      } else if (transcriptData && Array.isArray(transcriptData.transcripts)) {
        setTranscripts(transcriptData.transcripts);
      } else {
        setTranscripts([]);
      }
    } catch (e) {
      setAudios([]);
      setTranscripts([]);
      toast({
        title: "Error al obtener la lista",
        description: "No se pudo obtener la lista de audios o transcripciones.",
        variant: "destructive"
      });
    } finally {
      setLoadingList(false);
    }
  }, []);
  // Mostrar lista de transcripciones reales
  // Puedes mostrarla en la UI donde prefieras, por ejemplo debajo de los audios:

  // Obtener transcripción
  const fetchTranscriptionLocal = async (filename: string) => {
    try {
      const data: any = await fetchTranscription(filename);
      console.log("fetchTranscription response:", data);
      if (data && typeof data.text === "string") {
        setTranscription(data.text);
      } else {
        setTranscription("");
        toast({
          title: "Transcripción no encontrada",
          description: "No se encontró la transcripción para este audio. Respuesta: " + JSON.stringify(data),
          variant: "destructive"
        });
        console.warn("Respuesta inesperada de transcripción:", data);
      }
    } catch (e) {
      setTranscription("");
      toast({
        title: "Error al obtener la transcripción",
        description: "No se pudo cargar la transcripción.",
        variant: "destructive"
      });
      console.error("Error en fetchTranscription:", e);
    }
  };

  // Guardar transcripción
    // Volver a transcribir audio
    const handleRetranscribeAudio = async (filename: string) => {
      setConfirmAction({ type: "retranscribe", filename });
    };
  const handleSaveTranscription = async () => {
    if (!selectedAudio) return;
    setConfirmAction({ type: "edit", filename: selectedAudio.filename });
  };

  // Descargar transcripción
  const handleDownloadTranscription = () => {
    if (!selectedAudio) return;
    setConfirmAction({ type: "download", filename: selectedAudio.filename });
  };

  useEffect(() => {
    fetchAudios();
    // No llamar fetchTranscription aquí ni en dependencias de estado
    // Solo se debe llamar fetchTranscription al hacer click en 'Ver/Editar'
  }, [fetchAudios]);

  // Drag & drop handlers
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

  return (
    <>
      {/* Modal de confirmación */}
      <Dialog open={!!confirmAction} onOpenChange={open => { if (!open) setConfirmAction(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "delete-audio" && "¿Eliminar audio?"}
              {confirmAction?.type === "delete-transcription" && "¿Eliminar transcripción?"}
              {confirmAction?.type === "retranscribe" && "¿Volver a transcribir este audio?"}
              {confirmAction?.type === "edit" && "¿Guardar cambios en la transcripción?"}
              {confirmAction?.type === "download" && "¿Descargar transcripción?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "delete-audio" && `Se eliminará el audio "${confirmAction.filename}" y su transcripción.`}
              {confirmAction?.type === "delete-transcription" && `Se eliminará solo la transcripción de "${confirmAction.filename}".`}
              {confirmAction?.type === "retranscribe" && `Esto volverá a procesar el audio "${confirmAction.filename}" y reemplazará la transcripción actual si existe.`}
              {confirmAction?.type === "edit" && `Se guardarán los cambios realizados en la transcripción de "${confirmAction.filename}".`}
              {confirmAction?.type === "download" && `Se descargará la transcripción de "${confirmAction.filename}".`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button variant="default" onClick={async () => {
              if (!confirmAction) return;
              if (confirmAction.type === "delete-audio") {
                try {
                  await deleteAudio(confirmAction.filename);
                  toast({ title: "Audio eliminado", description: "El audio y su transcripción fueron eliminados.", variant: "default" });
                  await fetchAudios();
                  setSelectedAudio(null);
                  setTranscription("");
                } catch (e) {
                  toast({ title: "Error al eliminar el audio", description: "No se pudo eliminar el audio.", variant: "destructive" });
                }
              }
              if (confirmAction.type === "delete-transcription") {
                try {
                  await deleteTranscription(confirmAction.filename);
                  toast({ title: "Transcripción eliminada", description: "La transcripción fue eliminada.", variant: "default" });
                  setTranscription("");
                  await fetchAudios(); // Refresca la lista de transcripciones y audios
                } catch (e) {
                  toast({ title: "Error al eliminar la transcripción", description: "No se pudo eliminar la transcripción.", variant: "destructive" });
                }
              }
              if (confirmAction.type === "retranscribe") {
                setRetranscribing(confirmAction.filename);
                try {
                  const res = await fetch(`http://127.0.0.1:8000/transcribe?filename=${encodeURIComponent(confirmAction.filename)}`, { method: "POST" });
                  if (!res.ok) throw new Error("Error al re-transcribir el audio");
                  toast({ title: "Transcripción en proceso", description: "El audio está siendo re-transcrito.", variant: "default" });
                  await fetchAudios();
                } catch (e) {
                  toast({ title: "Error al re-transcribir", description: "No se pudo re-transcribir el audio.", variant: "destructive" });
                } finally {
                  setRetranscribing(null);
                }
              }
              if (confirmAction.type === "edit") {
                setSaving(true);
                try {
                  await saveTranscription(confirmAction.filename, transcription);
                  setEditing(false);
                  toast({ title: "Transcripción guardada", description: "Los cambios se guardaron correctamente.", variant: "default" });
                } catch (e) {
                  toast({ title: "Error al guardar la transcripción", description: "No se pudo guardar la transcripción.", variant: "destructive" });
                } finally {
                  setSaving(false);
                }
              }
              if (confirmAction.type === "download") {
                downloadTranscription(confirmAction.filename);
              }
              setConfirmAction(null);
            }}>{confirmAction?.type === "download" ? "Descargar" : "Confirmar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ...resto del componente... */}
      <section id="demo" className=" relative">
      <div className="container mx-auto">
        <div
          className={`mx-auto mb-5 max-w-2xl text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <h2 className="mb-4 text-balance text-3xl font-bold sm:text-4xl">Prueba la transcripción</h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Sube un archivo de audio para ver LxT en acción
          </p>
        </div>

        <div
          className={`mx-auto max-w-4xl transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Card className="border-border/50 transition-all hover:shadow-xl hover:shadow-primary/5">
            <CardContent className="p-8">
              <div
                className={`mb-8 flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border/50 bg-muted/30 py-16 sm:flex-row transition-all hover:border-primary/30 hover:bg-muted/50 relative ${dragActive ? 'border-primary bg-primary/10' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                {uploading && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="text-white text-2xl font-bold animate-pulse p-8 rounded-xl shadow-xl bg-primary/80 text-center">
                      Transcribiendo, esto puede tardar varios minutos dependiendo el audio,<br />por favor no cierre la aplicación
                    </div>
                  </div>
                )}
                {/* Botón de grabación removido temporalmente */}
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
                      El audio se esta transcribiendo, esto puede tardar varios minutos dependiendo el audio,<br />por favor no cierre la aplicación
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                                {/* Audios subidos primero */}
                                <div className="mb-6">
                                  <h3 className="font-semibold mb-2">Audios subidos</h3>
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
                                              <td className="p-2">{audio.filename || audio.name}</td>
                                              <td className="p-2">{audio.created_at || '-'}</td>
                                              <td className="p-2">{audio.duration ? `${audio.duration} s` : '-'}</td>
                                              <td className="p-2 flex gap-2">
                                                <Button size="sm" variant="destructive" onClick={() => handleDeleteAudio(audio.filename)}>
                                                  Eliminar audio
                                                </Button>
                                                {/* Mostrar botón de re-transcribir si no hay transcripción */}
                                                {(!audio.has_transcription && !retranscribing) && (
                                                  <Button size="sm" variant="default" onClick={() => handleRetranscribeAudio(audio.filename)}>
                                                    Volver a transcribir
                                                  </Button>
                                                )}
                                                {retranscribing === audio.filename && (
                                                  <Button size="sm" variant="default" disabled>
                                                    Transcribiendo...
                                                  </Button>
                                                )}
                                                {/* Ver/Editar transcripción por nombre base */}
                                                <Button size="sm" variant="outline" onClick={() => {
                                                  const transcriptName = `${audio.name || audio.filename}.txt`;
                                                  if (transcripts.includes(transcriptName)) {
                                                    setSelectedAudio({ filename: transcriptName });
                                                    setEditing(false);
                                                    fetchTranscriptionLocal(transcriptName);
                                                  } else {
                                                    toast({ title: "Transcripción no encontrada", description: `No se encontró la transcripción para ${audio.name || audio.filename}.`, variant: "destructive" });
                                                  }
                                                }}>
                                                  Ver/Editar
                                                </Button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                                {/* Transcripciones después */}
                                <div className="mb-6">
                                  <h3 className="font-semibold mb-2">Transcripciones disponibles</h3>
                                  {loadingList ? (
                                    <div className="text-muted-foreground">Cargando...</div>
                                  ) : transcripts.length === 0 ? (
                                    <div className="text-muted-foreground">No hay transcripciones generadas.</div>
                                  ) : (
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full text-sm">
                                        <thead>
                                          <tr>
                                            <th className="text-left p-2">Archivo transcripción</th>
                                            <th className="text-left p-2">Acciones</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {transcripts.map((filename, idx) => (
                                            <tr key={filename || idx} className="border-b last:border-0">
                                              <td className="p-2">{filename}</td>
                                              <td className="p-2 flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => {
                                                  setSelectedAudio({ filename });
                                                  setEditing(false);
                                                  fetchTranscriptionLocal(filename);
                                                }}>
                                                  Ver/Editar
                                                </Button>
                                                <Button size="sm" variant="ghost" className="transition-all hover:scale-110" onClick={() => downloadTranscription(filename)}>
                                                  <Download className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDeleteTranscription(filename)}>
                                                  Eliminar transcripción
                                                </Button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                {selectedAudio && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Transcripción de: {selectedAudio.filename || selectedAudio.name}</h3>
                      <div className="flex items-center gap-2">
                        {!editing ? (
                          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                            Editar
                          </Button>
                        ) : (
                          <Button size="sm" variant="default" onClick={handleSaveTranscription} disabled={saving}>
                            {saving ? "Guardando..." : "Guardar"}
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="transition-all hover:scale-110" onClick={handleDownloadTranscription}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteTranscription(selectedAudio.filename)}>
                          Eliminar transcripción
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
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                          {transcription || "No hay transcripción disponible."}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary transition-all hover:bg-primary/20 animate-in fade-in duration-500">
                    Español detectado
                  </span>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent transition-all hover:bg-accent/20 animate-in fade-in duration-500 delay-100">
                    1 hablante
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground transition-all hover:bg-muted/80 animate-in fade-in duration-500 delay-200">
                    Alta precisión
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
    </>
  );
}
