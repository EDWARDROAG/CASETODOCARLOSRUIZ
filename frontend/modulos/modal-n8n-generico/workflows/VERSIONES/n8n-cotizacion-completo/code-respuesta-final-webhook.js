/**
 * Nodo: Armar JSON final para Respond to Webhook (tras envíos email/telegram).
 */
const j = $input.first().json;
const sid = String(j._pdfSid || j.ragSessionId || "anon").trim();
const G = $getWorkflowStaticData("global");
const pend = (G.pendingPdf && G.pendingPdf[sid]) || {};
const sess = pend.sess || {};

const por = String(pend.enviarPor || "").toLowerCase();
const envios = [];
if (por === "correo" || por === "ambos") envios.push("correo");
if (por === "telegram" || por === "ambos") envios.push("Telegram");

const extra =
  "\n\n✅ Cotización PDF: se intentó el envío por " +
  (envios.length ? envios.join(" y ") : "los medios elegidos") +
  ". Si no llegó, revisá credenciales SMTP/Telegram en n8n.";

const reply = String(pend.iaReply || j.iaReply || "").trim() + extra;

if (sess.cotizacion) {
  sess.cotizacion.pdfGenerado = true;
  sess.cotizacion.enviado = envios.length > 0;
}
G.sessions = G.sessions || {};
if (G.sessions[sid]) {
  G.sessions[sid].cotizacion = sess.cotizacion || G.sessions[sid].cotizacion;
  G.sessions[sid].step = "FIN_COTIZACION_ENVIADA";
}

return [
  {
    json: {
      ok: true,
      reply,
      suggestedActions: [],
      phase: "chat",
      pasoActual: "FIN_COTIZACION_ENVIADA",
      associateSlug: j.associateSlug || "casetodo-carlos-ruiz",
      channel: j.channel || "web_chat_rag",
      pdfGenerado: true,
      enviado: envios.length > 0,
      envios,
      metadata: {
        ...(j.metadata || {}),
        pasoActual: "FIN_COTIZACION_ENVIADA"
      }
    }
  }
];
