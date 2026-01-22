export async function fetchTranscripts() {
  const res = await fetch(`${API_BASE}/transcript/list`);
  if (!res.ok) throw new Error("Error al obtener la lista de transcripciones");
  return res.json();
}
export async function deleteAudio(filename: string) {
  // Usar la ruta y nombre completo con extensión
  const endpoint = `${API_BASE}/audio/${filename}`;
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
// ============= NUEVO SISTEMA DE COLAS Y POLLING =============

export type WhisperModel = "tiny" | "base" | "small" | "medium" | "large";

export interface TranscriptionTask {
  task_id: string;
  status: "pendiente" | "procesando" | "completada" | "error";
  progress: number;
  current_step?: string; // Paso actual del proceso
  filename: string;
  model: WhisperModel;
  created_at?: string;
  started_at?: string;
  completed_at?: string;
  result?: any;
  error?: string;
}

export interface QueueInfo {
  queue_size: number;
  current_task: TranscriptionTask | null;
  total_processed: number;
  available_models: WhisperModel[];
}

/**
 * Encolar una nueva transcripción
 * @param filename Nombre del archivo de audio
 * @param model Modelo a usar (tiny|base|small|medium|large)
 * @param minSpeakers Mínimo de hablantes (default 1)
 * @param maxSpeakers Máximo de hablantes (default null para automático)
 */
export async function enqueueTranscription(
  filename: string,
  model: WhisperModel = "small",
  minSpeakers?: number,
  maxSpeakers?: number
): Promise<string> {
  const params = new URLSearchParams();
  params.append("filename", filename);
  params.append("model", model);
  if (minSpeakers !== undefined) {
    params.append("min_speakers", minSpeakers.toString());
  }
  if (maxSpeakers !== undefined) {
    params.append("max_speakers", maxSpeakers.toString());
  }

  const res = await fetch(`${API_BASE}/transcript/queue?${params.toString()}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Error al encolar la transcripción");
  const data = await res.json();
  return data.task_id;
}

/**
 * Obtener estado y progreso de una tarea
 * @param taskId ID de la tarea
 */
export async function getTranscriptionStatus(taskId: string): Promise<TranscriptionTask> {
  const res = await fetch(`${API_BASE}/transcript/status/${taskId}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("TASK_NOT_FOUND");
    }
    throw new Error("Error al obtener el estado de la transcripción");
  }
  return res.json();
}

/**
 * Obtener información general de la cola
 */
export async function getQueueInfo(): Promise<QueueInfo> {
  const res = await fetch(`${API_BASE}/transcript/queue/info`);
  if (!res.ok) throw new Error("Error al obtener información de la cola");
  return res.json();
}

/**
 * Polling continuo de estado de transcripción
 * @param taskId ID de la tarea
 * @param callback Función para actualizar el estado (llamada cada 2 segundos)
 * @param interval Intervalo de polling en ms (default 2000)
 * @returns Función para detener el polling
 */
export function pollTranscriptionStatus(
  taskId: string,
  callback: (status: TranscriptionTask) => void,
  interval: number = 2000
): () => void {
  let isMounted = true;

  const doPoll = async () => {
    try {
      const status = await getTranscriptionStatus(taskId);
      if (isMounted) {
        callback(status);
        // Continuar polling solo si no está completada o con error
        if (status.status !== "completada" && status.status !== "error") {
          setTimeout(doPoll, interval);
        }
      }
    } catch (error) {
      console.error("Error en polling:", error);
      if (isMounted) {
        setTimeout(doPoll, interval);
      }
    }
  };

  doPoll();

  // Retornar función para limpiar polling
  return () => {
    isMounted = false;
  };
}

/**
 * Descargar transcripción en formato DOCX
 * @param filename Nombre del archivo de transcripción (.txt)
 */
export function downloadTranscriptionDocx(filename: string) {
  const url = `${API_BASE}/transcript/export_docx/${filename}`;
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/\.[^/.]+$/, "") + ".docx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}