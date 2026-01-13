import { AnimatedBackground } from "@/components/animated-background"
import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Shield, Lock, Eye, Server, CheckCircle, AlertTriangle } from "lucide-react"

export default function SeguridadPage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">Seguridad en LxT</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              La seguridad de tus datos es nuestra máxima prioridad. LxT funciona como una aplicación de escritorio, lo que significa que tus archivos y transcripciones se procesan localmente en tu equipo, sin subirse a servidores externos. Implementamos las mejores prácticas para proteger tu información y privacidad.
            </p>
          </div>

          <div className="mb-12 grid gap-6 sm:grid-cols-2">
            <Card className="border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm">
              <Lock className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold text-foreground">Cifrado local</h3>
              <p className="text-sm text-muted-foreground">Tus archivos y transcripciones se mantienen y procesan localmente en tu equipo, protegidos con cifrado AES-256. Ningún dato se transmite fuera de tu computadora.</p>
            </Card>
            <Card className="border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm">
              <Eye className="mx-auto mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold text-foreground">Privacidad total</h3>
              <p className="text-sm text-muted-foreground">LxT no depende de internet ni de servidores externos. Todo el procesamiento y almacenamiento es 100% local y privado.</p>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              <h2 className="mb-6 text-2xl font-semibold text-foreground">Medidas de seguridad</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">Procesamiento local</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Todos los archivos y transcripciones se procesan y almacenan únicamente en tu equipo. No se envían ni almacenan en servidores externos.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">Cifrado de archivos</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Tus datos están protegidos con cifrado AES-256 mientras se almacenan en tu equipo.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">Privacidad garantizada</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      LxT no recopila, transmite ni comparte tus datos. Todo permanece privado y bajo tu control.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Sección de certificaciones eliminada por no aplicar a app de escritorio local */}

            <Card className="border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              <h2 className="mb-6 text-2xl font-semibold text-foreground">Tu responsabilidad</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">Contraseñas seguras</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Usa contraseñas únicas y complejas para proteger tus archivos y tu equipo. Recomendamos usar un gestor de contraseñas.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">No compartas credenciales</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Nunca compartas tus contraseñas ni información sensible. LxT nunca te pedirá tu contraseña por email o teléfono.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="mb-2 font-semibold text-foreground">Reporta actividad sospechosa</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Si notas algún comportamiento extraño en la app, contáctanos inmediatamente en seguridad@lxt.app
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-primary/20 bg-primary/5 p-6 backdrop-blur-sm">
              <h3 className="mb-2 font-semibold text-foreground">Reporta vulnerabilidades</h3>
              <p className="text-sm text-muted-foreground">
                Si descubres una vulnerabilidad en la aplicación de escritorio, por favor repórtala de forma responsable a 
                <a href="mailto:security@lxt.app" className="text-primary hover:underline">
                  security@lxt.app
                </a>.
                Tu colaboración nos ayuda a mantener LxT seguro para todos los usuarios.
              </p>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
