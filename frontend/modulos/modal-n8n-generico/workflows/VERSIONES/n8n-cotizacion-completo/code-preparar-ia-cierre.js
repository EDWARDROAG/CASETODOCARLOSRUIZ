/**
 * Nodo: Preparar prompt IA (cierre comercial)
 * Arma el texto de usuario para el AI Agent (Gemini) sin inventar datos fuera de sess.
 */
const j = $input.first().json;
const sid = String(j.ragSessionId || j.metadata?.ragSessionId || "anon").trim() || "anon";
const G = $getWorkflowStaticData("global");
const pend = (G.pendingPdf && G.pendingPdf[sid]) || {};
const sess = pend.sess || j.sess || {};
const d = sess.data || {};
const de = sess.datosEspecificos || {};
const c = sess.cotizacion || {};

const bloqueCliente = [
  "Nombre: " + (d.nombre || ""),
  "Teléfono: " + (d.telefono || ""),
  "Email: " + (d.email || ""),
  "Ciudad: " + (d.ciudad || ""),
  "Tipo persona: " + (sess.tipoPersona || ""),
  sess.tipoPersona === "empresa"
    ? "Empresa: " + (de.nombreEmpresa || "") + " | NIT: " + (de.nit || "")
    : "Documento: " + (de.documento || ""),
  "Dirección en cotización: " +
    (sess.tipoPersona === "empresa" ? de.direccionEmpresa || "" : de.direccion || ""),
  "Casetón: " + (c.tipoCaseton || ""),
  "Medidas: " + (c.medidas || ""),
  "Precio orientativo sistema (COP): " + String(c.precioCalculado || 0),
  "Envío PDF solicitado por: " + String(pend.enviarPor || c.enviarPor || "")
].join("\n");

const prompt =
  "Con la siguiente información ya validada, redactá el mensaje final al cliente según las reglas del system prompt.\n\n" +
  bloqueCliente;

return [
  {
    json: {
      ...j,
      mensaje: prompt,
      ragSessionId: sid,
      conversation: [],
      _pdfSid: sid,
      associateSlug: j.associateSlug,
      channel: j.channel,
      metadata: j.metadata
    }
  }
];
