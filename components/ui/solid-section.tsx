import React from "react";
import cn from "classnames";

interface SolidSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function SolidSection({ className, children, ...props }: SolidSectionProps) {
  return (
    <section
      className={cn(
        "bg-card border border-border rounded-xl shadow-lg p-6", // fondo sólido y estilos
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
