"use client";
import { useRef, useState } from "react";
import { subirAudio } from "@/lib/apiService";
import { Button } from "@/components/ui/button";

export default function CasoAudiosRecord({ casoId, onUpload }: { casoId: string, onUpload: () => void }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder|null>(null);
  const [audioUrl, setAudioUrl] = useState<string|null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [uploading, setUploading] = useState(false);
  const chunks = useRef<Blob[]>([]);

  // Mantener referencia para evitar perder el estado en grabaciones largas
  const streamRef = useRef<MediaStream|null>(null);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.onerror = (e) => setError("Error en la grabación: " + (e.error?.message || ""));
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (e: any) {
      setError("No se pudo acceder al micrófono: " + (e.message || ""));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setRecording(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) return;
    setUploading(true);
    try {
      const file = new File([audioBlob], `grabacion_${Date.now()}.webm`, { type: 'audio/webm' });
      await subirAudio(casoId, file);
      setAudioUrl(null);
      setAudioBlob(null);
      onUpload();
    } catch (e: any) {
      setError("Error al subir el audio: " + (e.message || ""));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="my-2 flex flex-col gap-2">
      {error && <div className="text-destructive text-sm">{error}</div>}
      {!recording && !audioUrl && (
        <Button onClick={startRecording} variant="default">Iniciar grabación</Button>
      )}
      {recording && (
        <Button onClick={stopRecording} variant="destructive">Detener grabación</Button>
      )}
      {audioUrl && !recording && (
        <div className="flex flex-col gap-2">
          <audio controls src={audioUrl} className="w-full bg-muted rounded" />
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={uploading} variant="secondary">
              {uploading ? "Subiendo..." : "Subir grabación"}
            </Button>
            <Button variant="ghost" onClick={() => { setAudioUrl(null); setAudioBlob(null); }}>Descartar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
