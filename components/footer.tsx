export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-mono text-lg font-bold text-primary-foreground">LxT</span>
              </div>
              <span className="font-semibold">LxT</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transcripción profesional impulsada por IA para equipos modernos.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Producto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Características
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Precios
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Integraciones
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Acerca de
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Carreras
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Términos
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Seguridad
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-foreground">
                  Cookies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 LxT. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
