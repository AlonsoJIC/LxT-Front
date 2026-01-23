import { useEffect, useState } from "react";
import { listarAudiosCaso, eliminarAudioCaso } from "@/lib/apiService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function CasoAudiosList({ casoId }: { casoId: string }) {
  const [audios, setAudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    listarAudiosCaso(casoId)
      .then(data => {
        setAudios(Array.isArray(data) ? data : []);
      })
      .catch(() => setAudios([]))
      .finally(() => setLoading(false));
  }, [casoId]);

  const handleEliminar = async (audioId: string) => {
    const audio = audios.find(a => a.id === audioId);
    if (!audio) return;
    if (!window.confirm(`¿Seguro que deseas eliminar el audio "${audio.nombre || audio.filename}"? Puedes deshacer esta acción por unos segundos.`)) return;
    setAudios(audios => audios.filter(a => a.id !== audioId));
    toast({
      title: `Audio eliminado`,
      description: `El audio "${audio.nombre || audio.filename}" fue eliminado.`,
      action: (
        <button
          className="ml-2 underline text-primary"
          onClick={() => setAudios(prev => [audio, ...prev])}
        >Deshacer</button>
      ),
      variant: "default",
    });
    setTimeout(async () => {
      if (!audios.find((a: any) => a.id === audioId)) {
        await eliminarAudioCaso(casoId, audioId);
      }
    }, 5000);
  };

  if (loading) return (
    <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
      <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
      Cargando audios...
    </div>
  );

  return (
    <ul className="space-y-2">
      {audios.length === 0 ? (
        <li className="border border-input bg-muted text-muted-foreground rounded p-4 text-center italic">No hay audios en este caso.</li>
      ) : audios.map(audio => (
        <li key={audio.id} className="border border-input bg-card text-card-foreground rounded p-2 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <span className="font-medium truncate max-w-[180px]">{audio.nombre || audio.filename}</span>
          <div className="flex gap-2 items-center">
            <audio controls src={audio.url || audio.localUrl || audio.path} className="max-w-[200px] bg-muted rounded" />
            <Button size="sm" variant="destructive" onClick={() => handleEliminar(audio.id)} title="Eliminar audio">
              <span className="hidden md:inline">Eliminar</span>
              <span className="md:hidden">🗑️</span>
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}