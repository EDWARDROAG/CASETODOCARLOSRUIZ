
# CASETODO CARLOS RUIZ — Copia independiente (Ideas HTML)

La **plantilla** se mantiene en `soluciones-lamakinet-app/associates/casetodo-carlos-ruiz/`.
Esta carpeta es la que usa el equipo día a día. Sincronización: `CONFIGURACION-INDEPENDIENTE.txt`.

## Estructura
- `frontend/`: sitio público del asociado
- `backend/`: API propia del asociado (opcional)
- Raíz: `dev-server.mjs` + `npm run dev` para web + proxy n8n

## Arranque rápido (sitio + n8n)
1. Copiar `.env.example` a `.env` y definir `N8N_WEBHOOK_URL`
2. `npm install` y `npm run dev`
3. Abrir `http://127.0.0.1:8080/`

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

### GitHub Pages (`https://edwardroag.github.io/CASETODOCARLOSRUIZ/`)

1. El `index.html` de la raíz carga `frontend/n8n-webhook.config.js` (rutas corregidas para que no fallen con 404).
2. Abrí `frontend/n8n-webhook.config.js` y pegá en **`N8N_WEBHOOK_URL_PRODUCTION`** la URL **https://…** del webhook de n8n (misma que podés tener en `.env` para local). Sin eso, en GitHub Pages el asistente no puede llamar a `/api/n8n-lead`.
3. En n8n, permití **CORS** para el origen `https://edwardroag.github.io` si tu instancia lo exige (o usá un proxy bajo tu dominio).

## Docker (solo backend)
1. En `backend/` crear `.env` desde `.env.example`
2. `docker compose up -d --build`
3. Probar `GET /api/health`
=======

