"use client";
import { useEffect, useState } from "react";
import LoadingIllustration from "@/components/ui/loading-illustration";
import { obtenerTranscripcion, actualizarTranscripcion, descargarTranscripcionTXT, descargarTranscripcionDOCX } from "@/lib/apiService";
import { Button } from "@/components/ui/button";

export default function CasoTranscripcionView({ casoId }: { casoId: string }) {
  const [transcripcion, setTranscripcion] = useState("");
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    obtenerTranscripcion(casoId).then(data => {
      setTranscripcion(data.text || data || "");
      setLoading(false);
    });
  }, [casoId]);

  const handleGuardar = async () => {
    setSaving(true);
    await actualizarTranscripcion(casoId, [{ text: transcripcion }]);
    setEditando(false);
    setSaving(false);
  };

  if (loading) return (
    <LoadingIllustration message="Cargando transcripción..." subtext="Un momento, estamos preparando la transcripción." />
  );

  return (
    <div>
      {editando ? (
        <div className="space-y-2">
          <textarea
            className="w-full border border-input bg-background text-foreground rounded p-2 focus:ring-2 focus:ring-primary/50 transition outline-none min-h-[120px]"
            rows={8}
            value={transcripcion}
            onChange={e => setTranscripcion(e.target.value)}
            disabled={saving}
          />
          <div className="flex gap-2">
            <Button onClick={handleGuardar} disabled={saving} variant="default">
              {saving ? (
                <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Guardando...</span>
              ) : "Guardar"}
            </Button>
            <Button variant="ghost" onClick={() => setEditando(false)} disabled={saving}>Cancelar</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="whitespace-pre-wrap border border-input bg-muted text-muted-foreground rounded p-2 min-h-[120px]">
            {transcripcion || <span className="italic text-muted-foreground">No hay transcripción.</span>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setEditando(true)} variant="secondary">Editar</Button>
            <Button onClick={() => descargarTranscripcionTXT(casoId)} variant="outline" title="Descargar TXT">Descargar TXT</Button>
            <Button onClick={() => descargarTranscripcionDOCX(casoId)} variant="outline" title="Descargar DOCX">Descargar DOCX</Button>
          </div>
        </div>
      )}
    </div>
  );
}
