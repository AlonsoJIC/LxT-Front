// components/license/loading-screen.tsx
import LoadingIllustration from "@/components/ui/loading-illustration";
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
        
        <LoadingIllustration message="Verificando sistema de seguridad..." subtext="Por favor espera unos segundos mientras validamos tu entorno." className="py-0" />
      </div>
    </div>
  );
}
