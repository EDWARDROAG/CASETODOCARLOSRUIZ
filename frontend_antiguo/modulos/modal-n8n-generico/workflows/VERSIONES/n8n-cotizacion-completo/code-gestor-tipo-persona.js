/**
 * Nodo: Code tipo persona
 * Paso: ASK_TIPO_PERSONA → fija tipoPersona y primer paso de datos específicos.
 */
const G = $getWorkflowStaticData("global");
G.sessions = G.sessions || {};
const j = $input.first().json;
const sid = String(j.ragSessionId || j.metadata?.ragSessionId || "anon").trim() || "anon";

let sess = G.sessions[sid] || j.sess;
if (!sess) {
  sess = {
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
  G.sessions[sid] = sess;
}

if (sess.step !== "ASK_TIPO_PERSONA") {
  return [{ json: { ...j, sess, runPdfPipeline: false } }];
}

const raw = String(j.mensaje || "").trim();
const low = raw.toLowerCase();
let reply = "";
let suggestedActions = [];

if (/empresa|nit|sociedad|s\.a\.s|ltda/i.test(raw) || low.includes("empresa")) {
  sess.tipoPersona = "empresa";
  sess.step = "ASK_NOMBRE_EMPRESA";
  reply = "Perfecto. ¿Cuál es la razón social o nombre de la empresa?";
} else if (/natural|persona|cedula|cédula|cc/i.test(raw) || low.includes("natural")) {
  sess.tipoPersona = "natural";
  sess.step = "ASK_DOCUMENTO";
  reply = "Listo. ¿Cuál es tu número de documento (cédula o cédula de extranjería)?";
} else if (!raw) {
  reply = "¿La cotización es a nombre de persona natural o de una empresa?";
  suggestedActions = [
    { type: "reply", title: "Persona Natural", value: "Persona Natural" },
    { type: "reply", title: "Empresa", value: "Empresa" }
  ];
} else {
  reply = "Elegí **Persona Natural** o **Empresa** (o usá los botones).";
  suggestedActions = [
    { type: "reply", title: "Persona Natural", value: "Persona Natural" },
    { type: "reply", title: "Empresa", value: "Empresa" }
  ];
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
      metadata: { ...(j.metadata || {}), pasoActual: sess.step, tipoPersona: sess.tipoPersona }
    }
  }
];
