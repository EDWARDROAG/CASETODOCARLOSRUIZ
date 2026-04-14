# Versiones registradas del mismo modal

## Version 1: simple sin IA
- Fuente: `frontend/n8n-simple-sin-ia/`
- Descripcion: maquina de estados conversacional, envio por gmail/telegram.

## Version 2: cotizacion completa
- Fuente: `frontend/modulos/modal-n8n-generico/workflows/VERSIONES/n8n-cotizacion-completo/`
- Descripcion: tipo persona, IA de cierre, fallback excel, PDF, SMTP y Telegram.

## Version 3: web chat OpenAI cotizador
- Fuente: `frontend/modulos/modal-n8n-generico/workflows/VERSIONES/n8n-workflow-casetodo-web-openai-cotizador.json`
- Descripcion: chat OpenAI con deteccion de intencion de cotizar y avisos por Telegram/Gmail.

## Regla
Ninguna de estas versiones debe activarse en paralelo con el flujo activo si comparte el mismo path de webhook.

