"use client";
import { notFound } from "next/navigation";
import CasoDetallePage from "@/components/casos/caso-detalle-page";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  if (!id) return notFound();
  return <CasoDetallePage casoId={id} onBack={() => window.history.back()} />;
}
