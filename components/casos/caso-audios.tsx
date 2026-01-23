"use client";
// Componente para listar, subir y grabar audios de un caso
import CasoAudiosList from "./caso-audios-list";
import CasoAudiosUpload from "./caso-audios-upload";
import CasoAudiosRecord from "./caso-audios-record";
import { useState } from "react";

export default function CasoAudios({ casoId }: { casoId: string }) {
  const [refresh, setRefresh] = useState(0);
  const handleUpload = () => setRefresh(r => r + 1);
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Audios del caso</h2>
      <div className="flex gap-4 mb-4">
        <CasoAudiosUpload casoId={casoId} onUpload={handleUpload} />
        <CasoAudiosRecord casoId={casoId} onUpload={handleUpload} />
      </div>
      <CasoAudiosList key={refresh} casoId={casoId} />
    </div>
  );
}
