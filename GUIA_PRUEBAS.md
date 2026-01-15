## ⚠️ REQUISITOS DEL BACKEND - IMPORTANTE

Antes de ejecutar cualquier prueba, asegúrate de que tu backend tiene implementados estos endpoints:

### Endpoints Requeridos

#### 1. **POST /transcript/queue**
Encola una transcripción para procesamiento
```
Parámetros:
- filename (query): Nombre del archivo de audio
- model (query): Modelo Whisper (tiny|base|small|medium|large)
- min_speakers (query, opcional): Mínimo de hablantes
- max_speakers (query, opcional): Máximo de hablantes

Respuesta (200 OK):
{
  "task_id": "uuid-string",
  "filename": "audio.mp3",
  "model": "small",
  "status": "pendiente"
}

Error (400):
{
  "error": "Descripción del error"
}
```

#### 2. **GET /transcript/status/{task_id}**
Obtiene el estado actual de una transcripción
```
Path parameter:
- task_id: ID de la tarea retornado por /queue

Respuesta (200 OK):
{
  "task_id": "uuid-string",
  "filename": "audio.mp3",
  "model": "small",
  "status": "procesando|pendiente|completada|error",
  "progress": 0-100,
  "error": null  // Solo presente si status="error"
}
```

#### 3. **GET /transcript/queue/info**
Obtiene información general de la cola
```
Respuesta (200 OK):
{
  "queue_size": 2,
  "current_task": {
    "task_id": "uuid",
    "filename": "recording.mp3",
    "model": "small",
    "status": "procesando",
    "progress": 45
  },
  "total_processed": 5
}

Nota: current_task puede ser null si no hay nada en proceso
```

#### 4. **GET /transcript/download/{filename}**
Descarga transcripción en TXT (endpoint existente que debe mantenerse)
```
Path parameter:
- filename: Nombre del archivo de transcripción (.txt)

Respuesta (200 OK):
Content-Type: text/plain
[contenido del archivo]
```

#### 5. **POST /transcript/download-docx**
Descarga transcripción en DOCX (endpoint nuevo)
```
Body:
{
  "filename": "transcripcion.txt"
}

Respuesta (200 OK):
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
[archivo binario DOCX]
```

### Estado Actual
- ❌ `/transcript/queue` - **NO IMPLEMENTADO** (404/405)
- ❌ `/transcript/queue/info` - **NO IMPLEMENTADO** (404)
- ✓ `/transcript/download/{filename}` - Ya existe
- ❌ `/transcript/download-docx` - **NO IMPLEMENTADO**

### Cómo Proceder

Si tu backend **NO tiene estos endpoints**, debes:
1. Implementar los endpoints en tu servidor FastAPI
2. Asegúrate que responden en `http://127.0.0.1:8000`
3. CORS debe estar configurado para aceptar `http://localhost:3000`

Si ya tienes los endpoints pero con **nombres o rutas diferentes**, edita `lib/apiService.ts` para apuntar a tus URLs.

---

## GUÍA DE PRUEBAS - FRONTEND

Una vez que el backend esté listo, ejecuta estas pruebas:

### PRUEBA 1: Selector de Modelo
**Objetivo:** Verificar que el selector funciona correctamente

**Pasos:**
1. Navegar a `/subir-audio`
2. Hacer scroll hasta el área de selector de modelo
3. ✓ Verificar que se muestran 5 opciones (tiny, base, small, medium, large)
4. ✓ Verificar que "small" está destacado por defecto
5. ✓ Verificar que hay indicador visual de "Recomendado" en small
6. Hacer clic en cada modelo
7. ✓ Verificar que se seleccionan correctamente (indicador visual de punto)

**Resultado Esperado:** ✅ Selector responde correctamente a clics

---

### PRUEBA 2: Flujo Completo de Transcripción - Subir Audio

**Objetivo:** Probar el flujo de subir un archivo y transcribirlo

**Pasos:**
1. Navegar a `/subir-audio`
2. Seleccionar modelo "small" (default)
3. Hacer clic en el área de drag-drop o seleccionar un archivo de audio pequeño
4. ✓ Debe aparecer modal "¿Sabes cuántas personas hablan?"
5. Hacer clic en "Confirmar y transcribir"
6. ✓ El archivo se sube y se muestra modal de progreso
7. ✓ Modal muestra:
   - Nombre del archivo
   - Modelo seleccionado (Small 77M)
   - Barra de progreso
   - Estado "⏳ En cola - esperando procesamiento" → "🔄 Procesando..."
   - Progreso va de 0% a 100%
