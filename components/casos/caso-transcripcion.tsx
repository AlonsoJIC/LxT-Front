// Componente para ver y editar la transcripción de un caso
import CasoTranscripcionView from "./caso-transcripcion-view";

export default function CasoTranscripcion({ casoId }: { casoId: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Transcripción</h2>
      <CasoTranscripcionView casoId={casoId} />
    </div>
  );
}
