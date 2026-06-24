/**
 * Pegar en n8n → nodo Code «Normalizar entrada» (Run once for all items).
 * Fusiona item + body (objeto o JSON en string) para que metadata.pasoActual del modal llegue siempre.
 * Sincronizado con frontend/js/main.js (metadata: pasoActual, nombre, telefono, email, ragSessionId).
 */

const item = $input.first().json;
let body = {};
if (item.body != null) {
  if (typeof item.body === "object" && !Array.isArray(item.body)) {
    body = item.body;
  } else if (typeof item.body === "string") {
    try {
      const p = JSON.parse(item.body);
      if (p && typeof p === "object" && !Array.isArray(p)) body = p;
    } catch (e0) {
      body = {};
    }
  }
}
const src = { ...item, ...body };

function pickMensaje(s) {
  const m1 = s.mensaje;
  if (m1 != null && String(m1).trim()) return String(m1).trim();
  const o = s.mensajeOriginal;
  const t = s.structuredMensaje;
  const parts = [o, t].filter((x) => x != null && String(x).trim());
  if (parts.length) return parts.map((x) => String(x).trim()).join("\n\n");
  const m2 = s.message;
  if (m2 != null && String(m2).trim()) return String(m2).trim();
  const tx = s.text;
  if (tx != null && String(tx).trim()) return String(tx).trim();
  return "";
}

const mensaje = pickMensaje(src);

let conversation = [];
if (Array.isArray(src.conversation)) conversation = src.conversation;

let phase = "chat";
if (src.phase != null && String(src.phase).trim()) phase = String(src.phase).trim();
phase = (phase || "chat").toLowerCase();

const metadata =
  src.metadata && typeof src.metadata === "object" ? src.metadata : {};

const ragSessionId =
  metadata.ragSessionId != null && String(metadata.ragSessionId).trim() !== ""
    ? String(metadata.ragSessionId).trim()
    : "";

const pasoMetaRaw =
  metadata.pasoActual != null && String(metadata.pasoActual).trim() !== ""
    ? String(metadata.pasoActual).trim()
    : "inicio";
const pasoMeta = String(pasoMetaRaw || "inicio").toLowerCase();
const nombreMeta = metadata.nombre != null ? String(metadata.nombre).trim() : "";
const telefonoMeta = metadata.telefono != null ? String(metadata.telefono).trim() : "";
const emailMeta = metadata.email != null ? String(metadata.email).trim() : "";
const requerimientoMeta =
  metadata.requerimiento != null ? String(metadata.requerimiento).trim() : "";

const channel = String(
  src.channel || (phase === "chat" ? "web_chat_rag" : "web_modal_requerimiento")
);

const clientConfirmed = Boolean(src.clientConfirmed ?? false);

const mensajeOriginal =
  src.mensajeOriginal != null ? String(src.mensajeOriginal) : "";
const structuredMensaje =
  src.structuredMensaje != null ? String(src.structuredMensaje) : "";

return [
  {
    json: {
      associateSlug: String(src.associateSlug || "casetodo-carlos-ruiz"),
      channel,
      mensaje,
      mensajeOriginal,
      structuredMensaje,
      mensajeSource: String(src.mensajeSource || "texto"),
      conversation,
      phase,
      metadata,
      ragSessionId,
      clientConfirmed,
      nombre: nombreMeta,
      telefono: telefonoMeta,
      email: emailMeta,
      requerimiento: requerimientoMeta,
      telegramId: "",
      pasoActual: pasoMeta
    }
  }
];
