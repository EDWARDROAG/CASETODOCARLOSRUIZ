/**
 * Nodo: Code medidas casetón
 * ASK_TIPO_CASETON → ASK_MEDIDAS (largo x ancho x alto opcional) → ASK_CONFIRMAR_ENVIO
 * Calcula precio orientativo (m²) y opcionalmente dispara pipeline PDF.
 */
const G = $getWorkflowStaticData("global");
G.sessions = G.sessions || {};
const j = $input.first().json;
const sid = String(j.ragSessionId || j.metadata?.ragSessionId || "anon").trim() || "anon";
let sess = G.sessions[sid] || j.sess;
if (!sess) {
  return [{ json: { ...j, reply: "Sesión no encontrada. Abrí de nuevo el asistente.", runPdfPipeline: false } }];
}

const STEPS = new Set(["ASK_TIPO_CASETON", "ASK_MEDIDAS", "ASK_CONFIRMAR_ENVIO"]);
if (!STEPS.has(sess.step)) {
  return [{ json: { ...j, sess, runPdfPipeline: false } }];
}

const PRECIOS_M2 = { Incopor: 45000, Guadua: 38000 };
const raw = String(j.mensaje || "").trim();
const low = raw.toLowerCase();
const c = sess.cotizacion || (sess.cotizacion = {});
let reply = "";
let suggestedActions = [];
let runPdfPipeline = false;

function parseMedidas(text) {
  const t = text.replace(/,/g, ".").replace(/\s+/g, " ");
  const mul = t.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)(?:\s*[x×]\s*(\d+(?:\.\d+)?))?/i);
  if (!mul) return null;
  const largo = parseFloat(mul[1]);
  const ancho = parseFloat(mul[2]);
  const alto = mul[3] != null ? parseFloat(mul[3]) : 2.5;
  if (!(largo > 0 && ancho > 0)) return null;
  return { largo, ancho, altura: alto > 0 ? alto : 2.5 };
}

function fmtCop(n) {
  return Math.round(n).toLocaleString("es-CO");
}

if (sess.step === "ASK_TIPO_CASETON") {
  if (/guadua/i.test(raw)) {
    c.tipoCaseton = "Guadua";
  } else if (/incopor|incop/i.test(raw)) {
    c.tipoCaseton = "Incopor";
  }
  if (!c.tipoCaseton) {
    reply = "Elegí **Incopor** o **Guadua** (podés usar los botones).";
    suggestedActions = [
      { type: "reply", title: "Incopor", value: "Incopor" },
      { type: "reply", title: "Guadua", value: "Guadua" }
    ];
  } else {
    sess.step = "ASK_MEDIDAS";
    reply =
      "Indicá las medidas en metros: **largo × ancho × alto** (ejemplo: 4 x 3 x 2.5). Si no indicás alto, usamos 2,5 m estándar.";
  }
} else if (sess.step === "ASK_MEDIDAS") {
  const dims = parseMedidas(raw);
  if (!dims) {
    reply = "No pude leer las medidas. Usá el formato largo × ancho × alto en metros (ej: 4 x 3 x 2.5).";
  } else {
    c.largo = dims.largo;
    c.ancho = dims.ancho;
    c.altura = dims.altura;
    c.medidas = dims.largo + " × " + dims.ancho + " × " + dims.altura + " m";
    const m2 = dims.largo * dims.ancho;
    const pu = PRECIOS_M2[c.tipoCaseton] || PRECIOS_M2.Incopor;
    c.precioUnitarioM2 = pu;
    c.precioCalculado = m2 * pu;
    sess.step = "ASK_CONFIRMAR_ENVIO";
    reply =
      "Precio orientativo (solo casetón, " +
      m2.toFixed(2) +
      " m² a " +
      fmtCop(pu) +
      " COP/m²): **" +
      fmtCop(c.precioCalculado) +
      " COP** (sujeto a validación comercial). ¿Cómo querés recibir el PDF de la cotización?";
    suggestedActions = [
      { type: "reply", title: "Correo", value: "Correo" },
      { type: "reply", title: "Telegram", value: "Telegram" },
      { type: "reply", title: "Ambos", value: "Ambos" }
    ];
  }
} else if (sess.step === "ASK_CONFIRMAR_ENVIO") {
  let por = null;
  if (/ambos/i.test(raw)) por = "ambos";
  else if (/telegram/i.test(raw)) por = "telegram";
  else if (/correo|mail|email/i.test(raw)) por = "correo";
  if (!por) {
    reply = "Elegí **Correo**, **Telegram** o **Ambos** para el envío del PDF.";
    suggestedActions = [
      { type: "reply", title: "Correo", value: "Correo" },
      { type: "reply", title: "Telegram", value: "Telegram" },
      { type: "reply", title: "Ambos", value: "Ambos" }
    ];
  } else {
    c.enviarPor = por;
    sess.step = "GENERANDO_COTIZACION";
    runPdfPipeline = true;
    reply =
      "Listo, generamos tu PDF y te avisamos en este mismo mensaje cuando quede enviado. Un momento…";

    const ts = Date.now();
    const fname = "cotizacion_" + sid + "_" + ts + ".pdf";
    G.pendingPdf = G.pendingPdf || {};
    G.pendingPdf[sid] = {
      fileName: fname,
      associateSlug: j.associateSlug,
      channel: j.channel,
      sess: JSON.parse(JSON.stringify(sess)),
      clienteEmail: sess.data?.email || "",
      clienteNombre: sess.data?.nombre || "",
      enviarPor: por,
      iaReply: "",
      precioTotal: c.precioCalculado,
      precioUnitarioM2: c.precioUnitarioM2
    };
  }
}

G.sessions[sid] = sess;
return [
  {
    json: {
      ...j,
      sess,
      reply,
      suggestedActions,
      runPdfPipeline,
      pasoActual: sess.step,
      metadata: { ...(j.metadata || {}), pasoActual: sess.step }
    }
  }
];
