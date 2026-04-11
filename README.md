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

## Docker (solo backend)
1. En `backend/` crear `.env` desde `.env.example`
2. `docker compose up -d --build`
3. Probar `GET /api/health`
