"use client";
import { useEffect, useState } from "react";
import { listarCasos, eliminarCaso } from "@/lib/apiService";
import { useRouter } from "next/navigation";
import CasoTabs from "./caso-tabs";
import { Button } from "@/components/ui/button";

export default function CasoDetallePage({ casoId, onBack }: { casoId: string, onBack: () => void }) {
  const [caso, setCaso] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    listarCasos().then(data => {
      setCaso(data.find((c: any) => c.id === casoId));
      setLoading(false);
    });
  }, [casoId]);

  const handleEliminar = async () => {
    if (!caso) return;
    await eliminarCaso(caso.id);
    router.push("/casos");
  };

  if (loading) return <div className="mt-10 text-center">Cargando...</div>;
  if (!caso) return <div className="mt-10 text-center">Caso no encontrado</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <Button variant="outline" onClick={onBack}>&larr; Volver</Button>
          <h1 className="text-2xl font-bold">{caso.nombre}</h1>
        </div>
        <Button variant="destructive" onClick={handleEliminar}>Eliminar caso</Button>
      </div>
      <CasoTabs casoId={casoId} />
    </div>
  );
}
