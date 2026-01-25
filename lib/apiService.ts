/**
 * Descargar la transcripción en formato TXT
 * @param casoId ID del caso
 */
export async function descargarTranscripcionTXT(casoId: string) {
  const res = await fetch(`${API_BASE}/casos/${casoId}/transcripcion/txt`);
  if (!res.ok) throw new Error("Error al descargar la transcripción TXT");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcripcion_${casoId}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
// ========== TRANSCRIPCIONES ========== 
/**
 * Obtener la transcripción de un caso
 * @param casoId ID del caso
 */
export async function obtenerTranscripcion(casoId: string) {
  const res = await fetch(`${API_BASE}/casos/${casoId}/transcripcion`);
  if (!res.ok) throw new Error("Error al obtener la transcripción");
  return res.json();
}

/**
 * Actualizar la transcripción de un caso
 * @param casoId ID del caso
 * @param transcripcion Array de objetos con texto de transcripción
 */
export async function actualizarTranscripcion(casoId: string, transcripcion: { text: string }[]) {
  const res = await fetch(`${API_BASE}/casos/${casoId}/transcripcion`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transcripcion),
  });
  if (!res.ok) throw new Error("Error al actualizar la transcripción");
  return res.json();
}
export const API_BASE = "http://127.0.0.1:8000";

// ========== AUDIOS DE CASO ========== 
export async function listarAudiosCaso(casoId: string) {
  try {
    const res = await fetch(`${API_BASE}/casos/${casoId}/audio`);
    if (!res.ok) return [];
    const data = await res.json();
    // Nueva respuesta: { audios: [ { nombre, fecha, duracion, estado } ] }
    if (data && Array.isArray(data.audios)) {
      return data.audios.map((audio: any) => ({
        id: audio.nombre,
        nombre: audio.nombre,
        fecha: audio.fecha,
        duracion: audio.duracion,
        transcripcion: audio.transcripcion || null,
        estado: audio.estado,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function eliminarAudioCaso(casoId: string, nombre: string) {
  const res = await fetch(`${API_BASE}/casos/${casoId}/audio`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre })
  });
  if (!res.ok) throw new Error("Error al eliminar el audio");
  return res.json();
}

// ========== LICENCIAMIENTO Y SEGURIDAD ========== 
export async function verificarLicencia() {
  const res = await fetch(`${API_BASE}/verificar-licencia`, { method: "POST" });
  if (!res.ok) throw new Error("Error al verificar la licencia");
  return res.json();
}

// ========== GESTIÓN DE CASOS ========== 
export async function listarCasos() {
  const res = await fetch(`${API_BASE}/casos`);
  if (!res.ok) throw new Error("Error al obtener los casos");
  return res.json();
}

export async function crearCaso(nombre: string) {
  const res = await fetch(`${API_BASE}/casos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre }),
  });
  if (!res.ok) {
    let msg = "Error al crear el caso";
    try {
      const data = await res.json();
      if (data && data.detail && typeof data.detail === "string") {
        msg = data.detail;
      }
    } catch { }
    throw new Error(`${msg} (${res.status})`);
  }
  return res.json();
}

export async function eliminarCaso(casoId: string) {
  const res = await fetch(`${API_BASE}/casos/${casoId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar el caso");
  return res.json();
}

// ========== AUDIO Y GRABACIÓN ========== 
export async function subirAudio(casoId: string, file: File) {
  const formData = new FormData();
  formData.append("archivo", file);
  const res = await fetch(`${API_BASE}/casos/${casoId}/audio/upload`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Error al subir el audio");
  return res.json();
}

export async function iniciarGrabacion(casoId: string) {
  const res = await fetch(`${API_BASE}/${casoId}/audio/grabacion/iniciar`, { method: "POST" });
  if (!res.ok) throw new Error("Error al iniciar la grabación");
  return res.json();
}

export async function detenerGrabacion(casoId: string) {
  const res = await fetch(`${API_BASE}/${casoId}/audio/grabacion/detener`, { method: "POST" });
  if (!res.ok) throw new Error("Error al detener la grabación");
  return res.json();
}

// ========== PROCESAMIENTO Y PIPELINE ========== 
export async function procesarAudio(casoId: string, modeloWhisper: string = "small") {
  const res = await fetch(`${API_BASE}/casos/${casoId}/procesar?modelo_whisper=${modeloWhisper}`, { method: "POST" });
  if (!res.ok) throw new Error("Error al procesar el audio");
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
  casoId: string,
  model: WhisperModel = "small",
  minSpeakers?: number,
  maxSpeakers?: number
): Promise<string> {
  const params = new URLSearchParams();
  params.append("model", model);
  if (minSpeakers !== undefined) {
    params.append("min_speakers", minSpeakers.toString());
  }
  if (maxSpeakers !== undefined) {
    params.append("max_speakers", maxSpeakers.toString());
  }
  const res = await fetch(`${API_BASE}/casos/${casoId}/procesar?${params.toString()}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Error al encolar la transcripción");
  const data = await res.json();
  return data.task_id || data.id || data.taskId || "";
}

/**
 * Obtener estado y progreso de una tarea
 * @param taskId ID de la tarea
 */
export async function getTranscriptionStatus(taskId: string): Promise<TranscriptionTask> {
  const res = await fetch(`${API_BASE}/casos/queue/status/${taskId}`);
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
  const res = await fetch(`${API_BASE}/casos/queue/info`);
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
 * Descargar transcripción en formato DOCX por caso
 * @param casoId ID del caso
 */
export async function descargarTranscripcionDOCX(casoId: string) {
  const res = await fetch(`${API_BASE}/casos/casos/${casoId}/transcripcion/docx`);
  if (!res.ok) throw new Error("Error al descargar la transcripción DOCX");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transcripcion_${casoId}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Listar modelos Whisper disponibles
 */
export async function listarModelosWhisper(): Promise<WhisperModel[]> {
  const res = await fetch(`${API_BASE}/casos/modelos/whisper`);
  if (!res.ok) throw new Error("Error al obtener modelos Whisper");
  return res.json();
}
