
# CASETODO CARLOS RUIZ — Copia independiente (Ideas HTML)

La **plantilla** se mantiene en `soluciones-lamakinet-app/associates/casetodo-carlos-ruiz/`.
Esta carpeta es la que usa el equipo día a día. Sincronización: `CONFIGURACION-INDEPENDIENTE.txt`.

## Estructura
- `frontend-angular/`: sitio público Angular (despliegue en GitHub Pages)
- `frontend/`: sitio estático legacy (referencia)
- `backend/`: API propia del asociado (desarrollo local; no se despliega en Pages por ahora)

## Arranque rápido (sitio + n8n)
1. Copiar `.env.example` a `.env` y definir `N8N_WEBHOOK_URL`
2. `npm install` y `npm run dev`
3. Abrir `http://127.0.0.1:5508/` (Angular) o `npm run dev:legacy` para el sitio estático anterior

## Puertos (desarrollo local)

| Servicio | Puerto | Comando |
|----------|--------|---------|
| Frontend Angular | **5508** | `npm run dev:angular` (desde la raíz) o `npm start` en `frontend-angular/` |
| Backend API | **3008** | `npm run dev:backend` (desde la raíz) o `npm run dev` en `backend/` |
| Sitio estático legacy | **5508** | `npm run dev` (usa `dev-server.mjs`; no correr junto con Angular en el mismo puerto) |

## Flujo n8n (chat del modal → equipo)

El modal del sitio (`frontend/js/main.js`) envía **POST JSON** al webhook con `phase: "structure"` (ordenar mensaje) y luego `phase: "submit"` (confirmación del cliente).

En `frontend/` hay workflows exportables para **importar en n8n**:

| Archivo | Uso |
|--------|-----|
| `n8n-workflow-casetodo-lead-modal.json` | Solo borrador + respuesta (sin correos). |
| `n8n-workflow-casetodo-lead-modal-gemini.json` | Borrador con **Gemini** en `structure`; `submit` mock. |
| `n8n-workflow-casetodo-lead-modal-con-notificaciones.json` | **Gmail** + Telegram en `submit`. |
| `n8n-workflow-casetodo-lead-modal-gmail-calendar.json` | **Gmail** al equipo + **evento en Google Calendar** (seguimiento) + **Gmail** al cliente si dejó email. |

**Misma ruta de webhook** `casetodo-lead-modal` en varios archivos: en n8n debe estar **activo un solo workflow** con esa ruta, o cambia el path en el nodo Webhook y actualiza `N8N_WEBHOOK_URL` en `.env`.

Para **Gmail + Calendar**: crea credenciales OAuth2 en n8n (Gmail y Google Calendar), importa `n8n-workflow-casetodo-lead-modal-gmail-calendar.json`, asigna credenciales a los nodos, ajusta `sendTo` del correo al equipo y el calendario destino. El evento usa por defecto **mañana 10:00–10:30** (lógica en el nodo *Preparar envío equipo*); cámbiala si necesitas otra ventana u huso horario.

### GitHub Pages — despliegue automático (Angular)

**URL pública:** https://edwardroag.github.io/CASETODOCARLOSRUIZ/

Cada **push a `main`** ejecuta el workflow `.github/workflows/deploy-frontend-pages.yml`, que:

1. Instala dependencias en `frontend-angular/`
2. Compila con `npm run build:github-pages` (`baseHref: /CASETODOCARLOSRUIZ/`)
3. Publica el artefacto en GitHub Pages

**Configuración única en GitHub (si aún no está hecha):**

1. Repo → **Settings** → **Pages**
2. **Build and deployment** → **Source:** `GitHub Actions`
3. Hacer push a `main` o ejecutar el workflow manualmente en **Actions** → *Deploy frontend (GitHub Pages)* → **Run workflow**

**Desarrollo local del front:**

```bash
cd frontend-angular
npm install
npm start
```

**Build igual al de producción (Pages):**

```bash
cd frontend-angular
npm run build:github-pages
```

**Asistente Alexa (n8n) en producción:** las URLs van en `frontend-angular/src/environments/environment.prod.ts`. Desde `github.io` el navegador llama directo a n8n; si hay error CORS, habilitar el origen `https://edwardroag.github.io` en el proxy de n8n o usar el Worker `cloudflare-worker-rag-cors-proxy.js`.

**Nota:** el backend (`puerto 3008`) no se despliega con este workflow; solo el frontend visual. Cuando migren a hosting propio, se añadirá un pipeline aparte.

## Docker (solo backend)
1. En `backend/` crear `.env` desde `.env.example`
2. `docker compose up -d --build`
3. Probar `GET /api/health`
=======

