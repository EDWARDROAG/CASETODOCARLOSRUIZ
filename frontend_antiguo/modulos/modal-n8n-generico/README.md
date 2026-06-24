# Modulo generico modal n8n

Este modulo centraliza el modal web + configuracion + workflows para reutilizarlo en otros proyectos.

## Objetivo
- Entregar una carpeta portable para integraciones web con n8n.
- Mantener un unico workflow activo por comportamiento.
- Guardar el resto como versiones historicas del mismo modal.

## Estructura
- `config/`: configuracion del webhook para navegador.
- `workflows/ACTIVO/`: unico workflow que debe estar en uso.
- `workflows/VERSIONES/`: versiones historicas del mismo modal.
- `docs/`: guias de instalacion y compatibilidad.

## Regla operativa
- Solo un flujo en `ACTIVO`.
- Si nace otro comportamiento distinto, crear otro modulo hermano (ejemplo: `modal-n8n-cotizador-avanzado`) y repetir la misma estructura.

## Integracion segura sin romper
1. Importar solo el workflow de `ACTIVO`.
2. Validar URL de `config/n8n-webhook.config.js` en produccion.
3. Mantener sincronia de configuracion en los puntos de publicacion (raiz y frontend cuando aplique).