8. ✓ Cuando progreso llega a 100%, estado cambia a "✓ Transcripción completada"
9. ✓ Modal se cierra automáticamente
10. ✓ Transcripción aparece en la sección de "Transcripción de:" debajo

**Resultado Esperado:** ✅ Transcripción completada y mostrada correctamente

---

### PRUEBA 3: Múltiples Modelos

**Objetivo:** Probar que cada modelo funciona independientemente

**Pasos:**
1. Subir 3 archivos pequeños diferentes en `/subir-audio`
2. Primer archivo: Seleccionar "tiny"
3. Segundo archivo: Seleccionar "small" (cuando el primero esté procesando)
4. Tercer archivo: Seleccionar "medium" (cuando small esté procesando)
5. ✓ Verificar que solo se procesa uno a la vez
6. ✓ Verificar estado de cola mostrando: "EN COLA: 2 archivos en espera"
7. ✓ Cada transcripción se muestra con su correspondiente modelo

**Resultado Esperado:** ✅ Cola funciona correctamente, procesamiento secuencial

---

### PRUEBA 4: Estado de Cola en Tiempo Real

**Objetivo:** Verificar visualización de la cola

**Pasos:**
1. Con 3 archivos en proceso (diferente modelo cada uno)
2. ✓ Verificar que se muestra:
   ```
   🔄 PROCESANDO: archivo1.mp3 (tiny) 45%
   ⏳ EN COLA: 2 archivos en espera
   ✓ COMPLETADAS: 0 transcripción
   ```
3. ✓ Cuando uno completa, la cola se actualiza automáticamente
4. ✓ Contador de "COMPLETADAS" incrementa

**Resultado Esperado:** ✅ Información de cola actualiza en tiempo real cada 3 segundos

---

### PRUEBA 5: Grabar Audio y Transcribir

**Objetivo:** Probar flujo de grabar en vivo

**Pasos:**
1. Navegar a `/grabar-audio`
2. Hacer clic en "Comenzar a grabar"
3. Grabar algo durante 5-10 segundos
4. Hacer clic en "Detener"
5. ✓ Se muestra reproductor de audio
6. Hacer clic en "Subir y transcribir"
7. ✓ Selector de modelo aparece antes
8. Seleccionar modelo "small"
9. ✓ Modal de progreso aparece
10. ✓ Transcripción se genera igual que en el flujo de subir

**Resultado Esperado:** ✅ Grabación y transcripción funcionan correctamente

---

### PRUEBA 6: Parámetros de Speakers

**Objetivo:** Verificar que parámetros de speakers se envían correctamente

**Pasos:**
1. Subir un archivo
2. En modal de speakers, marcar "Quiero especificar el rango de hablantes"
3. Cambiar:
   - Mínimo: 2
   - Máximo: 4
4. Confirmar y transcribir
5. ✓ Verificar en consola/network que los parámetros se envíen:
   ```
   POST /transcript/queue?filename=...&model=small&min_speakers=2&max_speakers=4
   ```

**Resultado Esperado:** ✅ Parámetros se envían correctamente

---

### PRUEBA 7: Descargas (TXT y DOCX)

**Objetivo:** Verificar descargas de archivos

**Pasos:**
1. Con una transcripción completada visible
2. Hacer clic en botón de descarga TXT (icono de texto)
3. ✓ Se debe descargar archivo `.txt`
4. ✓ Nombre debe ser correcto (nombre_audio.txt)
5. Hacer clic en botón de descarga DOCX (icono de documento)
6. ✓ Se debe descargar archivo `.docx`
7. ✓ Nombre debe ser correcto (nombre_audio.docx)
8. Abrir archivos y verificar contenido

**Resultado Esperado:** ✅ Ambas descargas funcionan y contenido es correcto

---

### PRUEBA 8: Edición de Transcripción

**Objetivo:** Verificar que se puede editar y guardar

**Pasos:**
1. Con transcripción completada visible
2. Hacer clic en botón "Editar"
3. ✓ Textarea aparece en lugar de texto
4. Cambiar algo del texto
5. Hacer clic en "Guardar"
6. ✓ Modal de confirmación aparece
7. Confirmar guardado
8. ✓ Cambios se guardan en backend
9. Toast notification confirma "Guardado"

**Resultado Esperado:** ✅ Edición y guardado funcionan

---

## 🔧 NOTAS DE DEPURACIÓN

### Error: "404 GET /transcript/queue/info"
**Causa:** El endpoint `/transcript/queue/info` no existe en el backend

