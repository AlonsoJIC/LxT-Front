export default function Contacto() {
  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-4">Contacto</h1>
      <p className="mb-4">¿Tienes dudas, sugerencias o necesitas comunicarte con nosotros?</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Email: <a href="mailto:soporte@lxt.com" className="text-blue-600 underline">soporte@lxt.com</a></li>
        <li>Teléfono: <span className="text-muted-foreground">+52 55 1234 5678</span></li>
      </ul>
      <p>Próximamente: formulario de contacto directo.</p>
    </div>
  );
}
