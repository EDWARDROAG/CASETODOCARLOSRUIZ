
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

### GitHub Pages + dominio `casetodocarlosruiz.com.co`

**URL principal:** https://casetodocarlosruiz.com.co  
**Respaldo (GitHub):** https://edwardroag.github.io/CASETODOCARLOSRUIZ/

Cada **push a `main`** despliega el Angular con `baseHref: /` y el archivo `CNAME` incluido en el build.

#### 1. DNS en tu registrador (.com.co)

En el panel del dominio que compraste, crea estos registros:

| Tipo | Nombre / Host | Valor | TTL |
|------|----------------|-------|-----|
| **A** | `@` (raíz / casetodocarlosruiz.com.co) | `185.199.108.153` | 3600 |
| **A** | `@` | `185.199.109.153` | 3600 |
| **A** | `@` | `185.199.110.153` | 3600 |
| **A** | `@` | `185.199.111.153` | 3600 |
| **CNAME** | `www` | `edwardroag.github.io` | 3600 |

(IPs oficiales de [GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain).)

La propagación DNS puede tardar **15 minutos a 48 horas**.

#### 2. GitHub (una sola vez)

1. Repo **CASETODOCARLOSRUIZ** → **Settings** → **Pages**
2. **Build and deployment** → **Source:** `GitHub Actions`
3. En **Custom domain** escribe: `casetodocarlosruiz.com.co` → **Save**
4. Cuando DNS esté bien, activa **Enforce HTTPS**
5. (Opcional) Añade también `www.casetodocarlosruiz.com.co` si tu registrador lo permite en GitHub

#### 3. Desplegar cambios

```bash
git push origin main
```

O en **Actions** → *Deploy frontend (GitHub Pages)* → **Run workflow**.

#### Asistente Alexa (CORS)

En producción el chat llama a n8n desde `casetodocarlosruiz.com.co`. Si falla por CORS, en Magnus/n8n deben permitir el origen:

- `https://casetodocarlosruiz.com.co`
- `https://www.casetodocarlosruiz.com.co`

O desplegar de nuevo el Worker `cloudflare-worker-rag-cors-proxy.js` (ya acepta esos orígenes).

## Docker (solo backend)
1. En `backend/` crear `.env` desde `.env.example`
2. `docker compose up -d --build`
3. Probar `GET /api/health`
=======

