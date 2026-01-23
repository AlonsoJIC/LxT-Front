"use client";
import { useRef, useState } from "react";
import { subirAudio } from "@/lib/apiService";
import { Button } from "@/components/ui/button";

export default function CasoAudiosUpload({ casoId, onUpload }: { casoId: string, onUpload: () => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      await subirAudio(casoId, file);
      onUpload();
    } finally {
      setLoading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="audio/*"
        ref={fileInput}
        onChange={handleFileChange}
        className="hidden"
        disabled={loading}
      />
      <Button
        onClick={() => fileInput.current?.click()}
        disabled={loading}
        variant="secondary"
        className="w-full"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span> Subiendo...
          </span>
        ) : (
          <span>Subir audio</span>
        )}
      </Button>
    </div>
  );
}