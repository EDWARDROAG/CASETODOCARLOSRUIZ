/**
 * Nodo: Code fase contacto
 * Pasos: ASK_NOMBRE → ASK_TEL → ASK_EMAIL → ASK_CIUDAD → ASK_QUOTE_CONFIRM
 * Persistencia: $getWorkflowStaticData('global').sessions[sessionId]
 */
const G = $getWorkflowStaticData("global");
G.sessions = G.sessions || {};
const j = $input.first().json;
const sid = String(j.ragSessionId || j.metadata?.ragSessionId || "anon").trim() || "anon";

function defaultSess() {
  return {
    step: "ASK_NOMBRE",
    phase: "chat",
    data: { nombre: "", telefono: "", email: "", ciudad: "" },
    tipoPersona: null,
    datosEspecificos: {},
    cotizacion: {
      tipoCaseton: null,
      medidas: "",
      largo: null,
      ancho: null,
      altura: 2.5,
      precioCalculado: 0,
      precioUnitarioM2: 0,
      pdfGenerado: false,
      enviado: false,
      enviarPor: null
    },
    quoteConfirmed: false
  };
}

let sess = G.sessions[sid];
if (!sess || typeof sess !== "object") {
  sess = defaultSess();
  G.sessions[sid] = sess;
}

const STEPS = new Set([
  "ASK_NOMBRE",
  "ASK_TEL",
  "ASK_EMAIL",
  "ASK_CIUDAD",
  "ASK_QUOTE_CONFIRM"
]);

if (!STEPS.has(sess.step)) {
  return [{ json: { ...j, sess, runPdfPipeline: false } }];
}

const raw = String(j.mensaje || "").trim();
const d = sess.data || (sess.data = {});

function soloDigitos(s) {
  return String(s || "")
    .split("")
    .filter((c) => "0123456789".indexOf(c) !== -1)
    .join("");
}

function pareceTelefono(msg) {
  const dig = soloDigitos(msg);
  return dig.length >= 10 && dig.length <= 13;
}

function pareceEmail(msg) {
  const t = String(msg || "").trim();
  return t.indexOf("@") > 0 && t.indexOf(".") > t.indexOf("@");
}

function salirSinCambioPaso(msg) {
  return [{ json: { ...j, sess, reply: msg, suggestedActions: [], runPdfPipeline: false } }];
}

let reply = "";
let suggestedActions = [];
let runPdfPipeline = false;

if (sess.step === "ASK_NOMBRE") {
  if (!raw) {
    reply = "¡Hola! Soy el asistente de Casetodo Carlos Ruiz. ¿Cómo te llamás?";
  } else {
    d.nombre = raw;
    sess.step = "ASK_TEL";
    reply = "Gracias, " + d.nombre + ". ¿Cuál es tu número de celular? (10 dígitos, suele empezar por 3.)";
  }
} else if (sess.step === "ASK_TEL") {
  if (!raw || !pareceTelefono(raw)) {
    reply = "Indicá un celular colombiano válido (10 dígitos, con o sin espacios).";
  } else {
    const dig = soloDigitos(raw);
    d.telefono = dig.length >= 10 ? "+57" + dig.slice(-10) : raw;
    sess.step = "ASK_EMAIL";
    reply = "Listo. ¿Cuál es tu correo electrónico?";
  }
} else if (sess.step === "ASK_EMAIL") {
  if (!raw || !pareceEmail(raw)) {
    reply = "Escribí un correo válido (ejemplo: nombre@correo.com).";
  } else {
    d.email = raw;
    sess.step = "ASK_CIUDAD";
    reply = "¿En qué ciudad queda la obra o el envío?";
  }
} else if (sess.step === "ASK_CIUDAD") {
  if (!raw) {
    reply = "¿En qué ciudad queda la obra o el envío?";
  } else {
    d.ciudad = raw;
    sess.step = "ASK_QUOTE_CONFIRM";
    reply =
      "Perfecto. ¿Querés que preparemos una cotización formal de casetón con precios orientativos?";
    suggestedActions = [
      { type: "reply", title: "Sí, cotizar", value: "Sí" },
      { type: "reply", title: "No, gracias", value: "No" }
    ];
  }
} else if (sess.step === "ASK_QUOTE_CONFIRM") {
  const neg = /^(no|nop|nel|cancelar|no gracias)\b/i.test(raw);
  const pos = /^(s[ií]|si|ok|dale|claro|por favor|cotizar|sí)\b/i.test(raw) || /^sí$/i.test(raw);
  if (neg || raw.toLowerCase() === "no, gracias") {
    sess.step = "FIN_SIN_COTIZACION";
    reply =
      "Entendido. Si más adelante necesitás números o asesoría, escribinos por aquí. ¡Que tengas buen día!";
    suggestedActions = [];
  } else if (pos || raw.toLowerCase().includes("cotizar")) {
    sess.quoteConfirmed = true;
    sess.step = "ASK_TIPO_PERSONA";
    reply = "Genial. ¿Cotizamos a nombre de persona natural o de una empresa?";
    suggestedActions = [
      { type: "reply", title: "Persona Natural", value: "Persona Natural" },
      { type: "reply", title: "Empresa", value: "Empresa" }
    ];
  } else {
    return salirSinCambioPaso(
      "Respondé con **Sí** o **No** (o tocá los botones) para indicar si querés la cotización."
    );
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
      metadata: {
        ...(j.metadata || {}),
        pasoActual: sess.step,
        nombre: d.nombre,
        telefono: d.telefono,
        email: d.email,
        ciudad: d.ciudad
      }
    }
  }
];
