"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { crearCaso } from "@/lib/apiService";
import { useRouter } from "next/navigation";
import { AnimatedBackground } from "../animated-background";

export default function CrearCasoPage() {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCrear = async () => {
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      await crearCaso(nombre);
      router.push("/casos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <AnimatedBackground />
      
      <h1 className="text-2xl font-bold mb-4">Crear nuevo caso</h1>
      <input
        className="w-full border rounded px-3 py-2 mb-4"
        placeholder="Nombre del caso"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        disabled={loading}
      />
      <Button onClick={handleCrear} disabled={loading || !nombre.trim()}>
        {loading ? "Creando..." : "Crear caso"}
      </Button>
    </div>
  );
}
