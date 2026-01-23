"use client";
import { useEffect, useState, useMemo } from "react";
import { listarCasos, eliminarCaso } from "@/lib/apiService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "../animated-background";
import CasoDetallePage from "./caso-detalle-page";

function CasosPage() {
  const [casos, setCasos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedCasoId, setSelectedCasoId] = useState<string | null>(null);
  const PAGE_SIZE = 10;
  const { toast } = useToast();

  useEffect(() => {
    listarCasos().then(data => {
      setCasos(data);
      setLoading(false);
    });
  }, []);

  // Búsqueda en tiempo real (case-insensitive)
  const casosFiltrados = useMemo(() => {
    return casos.filter((c: any) => c.nombre.toLowerCase().includes(search.toLowerCase()));
  }, [casos, search]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(casosFiltrados.length / PAGE_SIZE));
  const casosPagina = casosFiltrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Simulación de renombrar caso (debería implementarse en el backend)
  const handleRename = async (caso: any) => {
    setSaving(true);
    // Aquí deberías llamar a tu API real para renombrar el caso
    setTimeout(() => {
      setCasos(prev => prev.map((c: any) => c.id === caso.id ? { ...c, nombre: editNombre } : c));
      setEditId(null);
      setSaving(false);
    }, 800);
  };

  // Confirmación y eliminación real de caso
  const handleEliminar = async (caso: any) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el caso "${caso.nombre}"? Esta acción se puede deshacer por unos segundos.`)) return;
    setSaving(true);
    // Guardar copia para deshacer
    const backup = caso;
    setCasos(prev => prev.filter((c: any) => c.id !== caso.id));
    toast({
      title: `Caso eliminado`,
      description: `El caso "${caso.nombre}" fue eliminado.`,
      action: (
        <button
          className="ml-2 underline text-primary"
          onClick={() => {
            setCasos(prev => [backup, ...prev]);
            setSaving(false);
          }}
        >Deshacer</button>
      ),
      variant: "default",
    });
    // Eliminar realmente después de 5s si no se deshace
    setTimeout(async () => {
      if (!casos.find((c: any) => c.id === caso.id)) {
        await eliminarCaso(caso.id);
      }
      setSaving(false);
    }, 5000);
  };

  if (selectedCasoId) {
    return <CasoDetallePage casoId={selectedCasoId} onBack={() => setSelectedCasoId(null)} />;
  }
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <AnimatedBackground />
      <h1 className="text-2xl font-bold mb-4">Casos</h1>
      <Button className="mb-4" onClick={() => alert('Implementar creación de caso local')}>Crear nuevo caso</Button>
      <input
        type="text"
        placeholder="Buscar caso..."
        className="w-full mb-4 border border-input bg-background text-foreground rounded px-3 py-2"
        value={search}
        onChange={e => setSearch(e.target.value)}
        autoFocus
      />
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <>
          <ul className="space-y-2">
            {casosFiltrados.length === 0 ? (
              <li className="border border-input bg-muted text-muted-foreground rounded p-4 text-center italic">No se encontraron casos.</li>
            ) : casosPagina.map((caso: any) => (
              <li key={caso.id} className="border rounded p-4 flex justify-between items-center gap-2">
                {editId === caso.id ? (
                  <>
                    <input
                      className="border border-input bg-background text-foreground rounded px-2 py-1 mr-2"
                      value={editNombre}
                      onChange={e => setEditNombre(e.target.value)}
                      disabled={saving}
                      autoFocus
                    />
                    <Button size="sm" onClick={() => handleRename(caso)} disabled={saving || !editNombre.trim()} variant="default">
                      {saving ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditId(null)} disabled={saving}>Cancelar</Button>
                  </>
                ) : (
                  <>
                    <span>{caso.nombre}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditId(caso.id); setEditNombre(caso.nombre); }}>Renombrar</Button>
                      <Button size="sm" onClick={() => setSelectedCasoId(caso.id)}>Ver detalles</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleEliminar(caso)} disabled={saving}>Eliminar</Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          {/* Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
              <span className="text-sm">Página {page} de {totalPages}</span>
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CasosPage;