// components/license/loading-screen.tsx
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="relative w-32 h-32">
          <Image
            src="/logo.png"
            alt="LxT Logo"
            fill
            className="object-contain"
            priority
          />
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
