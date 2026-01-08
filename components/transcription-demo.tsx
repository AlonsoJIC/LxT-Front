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
      type: "delete-audio" | "edit" | "download",
      filename: string
    }>(null);
  const { toast } = useToast();
  // Eliminar audio
  const handleDeleteAudio = async (filename: string) => {
    setConfirmAction({ type: "delete-audio", filename });
  };

  // Eliminar solo transcripción
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
    // Eliminado: retranscribing, processing
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
              {confirmAction?.type === "edit" && "¿Guardar cambios en la transcripción?"}
              {confirmAction?.type === "download" && "¿Descargar transcripción?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "delete-audio" && `Se eliminará el audio "${confirmAction.filename}" y su transcripción.`}
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
                  // Eliminar audio
                  await deleteAudio(confirmAction.filename);
                  // Eliminar transcript asociado (nombre base + .txt)
                  const transcriptName = confirmAction.filename.replace(/\.[^/.]+$/, "") + ".txt";
                  try {
                    await deleteTranscription(transcriptName);
                  } catch (e) {
                    // Si no existe el transcript, ignorar el error
                    console.warn("No se pudo eliminar el transcript asociado:", transcriptName);
                  }
                  toast({ title: "Audio eliminado", description: "El audio y su transcripción fueron eliminados.", variant: "default" });
                  await fetchAudios();
                  setSelectedAudio(null);
                  setTranscription("");
                } catch (e) {
                  toast({ title: "Error al eliminar el audio", description: "No se pudo eliminar el audio.", variant: "destructive" });
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
                                                <Button
                                                  size="sm"
                                                  variant="default"
                                                  className="font-bold bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all shadow-md border-blue-700 border"
                                                  onClick={() => {
                                                    // Remove audio extension for transcript filename
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
                                {/* Transcripciones después - Eliminado, ahora cada audio tiene su transcript asociado */}
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
                          <Button size="sm" variant="default" onClick={handleSaveTranscription} disabled={saving}>
                            {saving ? "Guardando..." : "Guardar"}
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="transition-all hover:scale-110" onClick={handleDownloadTranscription}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {/* Eliminar transcripción ya no es una acción permitida, solo eliminar audio */}
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

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
    </>
  );
}
