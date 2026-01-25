"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { listarCasos, subirAudio, listarAudiosCaso, eliminarAudioCaso, API_BASE } from "@/lib/apiService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, FileAudio, Calendar } from "lucide-react";
import GrabadorAudioCard from "./GrabadorAudioCard";
import AudioTable from "./audio-table";
import TranscripcionModal from "./transcripcion-modal";
interface CasoDetallePageProps {
  casoId?: string;
  onBack?: () => void;
}

const CasoDetallePage: React.FC<CasoDetallePageProps> = ({ casoId: casoIdProp, onBack }) => {
  const [caso, setCaso] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [audios, setAudios] = useState<any[]>([]);
  const [itemAEliminar, setItemAEliminar] = useState<{ id: string; nombre: string; tipo: "audio" | "grabacion" } | null>(null);
  const [transcripcionVisible, setTranscripcionVisible] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioEnReproduccion, setAudioEnReproduccion] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({ });
    const params = useParams();
    const casoId = casoIdProp || (typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : undefined);

    useEffect(() => {
      if (!casoId) return;
      setLoading(true);
      listarCasos().then(data => {
        const found = Array.isArray(data) ? data.find((c: any) => c.id == casoId) : null;
        setCaso(found);
      });
      listarAudiosCaso(casoId).then((audiosRaw: any[]) => {
        const audios = audiosRaw.map((audio: any) => ({
          ...audio,
          fecha: audio.fecha ? new Date(audio.fecha) : null,
          duracion: audio.duracion != null ? formatTime(audio.duracion) : '--:--',
        }));
        setAudios(audios);
        setLoading(false);
      });
    }, [casoId]);
  // Cleaned up: only use casoId
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || typeof casoId !== 'string') return;
    const validFiles = Array.from(files).filter(file => file.type.startsWith("audio/"));
    if (validFiles.length === 0) return;
    for (const file of validFiles) {
      const tempId = `uploading-${Date.now()}-${Math.random()}`;
      setAudios(prev => [
        {
          id: tempId,
          nombre: file.name,
          fecha: new Date().toISOString().split("T")[0],
          duracion: "--:--",
          transcripcion: null,
          estado: "Subiendo",
        },
        ...prev
      ]);
      try {
        await subirAudio(casoId, file);
        const actualizados = await listarAudiosCaso(casoId);
        setAudios(actualizados);
      } catch (e) {
        setAudios(prev => prev.filter(a => a.id !== tempId));
      }
    }
  }, [casoId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);


  const formatTime = (input: number | string) => {
    let totalSeconds = 0;
    if (typeof input === "string") {
      // Si viene como string tipo "120.1234" o "00:02:00"
      if (/^\d{2}:\d{2}:\d{2}$/.test(input)) return input; // ya está formateado
      totalSeconds = Math.floor(parseFloat(input));
    } else {
      totalSeconds = Math.floor(input);
    }
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEliminar = async () => {
    if (!itemAEliminar) return;
    if (itemAEliminar.tipo === "audio") {
      if (!casoId || typeof casoId !== 'string') return;
      try {
        await eliminarAudioCaso(casoId, itemAEliminar.nombre);
        const actualizados = await listarAudiosCaso(casoId);
        setAudios(actualizados);
        toast({
          title: "Audio eliminado",
          description: "El audio y su transcripción han sido eliminados correctamente.",
        });
      } catch (e) {
        toast({
          title: "Error al eliminar",
          description: "No se pudo eliminar el audio. Intenta nuevamente.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Grabación eliminada",
        description: "La grabación ha sido eliminada localmente.",
      });
    }
    setItemAEliminar(null);
  };

  // Las funciones getEstadoBadge, handlePlay, handlePause y audioError ahora están en AudioTable

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={onBack || (() => window.history.back())} className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a casos
          </Button>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {caso?.nombre}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Creado el {caso?.fechaCreacion ?
                new Date(caso.fechaCreacion).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }) : ""}
            </p>
          </div>
        </div>
        {/* Área de subir y grabar */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Drag and Drop para subir audio */}
          <Card
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer border-dashed p-8 transition-all duration-200 bg-card/50 border-gray-600 ${isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "hover:border-muted-foreground hover:bg-secondary/50"}`}
            style={{ minHeight: 220, backdropFilter: 'blur(2px)' }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              multiple
              className="hidden"
            />
            <div className="flex flex-col items-center text-center">
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-colors ${isDragging ? "bg-primary/20" : "bg-secondary"}`}>
                <Upload className={`h-6 w-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <h3 className="font-medium text-foreground">Subir archivos de audio</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Arrastra y suelta o haz clic para seleccionar
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                MP3, WAV, M4A, WEBM y más formatos soportados...
              </p>
            </div>
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/10">
                <p className="text-lg font-medium text-primary">Suelta para subir</p>
              </div>
            )}
          </Card>
          {/* GrabadorAudioCard para grabar audio */}
          <GrabadorAudioCard onSubir={async (grabacion) => {
            if (!casoId || typeof casoId !== 'string') return;
            const file = new File([grabacion.blob], grabacion.nombre, { type: 'audio/webm' });
            await subirAudio(casoId, file);
            const actualizados = await listarAudiosCaso(casoId);
            setAudios(actualizados);
          }} />
        </div>
        {loading ? (
          <div className="mt-10 flex flex-col items-center justify-center">
            <Spinner className="h-8 w-8 mb-4 text-primary animate-spin" />
            <span className="text-muted-foreground">Cargando audios y grabaciones...</span>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-border bg-card overflow-hidden mt-6">
              <h2 className="text-lg font-semibold px-6 pt-6 pb-2">Audios y grabaciones ({audios.length})</h2>
              {audios.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center m-6">
                  <FileAudio className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground">No hay audios ni grabaciones</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sube o graba tu primer archivo de audio para comenzar
                  </p>
                </div>
              ) : (
                <AudioTable
                  audios={audios}
                  casoId={typeof casoId === 'string' ? casoId : ''}
                  API_BASE={API_BASE}
                  audioEnReproduccion={audioEnReproduccion}
                  audioRefs={audioRefs}
                  setTranscripcionVisible={setTranscripcionVisible}
                  setItemAEliminar={setItemAEliminar}
                />
              )}
            </div>
            <TranscripcionModal
              open={!!transcripcionVisible}
              onClose={() => setTranscripcionVisible(null)}
              transcripcion={audios.find((item) => item.id === transcripcionVisible)?.transcripcion || ""}
            />
          </>
        )}
      </div>
    </main>
  );
};

export default CasoDetallePage;