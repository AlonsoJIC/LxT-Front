"use client"

import { AnimatedBackground } from "@/components/animated-background"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
// import { Select } from "@/components/ui/select" // Removed, not used
import { FileAudio, Download, Trash2, Search, Clock, FileText } from "lucide-react"
import { FaSortUp, FaSortDown } from "react-icons/fa"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { useState, useEffect, useCallback, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { fetchAudios as fetchAudiosApi, fetchTranscription, saveTranscription, downloadTranscription, deleteAudio, deleteTranscription, API_BASE } from "@/lib/apiService"

export default function ArchivosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [audios, setAudios] = useState<any[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<any | null>(null);
  const [transcription, setTranscription] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | { type: "delete-audio" | "edit" | "download", filename: string }>(null);
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => { setIsVisible(true); }, []);

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
      toast({ title: "Error al obtener la lista", description: "No se pudo obtener la lista de audios.", variant: "destructive" });
    } finally {
      setLoadingList(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAudios();
  }, [fetchAudios]);

  let filteredAudios = audios.filter((audio) => (audio.filename || audio.name || "").toLowerCase().includes(searchQuery.toLowerCase()));

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
    setConfirmAction({ type: "edit", filename: selectedAudio.filename });
  };

  const handleDownloadTranscription = () => {
    if (!selectedAudio) return;
    setConfirmAction({ type: "download", filename: selectedAudio.filename });
  };

  const handleDownloadDocx = () => {
    if (!selectedAudio) return;
    const url = `${API_BASE}/transcript/export_docx/${selectedAudio.filename}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedAudio.filename.replace(/\.[^/.]+$/, "") + ".docx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Exportación DOCX", description: "La descarga del archivo DOCX ha comenzado.", variant: "default" });
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      toast({ title: "Copiado", description: "La transcripción se copió al portapapeles.", variant: "default" });
    } catch {
      toast({ title: "Error", description: "No se pudo copiar al portapapeles.", variant: "destructive" });
    }
  };

  const handleDeleteAudio = async (filename: string) => {
    setConfirmAction({ type: "delete-audio", filename });
  };

  return (
    <div className="relative min-h-screen animate-fade-in">
      <AnimatedBackground />
      <main className="max-w-6xl mx-auto relative z-10 container mx-auto px-4 py-16 animate-fade-in-up">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <h1
                className={`text-4xl md:text-5xl font-bold mb-2 text-balance transition-all duration-700 delay-100 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                }`}
              >
                Mis <span className="text-primary">Archivos</span>
              </h1>
              <p
                className={`text-muted-foreground transition-all duration-700 delay-200 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                }`}
              >
                Gestiona todos tus audios y transcripciones en un solo lugar
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                asChild
                className="transition-all duration-200 hover:bg-primary/10 hover:border-primary hover:text-primary"
              >
                <a href="/subir-audio">Subir audio</a>
              </Button>
              <Button
                asChild
                className="transition-all duration-200 hover:bg-primary/10 hover:border-primary hover:text-primary"
              >
                <a href="/grabar-audio">Grabar nuevo</a>
              </Button>
            </div>
          </div>
                    <div className="mb-8 animate-fade-in-up flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Buscar archivos..."
                className="pl-10 bg-white border border-gray-300 rounded-lg shadow-sm focus:bg-white focus:border-primary transition-all hover:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ minHeight: 44 }}
              />
            </div>




          </div>

        <div className="max-w-6xl mx-auto bg-muted rounded-xl p-4 md:p-8">
          <div className={`overflow-x-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}> 
            {loadingList ? (
              <div className="text-muted-foreground p-8">Cargando...</div>
            ) : (
              <Card className={(filteredAudios.length === 0 ? "p-12 text-center " : "p-6 md:p-10 ") + "animate-fade-in-up my-12 md:my-16"}>
                {filteredAudios.length === 0 ? (
                  <>
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileAudio className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No se encontraron archivos</h3>
                    <p className="text-muted-foreground mb-6">Intenta con otro término de búsqueda</p>
                  </>
                ) : (
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
                      {filteredAudios.map((audio, idx) => (
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
                )}
              </Card>
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
                    <Button size="sm" variant="default" onClick={handleSaveTranscription} disabled={saving}>
                      {saving ? "Guardando..." : "Guardar"}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="transition-all hover:scale-110" onClick={handleDownloadTranscription} title="Descargar TXT">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="transition-all hover:scale-110" onClick={handleDownloadDocx} title="Descargar DOCX">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="transition-all hover:scale-110" onClick={handleCopyToClipboard} title="Copiar al portapapeles">
                    <FileText className="h-4 w-4" />
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

          {/* Diálogo de confirmación */}
          <Dialog open={!!confirmAction} onOpenChange={open => { if (!open) setConfirmAction(null); }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {confirmAction?.type === "delete-audio" && "¿Eliminar audio?"}
                  {confirmAction?.type === "edit" && "¿Guardar cambios en la transcripción?"}
                  {confirmAction?.type === "download" && "¿Descargar transcripción?"}
                </DialogTitle>
                <DialogDescription>
                  {confirmAction?.type === "delete-audio" && `Se eliminará el audio \"${confirmAction.filename}\" y su transcripción.`}
                  {confirmAction?.type === "edit" && `Se guardarán los cambios realizados en la transcripción de \"${confirmAction.filename}\".`}
                  {confirmAction?.type === "download" && `Se descargará la transcripción de \"${confirmAction.filename}\".`}
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
                      const transcriptName = confirmAction.filename.replace(/\.[^/.]+$/, "") + ".txt";
                      try {
                        await deleteTranscription(transcriptName);
                      } catch (e) {
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

        </div>
      </main>
      <Footer />
    </div>
  );
}