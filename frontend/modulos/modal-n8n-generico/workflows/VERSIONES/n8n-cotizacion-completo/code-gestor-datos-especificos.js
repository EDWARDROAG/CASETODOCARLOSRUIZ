/**
 * Nodo: Code datos específicos
 * Natural: ASK_DOCUMENTO → ASK_DIRECCION
 * Empresa: ASK_NOMBRE_EMPRESA → ASK_NIT → ASK_DIRECCION_EMPRESA
 */
const G = $getWorkflowStaticData("global");
G.sessions = G.sessions || {};
const j = $input.first().json;
const sid = String(j.ragSessionId || j.metadata?.ragSessionId || "anon").trim() || "anon";
let sess = G.sessions[sid] || j.sess;
if (!sess) {
  return [{ json: { ...j, reply: "Reabrimos el asistente: empezá de nuevo por favor.", runPdfPipeline: false } }];
}

const STEPS = new Set([
  "ASK_DOCUMENTO",
  "ASK_DIRECCION",
  "ASK_NOMBRE_EMPRESA",
  "ASK_NIT",
  "ASK_DIRECCION_EMPRESA"
]);
if (!STEPS.has(sess.step)) {
  return [{ json: { ...j, sess, runPdfPipeline: false } }];
}

const raw = String(j.mensaje || "").trim();
const de = sess.datosEspecificos || (sess.datosEspecificos = {});
let reply = "";
let suggestedActions = [];

if (sess.step === "ASK_DOCUMENTO") {
  if (!raw) {
    reply = "¿Cuál es tu número de documento?";
  } else {
    de.documento = raw;
    sess.step = "ASK_DIRECCION";
    reply = "Gracias. ¿Cuál es tu dirección (para la cotización)?";
  }
} else if (sess.step === "ASK_DIRECCION") {
  if (!raw) {
    reply = "¿Cuál es tu dirección?";
  } else {
    de.direccion = raw;
    sess.step = "ASK_TIPO_CASETON";
    reply = "¿Qué tipo de casetón necesitás?";
    suggestedActions = [
      { type: "reply", title: "Incopor", value: "Incopor" },
      { type: "reply", title: "Guadua", value: "Guadua" }
    ];
  }
} else if (sess.step === "ASK_NOMBRE_EMPRESA") {
  if (!raw) {
    reply = "¿Cuál es el nombre de la empresa?";
  } else {
    de.nombreEmpresa = raw;
    sess.step = "ASK_NIT";
    reply = "¿Cuál es el NIT de la empresa (sin guiones está bien)?";
  }
} else if (sess.step === "ASK_NIT") {
  if (!raw) {
    reply = "¿Cuál es el NIT?";
  } else {
    de.nit = raw.replace(/\D/g, "");
    sess.step = "ASK_DIRECCION_EMPRESA";
    reply = "¿Cuál es la dirección fiscal o de contacto de la empresa?";
  }
} else if (sess.step === "ASK_DIRECCION_EMPRESA") {
  if (!raw) {
    reply = "¿Cuál es la dirección de la empresa?";
  } else {
    de.direccionEmpresa = raw;
    sess.step = "ASK_TIPO_CASETON";
    reply = "¿Qué tipo de casetón necesitás?";
    suggestedActions = [
      { type: "reply", title: "Incopor", value: "Incopor" },
      { type: "reply", title: "Guadua", value: "Guadua" }
    ];
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
      runPdfPipeline: false,
      pasoActual: sess.step,
      metadata: { ...(j.metadata || {}), pasoActual: sess.step }
    }
  }
];
