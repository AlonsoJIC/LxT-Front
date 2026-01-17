// components/license/error-screen.tsx
"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorScreenProps {
  onRetry: () => void;
}

export function ErrorScreen({ onRetry }: ErrorScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icono */}
        <div className="flex justify-center">
          <AlertCircle className="w-20 h-20 text-destructive" />
        </div>
        
        {/* Título */}
        <h1 className="text-3xl font-bold">Error de conexión</h1>
        
        {/* Mensajes */}
        <div className="space-y-2 text-muted-foreground">
          <p>No se pudo conectar con el sistema de licencias.</p>
          <p>Verifica que el backend esté funcionando.</p>
        </div>
        
        {/* Botón reintentar */}
        <Button onClick={onRetry} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}
