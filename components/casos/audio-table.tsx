import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mic, FileAudio, Clock, Play, FileText, MoreVertical, Download, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface AudioTableProps {
  audios: any[];
  casoId: string;
  API_BASE: string;
  audioEnReproduccion: string | null;
  audioRefs: React.MutableRefObject<{ [key: string]: HTMLAudioElement | null }>;
  setTranscripcionVisible: (id: string) => void;
  setItemAEliminar: (item: { id: string; nombre: string; tipo: "audio" | "grabacion" }) => void;
}

const AudioTable: React.FC<AudioTableProps> = ({
  audios,
  casoId,
  API_BASE,
  audioEnReproduccion,
  audioRefs,
  setTranscripcionVisible,
  setItemAEliminar,
}) => {
  const [audioError, setAudioError] = React.useState<{ [key: string]: boolean }>({});
  const getEstadoBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "listo":
        return <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">Audio subido</span>;
      case "procesando":
        return (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary gap-1">
            <span className="h-3 w-3 animate-spin inline-block rounded-full border-2 border-primary border-t-transparent"></span> Procesando
          </span>
        );
      case "error":
        return <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">Error</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">{estado || 'Desconocido'}</span>;
    }
  };
  const handlePlay = (item: any) => {
    Object.values(audioRefs.current).forEach(audio => {
      if (audio && !audio.paused) audio.pause();
    });
    const key = item.id + (item.fecha ? String(item.fecha) : '');
    setTranscripcionVisible("");
    const ref = audioRefs.current[key];
    if (ref) ref.play();
  };
  const handlePause = (item: any) => {
    const key = item.id + (item.fecha ? String(item.fecha) : '');
    const ref = audioRefs.current[key];
    if (ref) ref.pause();
  };
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground">Archivo</TableHead>
          <TableHead className="text-muted-foreground hidden sm:table-cell">Fecha</TableHead>
          <TableHead className="text-muted-foreground hidden md:table-cell">Duración</TableHead>
          <TableHead className="text-muted-foreground">Estado</TableHead>
          <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {audios.map((item) => {
          const key = item.id + (item.fecha ? String(item.fecha) : "");
          const audioUrl = `${API_BASE}/casos/${casoId}/audio/${encodeURIComponent(item.nombre)}`;
          return (
            <TableRow key={key} className="border-border">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    {item.nombre?.toLowerCase().includes("grabacion") || item.nombre?.toLowerCase().includes("recording") ? (
                      <Mic className="h-5 w-5 text-primary" />
                    ) : (
                      <FileAudio className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <span className="font-medium text-foreground truncate max-w-[200px]">
                    {item.nombre}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground hidden sm:table-cell">
                {item.fecha ?
                  (item.fecha instanceof Date
                    ? item.fecha.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })
                    : new Date(item.fecha).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })
                  ) : '--'}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {item.duracion}
                </span>
              </TableCell>
              <TableCell>{getEstadoBadge(item.estado)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {item.transcripcion && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTranscripcionVisible(item.id)}
                      className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden lg:inline">Ver transcripción</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      audioEnReproduccion === key
                        ? handlePause(item)
                        : handlePlay(item)
                    }
                    disabled={item.estado?.toLowerCase() !== 'listo' || audioError[key]}
                    title={audioError[key] ? 'Formato de audio no soportado por tu navegador' : ''}
                  >
                    {audioEnReproduccion === key ? (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <audio
                    ref={el => {
                      audioRefs.current[key] = el;
                    }}
                    src={audioUrl}
                    preload="none"
                    onPlay={() => setTranscripcionVisible(key)}
                    onPause={() => setTranscripcionVisible("")}
                    onEnded={() => setTranscripcionVisible("")}
                    onError={() => setAudioError(prev => ({ ...prev, [key]: true }))}
                    style={{ display: 'none' }}
                  />
                  {audioError[key] && (
                    <span className="text-xs text-red-500 ml-2">No soportado</span>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      <DropdownMenuItem className="cursor-pointer">
                        <Play className="mr-2 h-4 w-4" />
                        Reproducir
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setItemAEliminar({
                          id: item.id,
                          nombre: item.nombre,
                          tipo: "audio"
                        })}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default AudioTable;
