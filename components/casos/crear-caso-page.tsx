"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearCaso } from "@/lib/apiService";
import { useToast } from "@/components/ui/use-toast";

export default function CrearCasoPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const nuevoCaso = await crearCaso(nombre.trim());
      toast({
        title: "Caso creado",
        description: "El caso se creó correctamente.",
      });
      setTimeout(() => {
        router.push(`/casos/${nuevoCaso.id}`);
      }, 500); // Permite que el toast se muestre antes de redirigir
    } catch (err: any) {
      if (err instanceof Error && err.message && err.message.includes("400")) {
        setError("Ya existe un caso con ese nombre. Elige un nombre diferente.");
        toast({
          title: "Nombre duplicado",
          description: "Ya existe un caso con ese nombre.",
          variant: "destructive",
        });
      } else {
        setError("No se pudo crear el caso. Intenta de nuevo.");
        toast({
          title: "Error al crear",
          description: "No se pudo crear el caso. Intenta de nuevo.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative z-10 w-full max-w-md">
        {/* Botón volver */}
        <Button
          asChild
          variant="primary"
          size="lg"
          className="mb-8 inline-flex items-center text-sm"
        >
          <Link href="/casos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a casos
          </Link>
        </Button>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <FolderPlus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>
              Crear nuevo <span className="text-primary">caso</span>
            </CardTitle>
            <CardDescription>
              Organiza tus transcripciones en un nuevo caso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-foreground">
                  Nombre del caso
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder="Ejemplo: 26-000123-0123-PE"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="bg-input border-border focus:border-primary focus:ring-primary"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Usa un nombre descriptivo para identificar fácilmente este caso
                </p>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!nombre.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Crear caso
                  </>
                )}
              </Button>
            </form>
            <div className="m-6 rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Tip:</span> Una vez creado el caso, 
                podrás subir audios, grabar directamente y gestionar todas tus transcripciones.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
