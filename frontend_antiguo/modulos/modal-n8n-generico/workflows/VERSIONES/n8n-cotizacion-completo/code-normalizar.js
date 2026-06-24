/**
 * Nodo: Normalizar entrada (cotización completa)
 * Normaliza body JSON del Webhook y expone metadata + ragSessionId.
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

const channel = String(
  src.channel || (phase === "chat" ? "web_chat_rag" : "web_modal_requerimiento")
);

return [
  {
    json: {
      associateSlug: String(src.associateSlug || "casetodo-carlos-ruiz"),
      channel,
      mensaje,
      conversation,
      phase,
      metadata,
      ragSessionId,
      mensajeSource: String(src.mensajeSource || "texto")
    }
  }
];
