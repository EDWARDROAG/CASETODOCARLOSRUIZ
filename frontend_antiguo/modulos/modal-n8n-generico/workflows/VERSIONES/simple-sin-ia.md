# Simple sin IA (historial)

Origen: `frontend/n8n-simple-sin-ia/`

## Flujo
1. INIT -> pide nombre.
2. ASK_NAME -> pide WhatsApp.
3. ASK_PHONE -> pide email.
4. ASK_EMAIL -> pide peticion.
5. ASK_PETICION -> confirma.
6. ASK_CONFIRMAR -> medio (gmail/telegram/ambos).
7. ASK_MEDIO -> finaliza y dispara envios.

## Endpoint historico
- Path: `casetodo-simple`

## Estado
- Version historica del mismo modal.
- No usar como workflow activo si el modulo ya tiene otro flujo productivo.

