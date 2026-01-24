import Image from "next/image";
import { FooterLink } from "@/components/ui/footer-link";
import { FaLinkedin, FaInstagram, FaGlobe } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center">
              <div className="relative h-12 w-12">
                <Image
                  src="/logo.png"
                  alt="LxT Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Transcripción profesional impulsada por IA, nos enfocamos en la seguridad de tus datos.
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
          <div className="mb-2 flex flex-col justify-center items-center gap-1">
            <div className="flex items-center gap-2">
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
            <div className="flex gap-2 mt-1">
              <a href="https://dev-alonso.vercel.app/portfolio" target="_blank" rel="noopener noreferrer" aria-label="Portafolio" className="mx-1 text-muted-foreground hover:text-primary transition-colors">
                <FaGlobe size={18} />
              </a>
              <a href="https://www.linkedin.com/in/alonsojic/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="mx-1 text-muted-foreground hover:text-primary transition-colors">
                <FaLinkedin size={18} />
              </a>
              <a href="https://www.instagram.com/alonsojic/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="mx-1 text-muted-foreground hover:text-primary transition-colors">
                <FaInstagram size={18} />
              </a>
            </div>
          </div>
          <p>© 2026 LxT. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
