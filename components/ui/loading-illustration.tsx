import React from "react";

/**
 * Componente visual reutilizable para estados de carga con ilustración y animación.
 * Props:
 * - message: string (mensaje principal)
 * - subtext?: string (mensaje secundario)
 * - className?: string (clases extra)
 */
export default function LoadingIllustration({
  message = "Cargando...",
  subtext = "Un momento, estamos preparando todo.",
  className = ""
}: {
  message?: string;
  subtext?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 animate-fade-in ${className}`}>
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 animate-spin">
        <circle cx="48" cy="48" r="40" stroke="#ffffff" strokeWidth="4" opacity="0.25" />
        <path d="M88 48a40 40 0 0 1-40 40" stroke="#ff2323" strokeWidth="8" strokeLinecap="round" />
      </svg>
      <h3 className="text-xl font-semibold text-primary mb-2">{message}</h3>
      {subtext && <span className="text-muted-foreground">{subtext}</span>}
    </div>
  );
}
