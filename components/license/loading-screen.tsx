// components/license/loading-screen.tsx
import { Spinner } from "@/components/ui/spinner";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="text-6xl font-bold text-primary">
          LxT
        </div>
        
        {/* Spinner */}
        <Spinner className="w-12 h-12" />
        
        {/* Mensaje */}
        <p className="text-lg text-muted-foreground">
          Verificando sistema de seguridad...
        </p>
      </div>
    </div>
  );
}
