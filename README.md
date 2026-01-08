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

```bash
cd LxT-Front
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
│   └── ...
├── LxT-Back/       # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── ...
└── README.md
```

## Endpoints Backend

- `POST /audio/upload` - Subir audio
- `GET /audio/list` - Listar audios
- `DELETE /audio/{filename}` - Eliminar audio
- `POST /transcript/transcribe` - Transcribir audio
- `GET /transcript/{filename}` - Obtener transcripción
- `PUT /transcript/{filename}` - Editar transcripción
- `DELETE /transcript/{filename}` - Eliminar transcripción
- `GET /transcript/list` - Listar transcripciones
- `GET /transcript/download/{filename}` - Descargar transcripción

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
