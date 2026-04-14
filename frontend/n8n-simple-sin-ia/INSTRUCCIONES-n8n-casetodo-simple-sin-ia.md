# Casetodo — Workflow simple sin IA (producción rápida)

## Entregable principal

- `frontend/n8n-workflow-casetodo-simple-sin-ia.json`

Este flujo **no usa IA**. Maneja conversación con máquina de estados en un nodo Code y envía cotización de prueba por Gmail y/o Telegram según el medio elegido.

## Flujo conversacional implementado

1. `INIT` → pregunta nombre.
2. `ASK_NAME` → pregunta WhatsApp.
3. `ASK_PHONE` → pregunta email (añadido para que Gmail funcione de forma real).
4. `ASK_EMAIL` → pregunta petición.
5. `ASK_PETICION` → confirma sí/no.
6. `ASK_CONFIRMAR` → pregunta medio: gmail / telegram / ambos.
7. `ASK_MEDIO` → marca `done=true`, arma cotización de prueba y dispara envíos.
8. `DONE` → sugiere escribir “hola” para reiniciar.

Sesiones: `$getWorkflowStaticData('global').sessions[ragSessionId]`.

## Importar en n8n (Magnus)

1. Ir a **Workflows → Import from file**.
2. Importar `frontend/n8n-workflow-casetodo-simple-sin-ia.json`.
3. En nodo `Gmail cotizacion prueba`, asignar credencial Gmail OAuth2 (en este repo: `Gmail account`).
4. Verificar credencial de Telegram en `Telegram resumen cotizacion`.
5. Activar workflow.

## Variables recomendadas

- `TELEGRAM_CHAT_ID_EQUIPO` (chat interno donde quieres recibir el resumen Telegram)

## Endpoint

- Webhook path: `casetodo-simple`
- URL típica: `https://<tu-dominio-n8n>/webhook/casetodo-simple`

## Respuesta JSON al frontend

Siempre responde con:

- `reply`
- `done`
- `sessionId`
- `suggestedActions` (siempre `[]`, sin botones)
- `pasoActual`
- `metadata`

## Prueba mínima esperada (correo)

1. `POST` con:

```json
{
  "mensaje": "hola",
  "ragSessionId": "test123"
}
```

2. Seguir conversación completa usando el mismo `ragSessionId`:
   - Nombre
   - WhatsApp
   - Email válido
   - Petición
   - “sí”
   - “gmail”

3. Verificar llegada del correo con asunto:
   - `Cotización Casetodo - COT-XXXXXX`

## Regenerar JSON si editas el Code

```bash
node scripts/build-n8n-casetodo-simple-sin-ia.mjs
```
