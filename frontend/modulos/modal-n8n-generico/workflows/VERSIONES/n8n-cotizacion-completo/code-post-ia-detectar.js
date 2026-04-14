/**
 * Nodo: Post AI Agent — extrae texto y marca si hubo fallo (para IF + fallback Excel).
 * El AI Agent devuelve el JSON en el item actual; el contexto previo viene del nodo «Preparar IA cierre».
 */
const agent = $input.first().json;
let prev = {};
try {
  prev = $("Preparar IA cierre").first().json;
} catch (e) {
  prev = {};
}
const sid = String(
  prev._pdfSid || prev.ragSessionId || agent._pdfSid || agent.ragSessionId || "anon"
).trim();

function extractAgentText(o) {
  if (!o || typeof o !== "object") return "";
  if (o.error && !o.output) return "";
  if (typeof o.output === "string" && o.output.trim()) return o.output.trim();
  if (typeof o.text === "string" && o.text.trim()) return o.text.trim();
  if (o.json && typeof o.json === "object" && typeof o.json.output === "string") {
    return String(o.json.output).trim();
  }
  const c = o.choices?.[0]?.message?.content;
  if (typeof c === "string") return c.trim();
  return "";
}

const texto = extractAgentText(agent);
const iaFallo = !texto || Boolean(agent.error);

const G = $getWorkflowStaticData("global");
const pend = (G.pendingPdf && G.pendingPdf[sid]) || {};
if (texto) pend.iaReply = texto;
pend.iaFallo = iaFallo;
G.pendingPdf = G.pendingPdf || {};
G.pendingPdf[sid] = pend;

return [
  {
    json: {
      ...prev,
      ...agent,
      iaReply: texto,
      iaFallo,
      ragSessionId: sid,
      _pdfSid: sid
    }
  }
];
