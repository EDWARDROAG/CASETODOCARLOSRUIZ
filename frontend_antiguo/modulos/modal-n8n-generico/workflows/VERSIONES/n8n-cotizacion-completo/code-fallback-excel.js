/**
 * Nodo: Fallback Excel (precios embebidos; sustituir por Google Sheets si preferís)
 * Si la IA falló, genera mensaje funcional con precio recalculado desde tabla fija.
 */
const j = $input.first().json;
const sid = String(j._pdfSid || j.ragSessionId || "anon").trim();
const G = $getWorkflowStaticData("global");
const pend = (G.pendingPdf && G.pendingPdf[sid]) || {};
const sess = pend.sess || {};
const d = sess.data || {};
const de = sess.datosEspecificos || {};
const c = sess.cotizacion || {};

const PRECIOS_M2 = { Incopor: 45000, Guadua: 38000 };
const largo = Number(c.largo) || 0;
const ancho = Number(c.ancho) || 0;
const m2 = largo * ancho;
const pu = PRECIOS_M2[c.tipoCaseton] || PRECIOS_M2.Incopor;
const total = m2 * pu;

const nom = d.nombre ? d.nombre : "cliente";
const msg =
  "Hola " +
  nom +
  ", gracias por los datos. El sistema calculó un valor orientativo de **" +
  Math.round(total).toLocaleString("es-CO") +
  " COP** para casetón " +
  (c.tipoCaseton || "") +
  " (" +
  m2.toFixed(2) +
  " m²). " +
  "Un asesor validará el detalle y disponibilidad. " +
  "Vas a recibir el PDF de la cotización por el medio que elegiste (" +
  String(pend.enviarPor || "") +
  "). Casetodo Carlos Ruiz.";

pend.iaReply = msg;
pend.iaFuente = "excel_fallback";
G.pendingPdf[sid] = pend;

return [{ json: { ...j, iaReply: msg, iaFuente: "excel_fallback", iaFallo: false, ragSessionId: sid } }];
