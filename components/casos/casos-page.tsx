"use client";
// Nueva UI adaptada de v0/casos/page.tsx, pero usando lógica real
import Link from "next/link";
import { useEffect, useState } from "react";
import { listarCasos, eliminarCaso } from "@/lib/apiService";
import { Spinner } from "@/components/ui/spinner";
import { Search, Plus, FolderOpen, MoreVertical, Eye, Pencil, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function CasosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [casos, setCasos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [casoAEliminar, setCasoAEliminar] = useState<string | null>(null);
  const [casoARenombrar, setCasoARenombrar] = useState<{ id: string; nombre: string } | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");

  useEffect(() => {
    listarCasos().then(data => {
      setCasos(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const casosFiltrados = casos.filter((caso) =>
    caso.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEliminar = async (id: string) => {
    await eliminarCaso(id);
    setCasos(casos => casos.filter((caso) => caso.id !== id));
    setCasoAEliminar(null);
  };

  const handleRenombrar = async () => {
    if (casoARenombrar && nuevoNombre.trim()) {
      // Aquí deberías llamar a tu API real para renombrar el caso si existe endpoint
      setCasos(
        casos.map((caso) =>
          caso.id === casoARenombrar.id ? { ...caso, nombre: nuevoNombre.trim() } : caso
        )
      );
      setCasoARenombrar(null);
      setNuevoNombre("");
    }
  };

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Mis <span className="text-primary">Casos</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gestiona y organiza todos tus casos de transcripción
          </p>
        </div>

        {/* Barra de búsqueda y botón crear */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar casos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 bg-card border-border focus:border-primary focus:ring-primary"
            />
          </div>
          <Link href="/crear-caso">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Crear nuevo caso
            </Button>
          </Link>
        </div>

        {/* Lista de casos */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner className="h-8 w-8 mb-4 text-primary animate-spin" />
              <span className="text-muted-foreground">Cargando casos...</span>
            </div>
          ) : casosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
              <FolderOpen className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">No se encontraron casos</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {busqueda ? "Intenta con otra búsqueda" : "Crea tu primer caso para comenzar"}
              </p>
              {!busqueda && (
                <Link href="/crear-caso" className="mt-4">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear caso
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            casosFiltrados.map((caso) => (
              <Card key={caso.id} className="group flex flex-row items-center justify-between p-0 transition-all hover:border-primary/50 hover:bg-card/80">
                <CardContent className="flex flex-1 items-center gap-4 py-4">
                  <Link href={`/casos/${caso.id}`} className="flex flex-1 items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FolderOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {caso.nombre}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {caso.fechaCreacion ? new Date(caso.fechaCreacion).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }) : ""}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{caso.audios ?? 0} audios</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{caso.transcripciones ?? 0} transcripciones</span>
                      </div>
                    </div>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Opciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                      <DropdownMenuItem asChild>
                        <Link href={`/casos/${caso.id}`} className="flex cursor-pointer items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setCasoARenombrar({ id: caso.id, nombre: caso.nombre })
                          setNuevoNombre(caso.nombre)
                        }}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Renombrar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setCasoAEliminar(caso.id)}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar caso
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Contador de casos */}
        {casosFiltrados.length > 0 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Mostrando {casosFiltrados.length} de {casos.length} casos
          </p>
        )}
      </div>

      {/* Dialog de eliminar */}
      <Dialog open={!!casoAEliminar} onOpenChange={() => setCasoAEliminar(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">¿Eliminar caso?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. Se eliminarán todos los audios y transcripciones asociados a este caso.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCasoAEliminar(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => casoAEliminar && handleEliminar(casoAEliminar)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de renombrar */}
      <Dialog open={!!casoARenombrar} onOpenChange={() => setCasoARenombrar(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Renombrar caso</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Ingresa el nuevo nombre para este caso
            </DialogDescription>
          </DialogHeader>
          <Input
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Nombre del caso"
            className="bg-input border-border"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCasoARenombrar(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleRenombrar}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!nuevoNombre.trim()}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default CasosPage;