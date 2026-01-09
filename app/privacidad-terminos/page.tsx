import { Footer } from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Shield, FileText, Eye, Lock } from "lucide-react"

export default function PrivacidadTerminosPage() {
  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">Privacidad y Términos</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">Última actualización: 8 de enero de 2026</p>
          </div>

          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            <Card className="border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <Shield className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold text-foreground">Tu privacidad es prioritaria</h3>
              <p className="text-sm text-muted-foreground">
                Protegemos tus datos con los más altos estándares de seguridad
              </p>
            </Card>
            <Card className="border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <FileText className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-2 font-semibold text-foreground">Términos claros</h3>
              <p className="text-sm text-muted-foreground">Lenguaje sencillo para que entiendas tus derechos</p>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              <h2 className="mb-4 flex items-center gap-3 text-2xl font-semibold text-foreground">
                <Eye className="h-6 w-6 text-primary" />
                Política de Privacidad
              </h2>

              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">1. Información que recopilamos</h3>
                  <p className="text-sm leading-relaxed">
                    En LxT recopilamos únicamente la información necesaria para brindarte nuestros servicios de
                    transcripción. Esto incluye: información de cuenta (nombre, email), archivos de audio que subas para
                    transcripción, datos de uso de la plataforma, e información de pago para suscripciones.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-foreground">2. Cómo usamos tu información</h3>
                  <p className="text-sm leading-relaxed">
                    Utilizamos tus datos para: procesar tus transcripciones con la mayor precisión posible, mejorar
                    nuestros algoritmos de IA, comunicarnos contigo sobre tu cuenta y servicios, y cumplir con
                    obligaciones legales. Nunca vendemos tus datos a terceros.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-foreground">3. Almacenamiento y retención de datos</h3>
                  <p className="text-sm leading-relaxed">
                    Tus archivos de audio y transcripciones se almacenan de forma segura en servidores cifrados.
                    Conservamos tus datos mientras tu cuenta esté activa. Puedes eliminar tus archivos en cualquier
                    momento desde el panel de control.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-foreground">4. Compartir información</h3>
                  <p className="text-sm leading-relaxed">
                    Solo compartimos tu información con: proveedores de servicios que nos ayudan a operar la plataforma
                    (todos bajo acuerdos de confidencialidad), autoridades legales cuando sea requerido por ley. Nunca
                    con fines publicitarios o marketing de terceros.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-foreground">5. Tus derechos</h3>
                  <p className="text-sm leading-relaxed">
                    Tienes derecho a: acceder a tus datos personales, corregir información inexacta, eliminar tu cuenta
                    y todos tus datos, exportar tus transcripciones, y optar por no recibir comunicaciones de marketing.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-border/50 bg-card/50 p-8 backdrop-blur-sm">
              <h2 className="mb-4 flex items-center gap-3 text-2xl font-semibold text-foreground">
                <Lock className="h-6 w-6 text-primary" />
                Términos de Servicio
              </h2>

              <div className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">1. Aceptación de términos</h3>
                  <p className="text-sm leading-relaxed">
                    Al usar LxT, aceptas estos términos. Si no estás de acuerdo, por favor no utilices nuestros
                    servicios. Nos reservamos el derecho de modificar estos términos, notificándote con antelación.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-foreground">2. Uso del servicio</h3>
                  <p className="text-sm leading-relaxed">
                    LxT te otorga una licencia limitada, no exclusiva y no transferible para usar nuestra plataforma. Te
                    comprometes a usar el servicio solo para fines legales y de acuerdo con todas las leyes aplicables.
                    No puedes: revender el servicio, usar bots o scrapers, intentar hackear la plataforma, o subir
                    contenido ilegal o dañino.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-foreground">3. Propiedad intelectual</h3>
                  <p className="text-sm leading-relaxed">
                    Tú mantienes todos los derechos sobre tus archivos de audio y las transcripciones generadas. LxT
                    retiene todos los derechos sobre la plataforma, tecnología y marca. No puedes copiar, modificar o
                    distribuir nuestro software.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-foreground">4. Pagos y suscripciones</h3>
                  <p className="text-sm leading-relaxed">
                    Las suscripciones se cobran de forma recurrente según el plan elegido. Puedes cancelar en cualquier
                    momento. Los reembolsos se otorgan según nuestra política de 30 días de garantía. Los precios pueden
                    cambiar con aviso de 30 días.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-foreground">5. Limitación de responsabilidad</h3>
                  <p className="text-sm leading-relaxed">
                    LxT se proporciona "tal cual" sin garantías. No somos responsables de: errores en las
                    transcripciones, pérdida de datos debido a fallas técnicas, o daños indirectos resultantes del uso
                    del servicio. Nuestra responsabilidad máxima está limitada al monto pagado en los últimos 12 meses.
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold text-foreground">6. Terminación</h3>
                  <p className="text-sm leading-relaxed">
                    Podemos suspender o terminar tu cuenta si violas estos términos. Tú puedes cancelar tu cuenta en
                    cualquier momento. Al terminar, se eliminarán tus datos según nuestra política de retención.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
