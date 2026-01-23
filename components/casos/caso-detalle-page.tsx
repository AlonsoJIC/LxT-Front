
"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { listarCasos, eliminarCaso } from "@/lib/apiService";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Mic,
  Play,
  FileAudio,
  Calendar,
  Clock,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Square,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CasoDetallePage({ casoId, onBack }: { casoId: string, onBack: () => void }) {
  const [caso, setCaso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [audios, setAudios] = useState<any[]>([]);
  const [grabaciones, setGrabaciones] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [itemAEliminar, setItemAEliminar] = useState<{ id: string; tipo: "audio" | "grabacion" } | null>(null);
  const [transcripcionVisible, setTranscripcionVisible] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    listarCasos().then(data => {
      const found = Array.isArray(data) ? data.find((c: any) => c.id === casoId) : null;
      setCaso(found);
      setLoading(false);
      // Si el caso tiene audios y grabaciones, cargarlos aquí
      setAudios(found?.audios || []);
      setGrabaciones(found?.grabaciones || []);
    });
  }, [casoId]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const nuevosAudios = Array.from(files)
      .filter(file => file.type.startsWith("audio/"))
      .map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        nombre: file.name,
        fecha: new Date().toISOString().split("T")[0],
        duracion: "--:--",
        transcripcion: null,
        estado: "procesando",
      }));
    if (nuevosAudios.length === 0) return;
    setAudios(prev => [...nuevosAudios, ...prev]);
    setTimeout(() => {
      setAudios((prev) =>
        prev.map((audio) =>
          audio.estado === "procesando"
            ? { ...audio, estado: "pendiente", duracion: "03:45" }
            : audio
        )
      );
    }, 2000);
  }, []);

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

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    const nuevaGrabacion = {
      id: `g-${Date.now()}`,
      nombre: `Grabación ${grabaciones.length + 1}`,
      fecha: new Date().toISOString().split("T")[0],
      duracion: formatTime(recordingTime),
      transcripcion: null,
      estado: "procesando",
    };
    setGrabaciones([nuevaGrabacion, ...grabaciones]);
    setTimeout(() => {
      setGrabaciones((prev) =>
        prev.map((g) =>
          g.id === nuevaGrabacion.id
            ? { ...g, estado: "completado", transcripcion: "Transcripción automática de la grabación..." }
            : g
        )
      );
    }, 3000);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEliminar = async () => {
    if (!itemAEliminar) return;
    if (itemAEliminar.tipo === "audio") {
      setAudios(audios.filter((a) => a.id !== itemAEliminar.id));
    } else {
      setGrabaciones(grabaciones.filter((g) => g.id !== itemAEliminar.id));
    }
    setItemAEliminar(null);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completado":
        return <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">Completado</span>;
      case "pendiente":
        return <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">Pendiente</span>;
      case "procesando":
        return <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Procesando...</span>;
      default:
        return null;
    }
  };

  if (loading) return <div className="mt-10 text-center">Cargando...</div>;
  if (!caso) return <div className="mt-10 text-center">Caso no encontrado</div>;

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={onBack} className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a casos
          </Button>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {caso.nombre}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Creado el {new Date(caso.fechaCreacion).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {/* Área de subir y grabar */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Drag and Drop para subir audio */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-xl border-2 border-dashed p-8 transition-all duration-200
                ${isDragging 
                  ? "border-primary bg-primary/5 scale-[1.02]" 
                  : "border-border hover:border-muted-foreground hover:bg-secondary/50"
                }
              `}
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
                  MP3, WAV, M4A hasta 100MB
                </p>
              </div>
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary/10">
                  <p className="text-lg font-medium text-primary">Suelta para subir</p>
                </div>
              )}
            </div>
            {/* Grabar audio */}
            <div className={`
              rounded-xl border-2 p-8 transition-all duration-200
              ${isRecording 
                ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5" 
                : "border-border bg-card"
              }
            `}>
              <div className="flex flex-col items-center text-center">
                {isRecording ? (
                  <>
                    {/* Estado grabando */}
                    <div className="relative mb-4">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                        <div className="h-14 w-14 rounded-full bg-primary/30 animate-pulse flex items-center justify-center">
                          <div className="h-4 w-4 rounded-full bg-primary animate-ping" />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-primary mb-1">Grabando...</p>
                    <p className="text-4xl font-bold text-foreground tabular-nums mb-4">
                      {formatTime(recordingTime)}
                    </p>
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                      <Square className="h-4 w-4 fill-current" />
                      Detener grabación
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Estado sin grabar */}
                    <button
                      onClick={startRecording}
                      className="group mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 transition-all hover:bg-primary/20 hover:scale-105 active:scale-95"
                    >
                      <Mic className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                    </button>
                    <h3 className="font-medium text-foreground">Grabar audio</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Haz clic para comenzar a grabar
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Se transcribirá automáticamente
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Tabs de contenido */}
        <Tabs defaultValue="audios" className="w-full">
          <TabsList className="mb-6 bg-secondary">
            <TabsTrigger value="audios" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Audios subidos ({audios.length})
            </TabsTrigger>
            <TabsTrigger value="grabaciones" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Grabaciones ({grabaciones.length})
            </TabsTrigger>
          </TabsList>
          {/* Tab Audios */}
          <TabsContent value="audios">
            {audios.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
                <FileAudio className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground">No hay audios</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sube tu primer archivo de audio para comenzar
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                    {audios.map((audio) => (
                      <TableRow key={audio.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <FileAudio className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium text-foreground truncate max-w-[200px]">
                              {audio.nombre}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden sm:table-cell">
                          {new Date(audio.fecha).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {audio.duracion}
                          </span>
                        </TableCell>
                        <TableCell>{getEstadoBadge(audio.estado)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {/* Botón Ver transcripción visible directamente */}
                            {audio.transcripcion && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTranscripcionVisible(audio.id)}
                                className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="hidden lg:inline">Ver transcripción</span>
                              </Button>
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
                                  onClick={() => setItemAEliminar({ id: audio.id, tipo: "audio" })}
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          {/* Tab Grabaciones */}
          <TabsContent value="grabaciones">
            {grabaciones.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
                <Mic className="mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground">No hay grabaciones</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Realiza tu primera grabación para comenzar
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Grabación</TableHead>
                      <TableHead className="text-muted-foreground hidden sm:table-cell">Fecha</TableHead>
                      <TableHead className="text-muted-foreground hidden md:table-cell">Duración</TableHead>
                      <TableHead className="text-muted-foreground">Estado</TableHead>
                      <TableHead className="text-muted-foreground text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grabaciones.map((grabacion) => (
                      <TableRow key={grabacion.id} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              <Mic className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">
                              {grabacion.nombre}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden sm:table-cell">
                          {new Date(grabacion.fecha).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {grabacion.duracion}
                          </span>
                        </TableCell>
                        <TableCell>{getEstadoBadge(grabacion.estado)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {/* Botón Ver transcripción visible directamente */}
                            {grabacion.transcripcion && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTranscripcionVisible(grabacion.id)}
                                className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="hidden lg:inline">Ver transcripción</span>
                              </Button>
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
                                  onClick={() => setItemAEliminar({ id: grabacion.id, tipo: "grabacion" })}
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {/* Dialog eliminar */}
      <Dialog open={!!itemAEliminar} onOpenChange={() => setItemAEliminar(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              ¿Eliminar {itemAEliminar?.tipo === "audio" ? "audio" : "grabación"}?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. Se eliminará el archivo y su transcripción asociada.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setItemAEliminar(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleEliminar}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog ver transcripción */}
      <Dialog open={!!transcripcionVisible} onOpenChange={() => setTranscripcionVisible(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground">Transcripción</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {[...audios, ...grabaciones].find((item) => item.id === transcripcionVisible)?.transcripcion}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTranscripcionVisible(null)}>
              Cerrar
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
