# 📡 ESPECIFICACIÓN DE ENDPOINTS - Backend FastAPI

**Versión:** 2.0  
**Fecha:** 14 de Enero, 2026  
**Status:** ⚠️ PENDIENTE DE IMPLEMENTACIÓN

Este documento define exactamente qué endpoints necesita tu backend para que el frontend funcione correctamente.

---

## 🔴 ENDPOINTS NO IMPLEMENTADOS (Obligatorios)

### 1. POST /transcript/queue
**Descripción:** Encola una nueva transcripción para procesamiento

**Método:** `POST`

**URL:** `http://127.0.0.1:8000/transcript/queue`

**Parámetros Query:**
```
filename: string (required)
  Ejemplo: "Recording.mp3"
  Descripción: Nombre del archivo de audio ya subido

model: string (required)
  Valores válidos: "tiny" | "base" | "small" | "medium" | "large"
  Ejemplo: "small"
  Descripción: Modelo Whisper a usar

min_speakers: integer (optional)
  Ejemplo: 1
  Descripción: Mínimo número de hablantes a detectar

max_speakers: integer (optional)
  Ejemplo: 4
  Descripción: Máximo número de hablantes a detectar
```

**Ejemplo de Request:**
```bash
POST /transcript/queue?filename=Recording.mp3&model=small&min_speakers=1&max_speakers=4

# O sin parámetros speakers:
POST /transcript/queue?filename=Recording.mp3&model=small
```

**Respuesta 200 OK:**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "Recording.mp3",
  "model": "small",
  "status": "pendiente"
}
```

**Respuesta 400 Bad Request:**
```json
{
  "error": "Modelo inválido"
}
```

**Código Ejemplo (FastAPI):**
```python
from fastapi import FastAPI, HTTPException
from typing import Optional
import uuid

@app.post("/transcript/queue")
async def enqueue_transcription(
    filename: str,
    model: str,
    min_speakers: Optional[int] = None,
    max_speakers: Optional[int] = None
):
    # Validar modelo
    valid_models = ["tiny", "base", "small", "medium", "large"]
    if model not in valid_models:
        raise HTTPException(status_code=400, detail="Modelo inválido")
    
    # Generar task_id único
    task_id = str(uuid.uuid4())
    
    # Guardar en la cola (base de datos, archivo, etc.)
    queue.append({
        "task_id": task_id,
        "filename": filename,
        "model": model,
        "status": "pendiente",
        "progress": 0,
        "min_speakers": min_speakers,
        "max_speakers": max_speakers
    })
    
    return {
        "task_id": task_id,
        "filename": filename,
        "model": model,
        "status": "pendiente"
    }
```

---

### 2. GET /transcript/status/{task_id}
**Descripción:** Obtiene el estado actual de una transcripción

**Método:** `GET`

**URL:** `http://127.0.0.1:8000/transcript/status/{task_id}`

**Path Parameters:**
```
task_id: string (required)
  Ejemplo: "550e8400-e29b-41d4-a716-446655440000"
  Descripción: ID de la tarea retornada por POST /queue
```

**Ejemplo de Request:**
```bash
GET /transcript/status/550e8400-e29b-41d4-a716-446655440000
```

**Respuesta 200 OK:**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "Recording.mp3",
  "model": "small",
  "status": "procesando",
  "progress": 45,
  "error": null
}
```

**Estados Válidos:**
- `"pendiente"` - Esperando en la cola
- `"procesando"` - Actualmente se está transcribiendo
- `"completada"` - Transcripción terminada exitosamente
- `"error"` - Ocurrió un error

**Respuesta 200 OK (cuando hay error):**
```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "Recording.mp3",
  "model": "small",
  "status": "error",
  "progress": 0,
  "error": "Archivo de audio no válido"
}
```

**Respuesta 404 Not Found:**
```json
{
  "error": "Tarea no encontrada"
}
```

**Código Ejemplo (FastAPI):**
```python
@app.get("/transcript/status/{task_id}")
async def get_transcription_status(task_id: str):
    # Buscar tarea en la base de datos
    task = db.find_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    return {
        "task_id": task["task_id"],
        "filename": task["filename"],
        "model": task["model"],
        "status": task["status"],
        "progress": task["progress"],
        "error": task.get("error")
    }
```

---

### 3. GET /transcript/queue/info
**Descripción:** Obtiene información general de la cola de procesamiento

**Método:** `GET`

**URL:** `http://127.0.0.1:8000/transcript/queue/info`

**Parámetros:** Ninguno

**Ejemplo de Request:**
```bash
GET /transcript/queue/info
```

**Respuesta 200 OK:**
```json
{
  "queue_size": 2,
  "current_task": {
    "task_id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "Recording.mp3",
    "model": "small",
    "status": "procesando",
    "progress": 45
  },
  "total_processed": 5
}
```

**Respuesta 200 OK (cuando la cola está vacía):**
```json
{
  "queue_size": 0,
  "current_task": null,
  "total_processed": 5
}
```

**Código Ejemplo (FastAPI):**
```python
@app.get("/transcript/queue/info")
async def get_queue_info():
    # Obtener información de la cola
    current = get_current_task()
    pending = get_pending_tasks_count()
    completed = get_completed_count()
    
    return {
        "queue_size": pending,
        "current_task": current,  # None si no hay nada procesando
        "total_processed": completed
    }
```

---

## 🟡 ENDPOINTS EXISTENTES (Mantener)

### 4. GET /transcript/download/{filename}
**Status:** ✅ Ya implementado

**Descripción:** Descarga transcripción en formato TXT

**Nota:** Este endpoint debe mantener su comportamiento actual

