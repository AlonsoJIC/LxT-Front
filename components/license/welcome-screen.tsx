// components/license/welcome-screen.tsx
"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface WelcomeScreenProps {
  daysRemaining: number | null;
  warningMessage: string | null;
  onContinue: () => void;
}

export function WelcomeScreen({ daysRemaining, warningMessage, onContinue }: WelcomeScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [onContinue]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6 max-w-md mx-4">
        {/* Icono de check */}
        <CheckCircle2 className="w-20 h-20 text-green-500" />
        
        {/* Título */}
        <h1 className="text-4xl font-bold text-center">
          ¡Bienvenido!
        </h1>
        
        {/* Días restantes */}
        {daysRemaining !== null && (
          <p className="text-xl text-muted-foreground text-center">
            Licencia válida - {daysRemaining} días restantes
          </p>
        )}
        
        {/* Advertencia si existe */}
        {warningMessage && (
          <div className="w-full p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-600 dark:text-yellow-500 flex items-center gap-2">
              <span>⚠️</span>
              <span>{warningMessage}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
