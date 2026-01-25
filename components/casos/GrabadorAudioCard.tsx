import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Trash2 } from "lucide-react";

interface GrabacionLocal {
  id: string;
  nombre: string;
  fecha: string;
  duracion: string;
  blob: Blob;
  url: string;
  estado: string;
  error: string | null;
}

interface GrabadorAudioCardProps {
  onSubir: (grabacion: GrabacionLocal) => void;
}

const GrabadorAudioCard: React.FC<GrabadorAudioCardProps> = ({ onSubir }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [grabacionesLocales, setGrabacionesLocales] = useState<GrabacionLocal[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const formatTime = (input: number | string) => {
    let totalSeconds = 0;
    if (typeof input === "string") {
      if (/^\d{2}:\d{2}:\d{2}$/.test(input)) return input;
      totalSeconds = Math.floor(parseFloat(input));
    } else {
      totalSeconds = input;
    }
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const startRecording = async () => {
    setIsRecording(true);
    setRecordingTime(0);
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new window.MediaRecorder(stream);
      setMediaRecorder(recorder);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        setRecordingTime(0);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        const tempId = `grabacion-${Date.now()}-${Math.random()}`;
        setGrabacionesLocales(prev => [
          {
            id: tempId,
            nombre: `grabacion_${Date.now()}.webm`,
            fecha: new Date().toISOString().split("T")[0],
            duracion: formatTime(recordingTime),
            blob: audioBlob,
            url,
            estado: "Listo para subir",
            error: null
          },
          ...prev
        ]);
      };
      recorder.start();
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleSubirGrabacion = async (grabacion: GrabacionLocal) => {
    const tempId = grabacion.id;
    setGrabacionesLocales(prev => prev.map(g => g.id === tempId ? { ...g, estado: "Subiendo", error: null } : g));
    try {
      await onSubir(grabacion);
      setGrabacionesLocales(prev => prev.filter(g => g.id !== tempId));
    } catch (e) {
      setGrabacionesLocales(prev => prev.map(g => g.id === tempId ? { ...g, estado: "Error al subir", error: (e && typeof e === 'object' && 'message' in e) ? (e.message as string) : "Error desconocido" } : g));
    }
  };

  const handleEliminarGrabacionLocal = (id: string) => {
    setGrabacionesLocales(prev => prev.filter(g => g.id !== id));
  };

  return (
    <Card
      className={`p-6 flex flex-col items-center justify-center gap-4 min-h-[220px] transition-all duration-200 cursor-pointer select-none relative group ${isRecording ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 scale-[1.02]' : 'border-border bg-card hover:border-primary/60 hover:shadow-lg'}`}
      onClick={!isRecording ? startRecording : stopRecording}
      style={{ userSelect: 'none' }}
      tabIndex={0}
      role="button"
      aria-pressed={isRecording}
    >
      <div className="flex flex-col items-center w-full">
        <div className="mb-4 flex items-center justify-center">
          {isRecording ? (
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 animate-pulse">
                <div className="h-14 w-14 rounded-full bg-primary/30 animate-pulse flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-primary animate-ping" />
                </div>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Square className="h-8 w-8 text-primary" />
                </span>
              </div>
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-all group-hover:bg-primary/20 group-hover:scale-105 active:scale-95">
              <Mic className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            </div>
          )}
        </div>
        <h2 className="font-medium text-foreground text-lg">{isRecording ? 'Grabando...' : 'Grabar audio'}</h2>
        <p className="mt-1 text-sm text-muted-foreground text-center">
          {isRecording ? 'Haz clic para detener la grabación' : 'Haz clic para comenzar a grabar'}
        </p>
        {isRecording && (
          <p className="text-4xl font-bold text-primary tabular-nums mb-2 animate-pulse">{formatTime(recordingTime)}</p>
        )}
      </div>
      {/* Lista de grabaciones locales */}
      {grabacionesLocales.length > 0 && grabacionesLocales.map((item) => (
        <div key={item.id} className="w-full mt-4 p-3 rounded-lg border border-yellow-300 bg-yellow-50/10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 w-full">
            <Mic className="h-5 w-5 text-yellow-500" />
            <span className="font-medium text-foreground truncate max-w-[200px]">{item.nombre}</span>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-muted-foreground text-xs">{item.fecha}</span>
            <span className="text-muted-foreground text-xs">{item.duracion}</span>
            <span className="text-yellow-600 text-xs">{item.estado}</span>
          </div>
          {item.blob && item.blob.size > 0 ? (
            <audio controls src={item.url} className="w-full" />
          ) : (
            <span className="text-xs text-red-500">Audio vacío o corrupto</span>
          )}
          <div className="flex gap-2 w-full justify-end">
            <Button variant="outline" size="sm" onClick={e => { e.stopPropagation(); handleSubirGrabacion(item); }} disabled={item.estado === "Subiendo"}>
              Subir
            </Button>
            <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); handleEliminarGrabacionLocal(item.id); }} title="Eliminar">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          {item.estado === "Error al subir" && (
            <span className="text-xs text-red-500">{item.error}</span>
          )}
        </div>
      ))}
    </Card>
  );
};

export default GrabadorAudioCard;
