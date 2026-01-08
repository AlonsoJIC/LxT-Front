import { FooterLink } from "@/components/ui/footer-link";

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
              Transcripción profesional impulsada por IA, aplicación enfocada en la seguridad de tus datos.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Soporte</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <FooterLink href="/soporte">Soporte</FooterLink>
              </li>
              <li>
                <FooterLink href="/contacto">Contacto</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Legal y Seguridad</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                  <FooterLink href="/seguridad">
                    Seguridad
                  </FooterLink>
              </li>
              <li>
                  <FooterLink href="/privacidad-terminos">
                    Privacidad y Términos
                  </FooterLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <div className="mb-2 flex justify-center items-center gap-2">
            <span>Creado y diseñado por </span>
            <a
              href="https://dev-alonso.vercel.app/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline underline-offset-4 hover:text-blue-700 transition-colors"
            >
              Alonso
            </a>
            <span className="text-2xl">🦈</span>
            <span className="text-2xl">❤️</span>
          </div>
          <p>© 2026 LxT. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