**Solución:**
1. Implementa el endpoint en FastAPI
2. Retorna estructura JSON con `queue_size`, `current_task`, `total_processed`
3. Ver sección "REQUISITOS DEL BACKEND" arriba

### Error: "405 POST /transcript/queue"
**Causa:** El endpoint `/transcript/queue` no acepta POST o no existe

**Solución:**
1. Implementa endpoint `POST /transcript/queue` en FastAPI
2. Acepta parámetros: `filename`, `model`, `min_speakers` (opt), `max_speakers` (opt)
3. Retorna `task_id` en respuesta JSON
4. Ver sección "REQUISITOS DEL BACKEND" arriba

### Error: "Error al obtener info de la cola"
**Causa:** Llamada a `getQueueInfo()` falla cada 3 segundos

**Solución:**
1. Abre DevTools (F12)
2. Ve a Network tab
3. Busca requests a `/transcript/queue/info`
4. Verifica el status code (debe ser 200, no 404)
5. Si es 404, implementa el endpoint (ver arriba)

### Error: "No hay transcripción disponible"
**Causa:** El archivo se subió pero la transcripción no se generó

**Solución:**
1. Verifica que `enqueueTranscription()` retorna un `task_id` válido
2. Abre DevTools, Network tab
3. Busca `POST /transcript/queue`
4. Verifica respuesta JSON contiene `task_id`
5. Si no, implementa endpoint correctamente

### El Modal de Progreso No Aparece
**Causa:** La promesa `enqueueTranscription()` no se resuelve correctamente

**Solución:**
1. Abre DevTools, Console
2. Busca errores en rojo
3. Verifica que el endpoint POST `/transcript/queue` retorna 200 OK
4. Verifica estructura JSON de respuesta

### El Progreso Está "Atrapado" en 0%
**Causa:** El endpoint `GET /transcript/status/{task_id}` no actualiza progreso

**Solución:**
1. Verifica que `pollTranscriptionStatus()` se llama cada 2 segundos
2. Abre DevTools, Network tab, filtra por `/transcript/status`
3. Verifica requests se hacen regularmente
4. Verifica respuesta contiene `progress` con número 0-100
5. Si siempre es 0, el backend no está procesando la tarea

### El Audio Se Sube Pero Luego Nada Pasa
**Causa:** El backend no está procesando la cola

**Solución:**
1. Verifica que el backend tiene un sistema de cola implementado
2. Verifica que procesa transcripciones de forma secuencial
3. Implementa polling en el backend que:
   - Lee tareas de la cola
   - Ejecuta Whisper
   - Actualiza estado (pendiente → procesando → completada)
   - Guarda resultado

### CORS Errors
**Error:** "Access to XMLHttpRequest ... blocked by CORS policy"

**Solución:**
En el backend FastAPI, agrega CORS middleware:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN DEL BACKEND

Usa esto para verificar que todo está listo:

- [ ] Endpoint `POST /transcript/queue` implementado
  - [ ] Acepta parámetros: filename, model, min_speakers?, max_speakers?
  - [ ] Retorna `task_id`
  - [ ] Encola la tarea para procesamiento

- [ ] Endpoint `GET /transcript/status/{task_id}` implementado
  - [ ] Retorna status actual (pendiente|procesando|completada|error)
  - [ ] Retorna progress 0-100
  - [ ] Retorna error si status=error

- [ ] Endpoint `GET /transcript/queue/info` implementado
  - [ ] Retorna queue_size
  - [ ] Retorna current_task (con full details)
  - [ ] Retorna total_processed

- [ ] Sistema de cola backend
  - [ ] Procesa transcripciones una a la vez
  - [ ] Mantiene historial de completadas
  - [ ] Guarda transcripciones en lugar accesible

- [ ] Whisper integration
  - [ ] Soporta todos 5 modelos (tiny, base, small, medium, large)
  - [ ] Acepta parámetros min_speakers y max_speakers
  - [ ] Actualiza progreso durante procesamiento

- [ ] CORS configurado
  - [ ] Permite requests desde http://localhost:3000
  - [ ] Permite métodos GET, POST, OPTIONS
  - [ ] Permite headers Content-Type

---

## 🚀 PRÓXIMOS PASOS

1. **Implementa los endpoints del backend** (ver "REQUISITOS DEL BACKEND")
2. **Asegúrate que el backend está corriendo** en `http://127.0.0.1:8000`
3. **Verifica CORS está configurado** correctamente
4. **Ejecuta PRUEBA 1** (Selector de Modelo) - No requiere backend
5. **Ejecuta PRUEBA 2** (Flujo Completo) - Requiere todos los endpoints
6. Si fallan, consulta "NOTAS DE DEPURACIÓN" arriba