---

## 🟠 ENDPOINTS A CREAR/ACTUALIZAR

### 5. POST /transcript/download-docx
**Descripción:** Descarga transcripción en formato DOCX

**Método:** `POST`

**URL:** `http://127.0.0.1:8000/transcript/download-docx`

**Body (JSON):**
```json
{
  "filename": "Recording.txt"
}
```

**Ejemplo de Request:**
```bash
POST /transcript/download-docx
Content-Type: application/json

{
  "filename": "Recording.txt"
}
```

**Respuesta 200 OK:**
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
[archivo binario DOCX]
```

**Respuesta 404 Not Found:**
```json
{
  "error": "Archivo no encontrado"
}
```

**Código Ejemplo (FastAPI):**
```python
from docx import Document
from fastapi.responses import FileResponse
import os

@app.post("/transcript/download-docx")
async def download_transcription_docx(request: dict):
    filename = request.get("filename")
    
    # Leer archivo TXT
    txt_path = f"transcriptions/{filename}"
    if not os.path.exists(txt_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    with open(txt_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Crear documento DOCX
    doc = Document()
    doc.add_paragraph(text)
    
    # Guardar temporalmente
    docx_path = f"temp/{filename.replace('.txt', '.docx')}"
    doc.save(docx_path)
    
    # Retornar archivo
    return FileResponse(
        path=docx_path,
        filename=filename.replace('.txt', '.docx'),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
```

---

## ⚙️ CONFIGURACIÓN REQUERIDA

### CORS
Agrega middleware CORS al backend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Frontend en desarrollo
        "http://localhost:3001",      # Alternativa
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Base de Datos / Persistencia
Necesitas un lugar para guardar:
1. **Tareas en cola** - Queue/List con estado actual
2. **Historial de completadas** - Contador o lista
3. **Parámetros de cada tarea** - filename, model, speakers, etc.

Opciones:
- SQLite (simple, archivo único)
- PostgreSQL (escalable)
- Redis (rápido, temporal)
- Archivo JSON (muy simple, solo desarrollo)

---

## 📋 FLUJO DE PROCESAMIENTO

El backend debe implementar este flujo:

```
1. Usuario sube archivo → /upload (endpoint existente)
   
2. Usuario hace clic "Transcribir" → POST /transcript/queue
   ├─ Validar modelo
   ├─ Generar task_id único
   ├─ Guardar en la cola
   └─ Retornar task_id

3. Frontend polling cada 2 segundos → GET /transcript/status/{task_id}
   ├─ Retornar estado (pendiente|procesando|completada|error)
   ├─ Retornar progreso (0-100%)
   └─ Frontend actualiza modal con esta info

4. Backend procesa (paralelamente):
   ├─ Monitorear cola
   ├─ Si hay tarea pendiente, cambiar a "procesando"
   ├─ Ejecutar Whisper
   ├─ Actualizar progreso durante transcripción
   ├─ Guardar resultado en archivo
   └─ Cambiar estado a "completada" o "error"

5. Cuando frontend detecta status="completada"
   └─ Cargar transcripción automáticamente

6. Usuario puede:
   ├─ Editar transcripción
   ├─ Descargar TXT
   └─ Descargar DOCX
```

---

## 🧪 TEST RÁPIDOS

Prueba estos endpoints con curl:

```bash
# 1. Enqueue
curl -X POST "http://127.0.0.1:8000/transcript/queue?filename=test.mp3&model=small"

# Respuesta esperada:
# {"task_id": "...", "filename": "test.mp3", "model": "small", "status": "pendiente"}

# 2. Get status
curl "http://127.0.0.1:8000/transcript/status/TASK_ID_FROM_ABOVE"

# Respuesta esperada:
# {"task_id": "...", "filename": "test.mp3", "model": "small", "status": "pendiente", "progress": 0, "error": null}

# 3. Get queue info
curl "http://127.0.0.1:8000/transcript/queue/info"

# Respuesta esperada:
# {"queue_size": 1, "current_task": null, "total_processed": 0}
```

---

## 📞 SOPORTE

Si tienes preguntas:
1. Revisa [GUIA_PRUEBAS.md](./GUIA_PRUEBAS.md) sección "Requisitos del Backend"
2. Revisa [REFERENCIA_RAPIDA.md](./REFERENCIA_RAPIDA.md) para ejemplos
3. Abre DevTools (F12) → Network para ver requests reales

---

## ✅ CHECKLIST

Usa esto para verificar que implementaste todo:

- [ ] POST /transcript/queue
  - [ ] Acepta: filename, model, min_speakers?, max_speakers?
  - [ ] Retorna: task_id, filename, model, status
  - [ ] Encola tarea

- [ ] GET /transcript/status/{task_id}
  - [ ] Retorna: task_id, filename, model, status, progress, error
  - [ ] Status = pendiente|procesando|completada|error
  - [ ] Progress = 0-100
  - [ ] Error = null cuando status != error

- [ ] GET /transcript/queue/info
  - [ ] Retorna: queue_size, current_task, total_processed
  - [ ] current_task = null cuando no hay nada procesando
  - [ ] current_task contiene: task_id, filename, model, status, progress

- [ ] CORS configurado
  - [ ] Allow-Origin: http://localhost:3000
  - [ ] Allow-Methods: GET, POST, OPTIONS
  - [ ] Allow-Headers: Content-Type

- [ ] Sistema de cola
  - [ ] Procesa una tarea a la vez
  - [ ] Actualiza status durante procesamiento
  - [ ] Actualiza progress 0-100%
  - [ ] Guarda resultado cuando termina

