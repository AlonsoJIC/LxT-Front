# LxT Desktop - Transcripción de Audios

Aplicación de escritorio para transcribir audios, editar, descargar y gestionar transcripciones de manera eficiente. Desarrollada con Electron, React y FastAPI.

## Características

- **Subida de audios**: Soporte para archivos de audio comunes.
- **Transcripción automática**: Procesamiento backend con FastAPI.
- **Edición y gestión**: Modifica, elimina y descarga transcripciones.
- **Interfaz moderna**: UI intuitiva con confirmaciones y notificaciones.
- **Sincronización en tiempo real**: Cambios reflejados instantáneamente.

## Requisitos

- Node.js >= 18
- Python >= 3.10
- FastAPI
- Electron
- React
- Backend corriendo en `http://127.0.0.1:8000`

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/LxT-Front
cd lxt-desktop
```


### 2. Instalar dependencias frontend

Se recomienda usar **pnpm** (preferido) o npm, pero no ambos para evitar conflictos de lockfiles.

```bash
cd LxT-Front
pnpm install
```
o, si prefieres npm:
```bash
npm install
```

### 3. Instalar dependencias backend

```bash
cd ../LxT-Back
pip install -r requirements.txt
```

## Ejecución

### Backend (FastAPI)

```bash
cd LxT-Back
uvicorn main:app --reload
```

### Frontend (Electron + React)

```bash
cd LxT-Front
npm run dev
```

## Uso

1. **Sube un archivo de audio** desde la interfaz.
2. **Transcribe** el audio automáticamente.
3. **Edita, elimina o descarga** la transcripción desde la sección correspondiente.
4. **Gestiona audios** y transcripciones con confirmaciones personalizadas.


## Estructura del Proyecto

```
LxT-Desktop/
├── LxT-Front/      # Electron + React frontend
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── app/
│   ├── hooks/
│   ├── styles/
│   ├── main.js
│   ├── preload.js
│   ├── electron-builder.json
│   ├── electron.package.json
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── ...
├── LxT-Back/       # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── ...
└── README.md
```

## Archivos ignorados por git

El proyecto incluye un `.gitignore` robusto que ignora:

- Archivos de dependencias (`node_modules/`, lockfiles alternativos)
- Archivos temporales y de caché (`.next/`, `.cache/`, `dist/`, `tmp/`, `*.log`, etc.)
- Archivos de sistema y de IDE (`.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`, etc.)
- Archivos de configuración sensibles (`.env*`)
- Archivos de build de Electron (`*.exe`, `*.dmg`, `*.asar`, etc.)

**Recomendación:** Mantén solo un lockfile (preferiblemente `pnpm-lock.yaml`) y elimina los demás (`yarn.lock`, `package-lock.json`).

## Endpoints Backend

### ✅ Endpoints Existentes
- `POST /audio/upload` - Subir audio
- `GET /audio/list` - Listar audios
- `DELETE /audio/{filename}` - Eliminar audio
- `POST /transcript/transcribe` - Transcribir audio
- `GET /transcript/{filename}` - Obtener transcripción
- `PUT /transcript/{filename}` - Editar transcripción
- `DELETE /transcript/{filename}` - Eliminar transcripción
- `GET /transcript/list` - Listar transcripciones
- `GET /transcript/download/{filename}` - Descargar transcripción TXT

### ⚠️ Endpoints Nuevos Requeridos (v2.0)
Para la nueva funcionalidad de cola y múltiples modelos:
- `POST /transcript/queue` - Encolar transcripción
- `GET /transcript/status/{task_id}` - Estado de transcripción
- `GET /transcript/queue/info` - Información de la cola
- `POST /transcript/download-docx` - Descargar en DOCX

**Importante:** Lee [ESPECIFICACION_ENDPOINTS.md](./ESPECIFICACION_ENDPOINTS.md) para detalles exactos de cómo implementarlos.

## 📚 Documentación (v2.0)

### Implementación Completa
- **[IMPLEMENTACION_COMPLETA.md](./IMPLEMENTACION_COMPLETA.md)** - Resumen ejecutivo
- **[CAMBIOS_TRANSCRIPCION.md](./CAMBIOS_TRANSCRIPCION.md)** - Detalle técnico profundo
- **[RESUMEN_VISUAL.md](./RESUMEN_VISUAL.md)** - Diagramas y flujos visuales

### Para Desarrollo
- **[ESPECIFICACION_ENDPOINTS.md](./ESPECIFICACION_ENDPOINTS.md)** - ⚠️ **LEER PRIMERO** - Endpoints que debe implementar el backend
- **[REFERENCIA_RAPIDA.md](./REFERENCIA_RAPIDA.md)** - API reference con ejemplos

### Para Testing
- **[GUIA_PRUEBAS.md](./GUIA_PRUEBAS.md)** - Plan de 10 pruebas completo
- **[MODO_OFFLINE.md](./MODO_OFFLINE.md)** - Cómo testear sin backend (mock server)

---

## ⚠️ IMPORTANTE: Estado del Backend

**El frontend v2.0 está completo y funcional, pero requiere endpoints backend implementados.**

| Endpoint | Status | Documento |
|----------|--------|-----------|
| POST /transcript/queue | ❌ NO IMPLEMENTADO | [Ver spec](./ESPECIFICACION_ENDPOINTS.md#1-post-transcriptqueue) |
| GET /transcript/status/{id} | ❌ NO IMPLEMENTADO | [Ver spec](./ESPECIFICACION_ENDPOINTS.md#2-get-transcriptstatustask_id) |
| GET /transcript/queue/info | ❌ NO IMPLEMENTADO | [Ver spec](./ESPECIFICACION_ENDPOINTS.md#3-get-transcriptqueueinfo) |
| GET /transcript/download/* | ✅ Existente | Mantener como está |

**Próximo paso:** [Leer ESPECIFICACION_ENDPOINTS.md](./ESPECIFICACION_ENDPOINTS.md) para implementar los endpoints faltantes.

---

## Personalización

- Modales de confirmación para todas las acciones importantes.
- Notificaciones de éxito/error.
- UI adaptable y moderna.

## Contribuir

1. Haz un fork del repositorio.
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`).
3. Realiza tus cambios y haz commit.
4. Envía un pull request.

## Licencia

MIT
