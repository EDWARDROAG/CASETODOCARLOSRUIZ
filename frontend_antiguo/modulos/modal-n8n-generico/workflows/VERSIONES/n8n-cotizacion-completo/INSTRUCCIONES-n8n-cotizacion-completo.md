# Casetodo Carlos Ruiz — Workflow n8n «Cotización completa»

Este paquete amplía el flujo tipo `n8n-workflow-casetodo-web-chat-openai-cotizador.json` (gestor por sesión + respuesta JSON) con: persona natural/empresa, Gemini para cierre, fallback con precios tipo Excel, HTML → PDF (Gotenberg), envío SMTP y Telegram, y `suggestedActions` en el JSON.

## Archivos

| Archivo | Uso |
|--------|-----|
| `../n8n-workflow-casetodo-cotizacion-completo.json` | Workflow generado (importar en n8n). Se regenera con `node scripts/build-n8n-cotizacion-completo.mjs`. |
| `plantilla-cotizacion.html` | Referencia visual del PDF (el HTML final lo arma el nodo **Code generar HTML**). |
| `code-*.js` | Código fuente de cada nodo Code (editar aquí y volver a ejecutar el script de build). |

## 1. Importar el workflow

1. En n8n: **Workflows → Import from File**.
2. Elegí `frontend/n8n-workflow-casetodo-cotizacion-completo.json`.
3. Abrí el workflow y revisá que no haya nodos en rojo por versión (ajustá typeVersion si tu instancia lo pide).

**Webhook de producción:** path configurado `casetodo-cotizacion-completo` (POST). La URL será  
`https://<tu-n8n>/webhook/casetodo-cotizacion-completo`  
(o el prefijo que use Magnus). Cambiá el path en el nodo Webhook si necesitás otro.

**responseMode:** `responseNode` (se mantiene el patrón del workflow base).

## 2. Credenciales

En cada nodo marcado, asigná credenciales reales (reemplazá los placeholders `__REEMPLAZAR_*__` del JSON o desde la UI):

- **Google Gemini Chat Model** — API Gemini (PaLM) ya usada en el proyecto.
- **Enviar email SMTP PDF** — cuenta SMTP (nombre sugerido: *Email Casetodo SMTP*).
- **Telegram enviar documento PDF** — bot Telegram (*Telegram Casetodo*).

## 3. Variables de entorno (recomendado en el host n8n)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `GOTENBERG_URL` | `http://gotenberg:3000` | URL base de [Gotenberg](https://gotenberg.dev/) (sin barra final o con barra; el workflow la normaliza). |
| `SMTP_FROM` | `cotizaciones@tudominio.com` | Remitente del correo con PDF. |
| `TELEGRAM_CHAT_ID_COTIZACIONES` | `-1001234567890` o `8251345831` | Chat o usuario que recibirá el documento. |

Gotenberg mínimo (Docker):

```bash
docker run --rm -p 3000:3000 gotenberg/gotenberg:8
```

Luego `GOTENBERG_URL=http://host.docker.internal:3000` o la IP que corresponda desde el contenedor de n8n.

## 4. Excel / Google Sheets (fallback de precios)

El nodo **Code fallback Excel** trae **precios fijos** (Incopor 45.000 COP/m², Guadua 38.000 COP/m²) como tabla mínima. Para producción con hoja:

1. Agregá un nodo **Google Sheets** antes del fallback (o sustituí el Code) que lea `producto | unidad | precio | moneda`.
2. Pasá el resultado al Code de fallback como `rows` en `json` y calculá `precio_total = largo * ancho * precio_m2`.

La fórmula de área en el gestor es **largo × ancho** (m²); altura por defecto 2,5 m solo orientativa en el texto.

## 5. Activar en producción

1. Guardá el workflow.
2. **Activate** el workflow.
3. Probá con `curl` o desde el front (`phase: chat`, `mensaje`, `metadata.ragSessionId` estable por sesión).

## 6. Contrato JSON con el frontend

Entrada típica (chat):

```json
{
  "phase": "chat",
  "mensaje": "Texto del usuario o valor del botón",
  "associateSlug": "casetodo-carlos-ruiz",
  "channel": "web_chat_rag",
  "metadata": { "ragSessionId": "uuid-fijo-por-modal" },
  "conversation": []
}
```

Salida:

- `reply` — texto para el usuario.
- `suggestedActions` — array `{ type, title, value }` para botones en web (misma semántica que Telegram inline en cuanto al **texto** enviado al webhook).
- `pasoActual` — paso interno del gestor.
- Tras PDF: `pdfGenerado`, `enviado`, `envios`.

**Telegram:** el PDF se envía como **documento** (`sendDocument`), no como foto.

## 7. Ejemplo de conversación (prueba manual)

1. (nuevo `ragSessionId`) → *«Hola»* → bot pide nombre.  
2. *«Laura Gómez»* → pide teléfono.  
3. *«3001234567»* → pide email.  
4. *«laura@ejemplo.com»* → pide ciudad.  
5. *«Medellín»* → pregunta si cotizar → *«Sí»* o botón **Sí, cotizar**.  
6. *«Persona Natural»* → documento → *«1234567890»* → dirección → *«Calle 10 #20-30»*.  
7. *«Incopor»* → medidas → *«4 x 3 x 2.5»* → elige *«Ambos»* para envío.  
8. El workflow genera PDF, correo y Telegram (si están bien las credenciales) y responde con confirmación.

## 8. Regenerar el JSON del workflow

Desde la raíz del repo:

```bash
node scripts/build-n8n-cotizacion-completo.mjs
```

## 9. Notas técnicas

- Sesiones: `$getWorkflowStaticData('global').sessions[ragSessionId]` y `pendingPdf` para cruzar el **AI Agent** (el agente no devuelve el `sess` completo).
- **IF IA falló:** usa `iaFallo` generado en **Code post IA detectar**; si es true, **Code fallback Excel** sobrescribe el mensaje y se unifica en **Code generar HTML**.
- El nodo HTTP **no** es «HTML to PDF nativo» de un solo clic: n8n convierte HTML a PDF vía **Gotenberg** (estándar en self-hosted). Si Magnus ofrece otro servicio PDF, sustituí ese nodo por el conector correspondiente.

## 10. Criterios de aceptación (checklist)

- [ ] Misma sesión con `metadata.ragSessionId` estable en el front.
- [ ] Persona natural vs empresa con campos distintos.
- [ ] Botones: el front debe enviar `mensaje` igual al `value` de `suggestedActions` (como ya hace el chat Casetodo).
- [ ] Gemini con tono cálido; si falla, mensaje fallback con cifras.
- [ ] PDF con datos del cliente y tabla de ítems.
- [ ] SMTP y Telegram con adjunto (binario `data` tras Gotenberg).
- [ ] Respuesta final HTTP 200 con `reply` de confirmación.

Si al importar un nodo SMTP o HTTP muestra parámetros distintos, abrí el nodo en la UI de tu versión de n8n y mapeá de nuevo adjuntos/binario según la documentación oficial de esa versión.
