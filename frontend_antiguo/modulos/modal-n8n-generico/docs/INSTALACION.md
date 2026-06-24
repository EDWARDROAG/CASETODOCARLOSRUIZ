# Instalacion del modulo generico

## Uso en cualquier sitio web
1. Copiar la carpeta `modal-n8n-generico` dentro del proyecto destino.
2. Importar en n8n el flujo activo definido en `workflows/ACTIVO/`.
3. Ajustar URLs en `config/n8n-webhook.config.js` (produccion y local).
4. Incluir la configuracion antes del script del modal en el HTML host.

## Nota de compatibilidad en este repo
Para no romper el flujo actual, el proyecto sigue usando sus rutas vigentes de frontend.
Esta carpeta ya queda como modulo base reusable y como fuente de verdad para versionado de workflows.

## Checklist de entrega a terceros
- [ ] URL de webhook en produccion correcta.
- [ ] No credenciales embebidas en JSON.
- [ ] Solo un workflow en `ACTIVO`.
- [ ] Versiones previas en `VERSIONES`.

