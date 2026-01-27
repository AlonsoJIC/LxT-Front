"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listarCasos, eliminarCaso, renombrarCaso } from "@/lib/apiService";
import { useToast } from "@/components/ui/use-toast";
import LoadingIllustration from "@/components/ui/loading-illustration";
import { Search, Plus, FolderOpen, MoreVertical, Eye, Pencil, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { OrderFilter, SortOption, FilterOption } from "@/components/ui/order-filter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function CasosPage() {
  // Opciones de orden y filtro
  const sortOptions: SortOption[] = [
    { label: "Nombre (A-Z)", value: "nombre-asc" },
    { label: "Nombre (Z-A)", value: "nombre-desc" },
    { label: "Fecha de creación (reciente)", value: "fecha-desc" },
  ];
  const [sortValue, setSortValue] = useState<string>("fecha-desc");
  // Si quieres filtrar por estado, tipo, etc., agrega aquí
  const filterOptions: FilterOption[] = [];
  const [filterValue, setFilterValue] = useState("");
  const { toast } = useToast();
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [casos, setCasos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [casoAEliminar, setCasoAEliminar] = useState<string | null>(null);
  const [casoARenombrar, setCasoARenombrar] = useState<{ id: string; nombre: string } | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [loadingRenombrar, setLoadingRenombrar] = useState(false);

  useEffect(() => {
    listarCasos().then(data => {
      setCasos(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  let casosFiltrados = casos.filter((caso) =>
    caso.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  // Ordenar según opción seleccionada
  casosFiltrados = [...casosFiltrados].sort((a: { nombre: string; fechaCreacion: string }, b: { nombre: string; fechaCreacion: string }) => {
    if (sortValue === "nombre-asc") return a.nombre.localeCompare(b.nombre);
    if (sortValue === "nombre-desc") return b.nombre.localeCompare(a.nombre);
    // fecha-desc
    return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
  });

  const handleEliminar = async (id: string) => {
    setLoadingEliminar(true);
    try {
      await eliminarCaso(id);
      setCasos(casos => casos.filter((caso) => caso.id !== id));
      setCasoAEliminar(null);
      toast({
        title: "Caso eliminado",
        description: "El caso se eliminó correctamente.",
      });
    } catch (e) {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el caso. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoadingEliminar(false);
    }
  };

  // CORREGIDO: ahora sí hace la petición HTTP PATCH
  const handleRenombrar = async () => {
    if (casoARenombrar && nuevoNombre.trim()) {
      setLoadingRenombrar(true);
      try {
        await renombrarCaso(casoARenombrar.id, nuevoNombre.trim());
        setCasos(
          casos.map((caso) =>
            caso.id === casoARenombrar.id ? { ...caso, nombre: nuevoNombre.trim() } : caso
          )
        );
        setCasoARenombrar(null);
        setNuevoNombre("");
        toast({
          title: "Caso renombrado",
          description: "El nombre del caso se actualizó correctamente.",
        });
      } catch (e) {
        toast({
          title: "Error al renombrar",
          description: "No se pudo renombrar el caso. Intenta de nuevo.",
          variant: "destructive",
        });
      } finally {
        setLoadingRenombrar(false);
      }
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

        {/* Barra de búsqueda, orden y botón crear */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 flex flex-col gap-2">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar casos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 bg-card border-border focus:border-primary focus:ring-primary"
              />
            </div>
              <OrderFilter
                sortOptions={sortOptions}
                sortValue={sortValue}
                onSortChange={setSortValue}
                filterOptions={filterOptions}
                filterValue={filterValue}
                onFilterChange={setFilterValue}
                className="mt-2"
              />
          </div>
          <Link href="/crear-caso" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Crear nuevo caso
            </Button>
          </Link>
        </div>

        {/* Lista de casos */}
        <div className="space-y-3">
          {loading ? (
            <LoadingIllustration message="Cargando tus casos..." subtext="Un momento, estamos preparando tu espacio de trabajo." />
          ) : casosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center animate-fade-in">
              {/* Ilustración SVG para estado vacío */}
              <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 animate-float">
                <rect x="16" y="32" width="64" height="40" rx="8" fill="#EEF2FF" />
                <rect x="24" y="40" width="48" height="8" rx="4" fill="#C7D2FE" />
                <rect x="24" y="52" width="32" height="8" rx="4" fill="#C7D2FE" />
                <rect x="60" y="52" width="12" height="8" rx="4" fill="#A5B4FC" />
                <rect x="36" y="60" width="24" height="4" rx="2" fill="#A5B4FC" />
                <rect x="24" y="60" width="8" height="4" rx="2" fill="#C7D2FE" />
                <rect x="64" y="60" width="8" height="4" rx="2" fill="#C7D2FE" />
                <rect x="40" y="24" width="16" height="8" rx="4" fill="#6366F1" opacity="0.2" />
              </svg>
              <h3 className="text-xl font-semibold text-foreground mb-2">No tienes casos aún</h3>
              <p className="mt-1 text-base text-muted-foreground">
                {busqueda ? "No encontramos resultados para tu búsqueda. ¡Prueba con otro nombre!" : "Crea tu primer caso para comenzar a organizar tus transcripciones."}
              </p>
              {!busqueda && (
                <Link href="/crear-caso" className="mt-6 inline-block">
                  <Button variant="primary" className="px-6 py-2 text-base animate-bounce-once">
                    <Plus className="mr-2 h-5 w-5" />
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
                  <div className="flex gap-2 ml-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={`/casos/${caso.id}`}>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">Ver detalles</span>
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalles del caso</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex items-center gap-1"
                          onClick={() => {
                            setCasoARenombrar({ id: caso.id, nombre: caso.nombre })
                            setNuevoNombre(caso.nombre)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="hidden sm:inline">Renombrar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Renombrar caso</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="primary"
                          className="flex items-center gap-1"
                          onClick={() => setCasoAEliminar(caso.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Eliminar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Eliminar caso</TooltipContent>
                    </Tooltip>
                  </div>
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
            <Button variant="outline" onClick={() => setCasoAEliminar(null)} disabled={loadingEliminar}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => casoAEliminar && handleEliminar(casoAEliminar)}
              disabled={loadingEliminar}
            >
              {loadingEliminar ? (
                <span className="flex items-center gap-2 animate-pulse">Eliminando...</span>
              ) : (
                "Eliminar"
              )}
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
            <Button variant="outline" onClick={() => setCasoARenombrar(null)} disabled={loadingRenombrar}>
              Cancelar
            </Button>
            <Button
              onClick={handleRenombrar}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!nuevoNombre.trim() || loadingRenombrar}
            >
              {loadingRenombrar ? (
                <span className="flex items-center gap-2 animate-pulse">Guardando...</span>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default CasosPage;