---

## 📊 MATRIZ DE COMPATIBILIDAD

| Prueba | Endpoints Requeridos | Puedo Ejecutar Ahora |
|--------|---------------------|---------------------|
| 1: Selector | Ninguno | ✅ Sí |
| 2: Flujo Completo | POST /queue, GET /status, GET /queue/info | ❌ No |
| 3: Múltiples Modelos | POST /queue, GET /status, GET /queue/info | ❌ No |
| 4: Estado de Cola | GET /queue/info | ❌ No |
| 5: Grabar Audio | POST /queue, GET /status | ❌ No |
| 6: Parámetros Speakers | POST /queue, GET /status | ❌ No |
| 7: Descargas | GET /download, POST /download-docx | ❌ No (parcial) |
| 8: Edición | Existentes (no queue) | ✅ Sí |

**Nota:** Las pruebas 2-7 requieren que el backend tenga implementados los endpoints de cola.



### PRUEBA 9: Página de Archivos

**Objetivo:** Verificar visualización de archivos y cola

**Pasos:**
1. Navegar a `/archivos`
2. ✓ Se muestra estado de cola si hay procesos
3. ✓ Se listan todos los audios subidos
4. Hacer clic en "Ver/Editar" de un audio
5. ✓ Se carga su transcripción
6. ✓ Se puede editar igual que en `/subir-audio`
7. ✓ Descargas funcionan
8. Verificar búsqueda por nombre

**Resultado Esperado:** ✅ Página de archivos integrada correctamente

---

### PRUEBA 10: Manejo de Errores

**Objetivo:** Verificar que los errores se muestran correctamente

**Pasos:**
1. Detener el backend
2. Intentar subir un archivo en `/subir-audio`
3. ✓ Debe aparecer error claro en toast
4. ✓ Modal de progreso debe mostrar estado "error" con mensaje
5. Reiniciar backend
6. Reintentar - debe funcionar nuevamente

**Resultado Esperado:** ✅ Errores manejan correctamente

---

## CHECKLIST DE VALIDACIÓN

### Frontend
- [ ] Selector de modelo visible y funcional
- [ ] Modal de progreso con barra 0-100%
- [ ] Polling automático cada 2 segundos
- [ ] Auto-carga de transcripción al completar
- [ ] Modal cierra automáticamente
- [ ] Información de cola en tiempo real
- [ ] Descargas TXT y DOCX funcionan
- [ ] Edición y guardado funcionan
- [ ] Parámetros de speakers se envían
- [ ] Manejo de errores visual

### Network (Verificar en DevTools > Network)
- [ ] POST /transcript/queue devuelve task_id
- [ ] GET /transcript/status/{task_id} devuelve progreso
- [ ] GET /transcript/queue/info devuelve info de cola
- [ ] Polling ocurre cada ~2 segundos
- [ ] Polling se detiene cuando completa o hay error
- [ ] Endpoints antiguos aún funcionan (compatibility)

### Casos Edge
- [ ] Cerrar modal durante transcripción - polling se detiene
- [ ] Navegar a otra página - polling se limpia
- [ ] Múltiples transcripciones simultáneas - solo 1 en proceso
- [ ] Audio muy grande - progreso es gradual
- [ ] Red lenta - progreso sigue actualizando

---

## COMANDOS ÚTILES

```bash
# Terminal 1 - Backend (si está en estructura similar)
cd ../LxT-Back
uvicorn main:app --reload

# Terminal 2 - Frontend
cd LxT-Front
npm run dev
# o
pnpm dev

# Abrir en navegador
http://localhost:3000/subir-audio
```

---

## NOTAS DE DEPURACIÓN

Si algo no funciona:

1. **Abrir DevTools** (F12)
2. **Tab "Console"** - Buscar errores rojo
3. **Tab "Network"** - Verificar que los requests se hacen
4. **Tab "Application > Local Storage"** - Verificar datos persistidos
5. Revisar el archivo [CAMBIOS_TRANSCRIPCION.md](./CAMBIOS_TRANSCRIPCION.md) para entender la arquitectura

---

## PRÓXIMOS PASOS DESPUÉS DE VALIDAR

1. ✅ Si todo funciona: Deploy a producción
2. ✅ Implementar historial de transcripciones por sesión
3. ✅ Agregar estadísticas de velocidad por modelo
4. ✅ Implementar caché local de transcripciones
5. ✅ Agregar botón "Detener" para cancelar transcripciones

---

**Última Actualización:** 14 de Enero, 2026
**Estado:** LISTO PARA PRUEBAS ✅
