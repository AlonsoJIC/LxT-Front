"use client"


import { HeaderLink } from "@/components/ui/header-link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-mono text-lg font-bold text-primary-foreground">LxT</span>
          </div>
          <span className="hidden font-semibold sm:inline-block">LxT</span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <HeaderLink href="/">Inicio</HeaderLink>
          <HeaderLink href="/subir-audio">Subir audio</HeaderLink>
          <HeaderLink href="/grabar-audio">Grabar audio</HeaderLink>
          <HeaderLink href="/archivos">Archivos</HeaderLink>
          <HeaderLink href="/soporte">Soporte</HeaderLink>
          <HeaderLink href="/contacto">Contacto</HeaderLink>
        </nav>
      </div>
    </header>
  )
}
