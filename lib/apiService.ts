export async function fetchTranscripts() {
  const res = await fetch(`${API_BASE}/transcript/list`);
  if (!res.ok) throw new Error("Error al obtener la lista de transcripciones");
  return res.json();
}
export async function deleteAudio(filename: string) {
  // Usar la ruta y nombre completo con extensión
  const endpoint = `${API_BASE}/audio/${filename}`;
  console.log("deleteAudio endpoint:", endpoint, "filename param:", filename);
  const res = await fetch(endpoint, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Error al eliminar el audio");
  return res.json();
}

export async function deleteTranscription(filename: string) {
  // Asegurarse de que el nombre incluya .txt
  // El backend espera el nombre exacto, incluyendo .txt si corresponde
  const res = await fetch(`${API_BASE}/transcript/${filename}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Error al eliminar la transcripción");
  return res.json();
}
// lib/apiService.ts

export const API_BASE = "http://127.0.0.1:8000";

export async function uploadAudio(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/audio/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al subir el archivo");
  return res.json();
}

export async function fetchAudios() {
  const res = await fetch(`${API_BASE}/audio/list`);
  if (!res.ok) throw new Error("Error al obtener la lista");
  return res.json();
}

export async function fetchTranscription(filename: string) {
  const res = await fetch(`${API_BASE}/transcript/${filename}`);
  if (!res.ok) throw new Error("Error al obtener la transcripción");
  const json = await res.json();
  console.log("apiService fetchTranscription response:", json);
  return json;
}

export async function generateTranscription(filename: string, minSpeakers?: number, maxSpeakers?: number) {
  const params = new URLSearchParams();
  params.append("filename", filename);
  if (minSpeakers !== undefined) {
    params.append("min_speakers", minSpeakers.toString());
  }
  if (maxSpeakers !== undefined) {
    params.append("max_speakers", maxSpeakers.toString());
  }

  const res = await fetch(`${API_BASE}/transcript?${params.toString()}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Error al generar la transcripción");
  return res.json();
}

export async function saveTranscription(filename: string, text: string) {
  const res = await fetch(`${API_BASE}/transcript/${filename}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Error al guardar la transcripción");
  return res.json();
}

export function downloadTranscription(filename: string) {
  const url = `${API_BASE}/transcript/download/${filename}`;
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename || "transcripcion"}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
