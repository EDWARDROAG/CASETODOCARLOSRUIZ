/**
 * Aplica al workflow exportado en frontend/ la ruta:
 * chat → Gestor (incl. elegir canal: correo / telegram / ambos) → IF datos completos → … → Procesar → IF Telegram / IF correo equipo / IF confirmación cliente → Responder web
 * Idempotente: quita nodos del gestor por nombre antes de volver a insertarlos.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wfPath = path.join(__dirname, "..", "frontend", "n8n-workflow-casetodo-web-chat-openai-cotizador.json");

const JS_NORMALIZAR = `const item = $input.first().json;
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
  if (parts.length) return parts.map((x) => String(x).trim()).join("\\n\\n");
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
];`;

const JS_GESTOR = `const inputData = $input.first().json;
const rawMsg = String(inputData.mensaje || "").trim();

const md =
  inputData.metadata && typeof inputData.metadata === "object"
    ? inputData.metadata
    : {};

let paso = String(
  inputData.pasoActual || md.pasoActual || "inicio"
)
  .trim()
  .toLowerCase() || "inicio";
let nombre = String(inputData.nombre || md.nombre || "").trim();
let telefono = String(inputData.telefono || md.telefono || "").trim();
let email = String(inputData.email || md.email || "").trim();
let requerimiento = String(
  inputData.requerimiento || md.requerimiento || ""
).trim();

function trueish(v) {
  return v === true || String(v).toLowerCase() === "true" || v === 1 || v === "1";
}
let enviarCotizacionTelegram =
  trueish(inputData.enviarCotizacionTelegram) || trueish(md.enviarCotizacionTelegram);
let enviarCotizacionCorreoEquipo =
  trueish(inputData.enviarCotizacionCorreoEquipo) ||
  trueish(md.enviarCotizacionCorreoEquipo);
let enviarConfirmacionCliente =
  trueish(inputData.enviarConfirmacionCliente) || trueish(md.enviarConfirmacionCliente);

function soloDigitos(s) {
  return String(s || "")
    .split("")
    .filter((c) => "0123456789".indexOf(c) !== -1)
    .join("");
}

function pareceTelefono(msg) {
  const d = soloDigitos(msg);
  return d.length >= 10 && d.length <= 13;
}

function pareceEmail(msg) {
  const t = String(msg || "").trim();
  return t.indexOf("@") > 0 && t.indexOf(".") > t.indexOf("@");
}

const saludos = new Set([
  "hola",
  "hi",
  "hey",
  "buenas",
  "buenos dias",
  "buenas tardes",
  "buenas noches",
  "buen dia",
  "que tal",
  "saludos",
  "buenos días",
  "buen día"
]);

function esSoloSaludo(msg) {
  const t = String(msg || "")
    .trim()
    .toLowerCase()
    .replace(/\\s+/g, " ");
  if (!t) return true;
  if (saludos.has(t)) return true;
  if (t.length <= 2) return true;
  return false;
}

function respuestaTrasCompletar(msg) {
  const t = String(msg || "").trim().toLowerCase();
  if (!t) return "¿Necesitas ayuda con algo más?";
  if (
    /esperando|asesor|asesoria|comercial|contact(o|en)|llamen|cuando|demora|pronto|whatsapp/i.test(
      t
    )
  ) {
    return (
      "Tu solicitud y datos ya quedaron registrados. Un asesor comercial te contactará pronto; " +
      "revisá también tu correo por si te escribimos desde ahí."
    );
  }
  if (/gracias|^ok$|^listo$|^bueno$|^perfecto$|^bien$/i.test(t)) {
    return (
      "Con gusto. Si más adelante necesitás algo sobre casetones u obra, escribinos por aquí."
    );
  }
  return (
    "Gracias por escribir. Si querés agregar un detalle a tu requerimiento, decímelo en una frase " +
    "y lo dejamos anotado para el equipo."
  );
}

if (paso === "inicio" || paso === "") {
  if (
    nombre &&
    telefono &&
    email &&
    pareceEmail(email) &&
    String(requerimiento || "").trim() === ""
  ) {
    paso = "solicitar_requerimiento";
  } else if (nombre && rawMsg && pareceTelefono(rawMsg)) {
    paso = "solicitar_telefono";
  } else if (nombre && telefono && pareceTelefono(telefono)) {
    paso = "solicitar_email";
  } else if (telefono && pareceTelefono(telefono) && !nombre) {
    paso = "solicitar_nombre";
  }
}

if (
  (paso === "inicio" || paso === "") &&
  nombre &&
  telefono &&
  email &&
  pareceEmail(email) &&
  String(requerimiento || "").trim() === "" &&
  rawMsg &&
  !esSoloSaludo(rawMsg) &&
  !pareceTelefono(rawMsg) &&
  !pareceEmail(rawMsg)
) {
  paso = "solicitar_requerimiento";
}

let respuesta = "";
let datosCompletos = false;

if (paso === "inicio") {
  if (rawMsg && pareceTelefono(rawMsg)) {
    telefono = rawMsg;
    respuesta =
      "Gracias, registramos tu número. ¿Cómo te llamas?";
    paso = "solicitar_nombre";
  } else if (rawMsg && !esSoloSaludo(rawMsg)) {
    nombre = rawMsg;
    respuesta =
      "Gracias, " + nombre + ". ¿Cuál es tu número de teléfono?";
    paso = "solicitar_telefono";
  } else {
    respuesta =
      "¡Hola! Soy el asistente de Casetodo Carlos Ruiz. ¿Cómo te llamas?";
    paso = "solicitar_nombre";
  }
} else if (paso === "solicitar_nombre") {
  if (rawMsg && pareceTelefono(rawMsg)) {
    telefono = rawMsg;
    if (!nombre) {
      respuesta =
        "Listo, tenemos tu teléfono. ¿Cómo te llamas?";
      paso = "solicitar_nombre";
    } else {
      respuesta =
        "Teléfono registrado. ¿Cuál es tu correo electrónico?";
      paso = "solicitar_email";
    }
  } else {
    const v = rawMsg || nombre;
    if (!v) {
      respuesta = "¿Cómo te llamas?";
      paso = "solicitar_nombre";
    } else {
      nombre = v;
      if (telefono && pareceTelefono(telefono)) {
        respuesta =
          "Teléfono registrado. ¿Cuál es tu correo electrónico?";
        paso = "solicitar_email";
      } else {
        respuesta =
          "Gracias, " + nombre + ". ¿Cuál es tu número de teléfono?";
        paso = "solicitar_telefono";
      }
    }
  }
} else if (paso === "solicitar_telefono") {
  if (rawMsg && pareceEmail(rawMsg)) {
    email = rawMsg;
    if (!nombre) {
      respuesta =
        "Guardamos tu correo. ¿Cómo te llamas?";
      paso = "solicitar_nombre";
    } else {
      respuesta =
        "Correo registrado. ¿Qué necesitás cotizar o alquilar? (tipo, cantidad aproximada, ciudad de obra).";
      paso = "solicitar_requerimiento";
    }
  } else {
    const v = rawMsg || telefono;
    if (!v) {
      respuesta = "¿Cuál es tu número de teléfono?";
      paso = "solicitar_telefono";
    } else if (!pareceTelefono(v)) {
      respuesta =
        "Indica un celular colombiano (10 dígitos, suele empezar por 3), con o sin espacios.";
      paso = "solicitar_telefono";
    } else {
      telefono = v;
      respuesta = "Teléfono registrado. ¿Cuál es tu correo electrónico?";
      paso = "solicitar_email";
    }
  }
} else if (paso === "solicitar_email") {
  const v = rawMsg || email;
  if (!v) {
    respuesta = "¿Cuál es tu correo electrónico?";
    paso = "solicitar_email";
  } else if (!pareceEmail(v)) {
    respuesta =
      "Escribe un correo válido (ejemplo: nombre@correo.com).";
    paso = "solicitar_email";
  } else {
    email = v;
    respuesta =
      "Gracias. ¿Qué necesitás cotizar o alquilar? (tipo de casetón, cantidad aproximada, ciudad de obra).";
    paso = "solicitar_requerimiento";
  }
} else if (paso === "solicitar_requerimiento") {
  const v = rawMsg || requerimiento;
  if (!v) {
    respuesta = "Contanos brevemente qué necesitás cotizar.";
    paso = "solicitar_requerimiento";
  } else {
    requerimiento = v;
    respuesta =
      "✅ ¡Perfecto! ¿Cómo querés que avisemos al equipo con tu cotización? Escribí **correo** (solo correo), **telegram** o **ambos**. También podés responder **1** (correo), **2** (telegram) o **3** (ambos).";
    paso = "elegir_canal_cotizacion";
    enviarCotizacionTelegram = false;
    enviarCotizacionCorreoEquipo = false;
    enviarConfirmacionCliente = false;
  }
} else if (paso === "elegir_canal_cotizacion") {
  function parseCanal(msg) {
    const s = String(msg || "").trim().toLowerCase();
    if (!s) return null;
    const mnum = s.match(/^\\s*([123])\\s*$/);
    if (mnum) {
      const n = parseInt(mnum[1], 10);
      if (n === 3) return { tg: true, ce: true };
      if (n === 2) return { tg: true, ce: false };
      if (n === 1) return { tg: false, ce: true };
    }
    if (
      /(ambos|los\\s+dos|los\\s*2|las\\s+dos|correo\\s+y\\s+telegram|telegram\\s+y\\s+correo|mail\\s+y\\s+telegram)/.test(
        s
      )
    ) {
      return { tg: true, ce: true };
    }
    if (/\\b(telegram|tg)\\b/.test(s) && !/\\b(correo|email|mail)\\b/.test(s)) {
      return { tg: true, ce: false };
    }
    if (/\\b(correo|correos|email|mail|e-mail|gmail)\\b/.test(s)) {
      return { tg: false, ce: true };
    }
    return null;
  }
  const c = parseCanal(rawMsg);
  if (!c) {
    respuesta =
      "No lo pude interpretar. Escribí **correo**, **telegram** o **ambos** (o **1**, **2**, **3**).";
    paso = "elegir_canal_cotizacion";
  } else {
    enviarCotizacionTelegram = c.tg;
    enviarCotizacionCorreoEquipo = c.ce;
    enviarConfirmacionCliente = c.ce;
    respuesta =
      c.tg && c.ce
        ? "Perfecto: avisamos por **correo** y por **Telegram**. Preparando tu mensaje final…"
        : c.tg
          ? "Listo: avisamos al equipo por **Telegram**. Preparando tu mensaje final…"
          : "Listo: enviamos la solicitud por **correo** al equipo. Preparando tu mensaje final…";
    paso = "completado";
    datosCompletos = true;
  }
} else if (paso === "completado") {
  respuesta = respuestaTrasCompletar(rawMsg);
  datosCompletos = false;
} else {
  respuesta = respuestaTrasCompletar(rawMsg);
}

const digits = soloDigitos(telefono);
const lead = {
  nombre,
  telefono: digits.length >= 10 ? "+57" + digits.slice(-10) : telefono ? telefono : "",
  email
};

const metaOut = {
  ...md,
  pasoActual: paso,
  nombre,
  telefono,
  email,
  requerimiento,
  enviarCotizacionTelegram,
  enviarCotizacionCorreoEquipo,
  enviarConfirmacionCliente
};

return [
  {
    json: {
      ...inputData,
      reply: respuesta,
      nombre,
      telefono,
      email,
      requerimiento,
      pasoActual: paso,
      metadata: metaOut,
      datosCompletos: datosCompletos === true,
      lead,
      forzarCotizacion: false,
      enviarCotizacionTelegram,
      enviarCotizacionCorreoEquipo,
      enviarConfirmacionCliente
    }
  }
];`;

const JS_PREPARAR_COTIZ = `const j = $input.first().json;
const req = String(j.requerimiento || "").trim();
const prompt = [
  "Datos del cliente:",
  "Nombre: " + (j.nombre || "(sin nombre)"),
  "Teléfono: " + (j.telefono || "(sin teléfono)"),
  "Email: " + (j.email || "(sin email)"),
  "",
  "Requerimiento a cotizar:",
  req || "(no especificado)",
  "",
  "Redacta un cierre comercial breve (máximo 4 frases en español): agradece, confirma que recibieron la solicitud, resume el requerimiento en una frase si aplica, indica que un asesor enviará valores y disponibilidad sin inventar cifras ni prometer fechas exactas."
].join("\\n");
return [{ json: { ...j, mensaje: prompt, conversation: [], forzarCotizacion: true } }];`;

const JS_FALLBACK = `const agent = $input.first().json;
const prev = $('Preparar contexto cotizacion').first().json;

function extract(o) {
  if (!o || typeof o !== "object") return "";
  if (o.error) return "";
  if (typeof o.output === "string" && o.output.trim()) return o.output.trim();
  if (typeof o.text === "string" && o.text.trim()) return o.text.trim();
  if (o.json && typeof o.json === "object" && typeof o.json.output === "string") {
    return String(o.json.output).trim();
  }
  return "";
}

const texto = extract(agent);
if (texto) {
  return [{ json: { ...prev, iaReply: texto, iaFuente: "gemini" } }];
}

const nom = prev.nombre ? " " + prev.nombre : "";
return [
  {
    json: {
      ...prev,
      iaReply:
        "Hola" +
        nom +
        ", recibimos tus datos. Nuestro equipo te contactará pronto con una cotización personalizada. ¡Gracias por confiar en Casetodo Carlos Ruiz!",
      iaFuente: "fallback"
    }
  }
];`;

const JS_PARSEAR = `const prev = $('Preparar contexto cotizacion').first().json;
const api = $input.first().json;

function extractAgentText(o) {
  if (!o || typeof o !== "object") return "";
  if (typeof o.output === "string" && o.output.trim()) return o.output.trim();
  if (typeof o.text === "string" && o.text.trim()) return o.text.trim();
  if (o.json && typeof o.json === "string") return o.json.trim();
  if (o.json && typeof o.json === "object" && typeof o.json.output === "string") {
    return String(o.json.output).trim();
  }
  const c = o.choices?.[0]?.message?.content;
  if (typeof c === "string") return c.trim();
  return "";
}

const directIa =
  typeof api.iaReply === "string" && api.iaReply.trim() ? api.iaReply.trim() : "";
const reply =
  directIa ||
  extractAgentText(api) ||
  "No pude generar respuesta en este momento.";
const texto = (String(prev.mensaje || "") + String(reply || "")).toLowerCase();
const wantsQuote =
  Boolean(prev.forzarCotizacion) ||
  Boolean(prev.datosCompletos) ||
  /(cotiz|cotizacion|cotizar|precio|valor|presupuesto)/i.test(texto);

function pickPhone(t) {
  const s = String(t || "");
  const m = s.match(/\\b3\\d{9}\\b/) || s.match(/\\+?57\\s*3\\d{9}/);
  if (!m) return "";
  const digits = m[0].replace(/\\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : "";
}
function pickEmail(t) {
  const m = String(t || "").match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/);
  return m ? m[0] : "";
}
const fullText = [prev.nombre, prev.telefono, prev.email, prev.mensaje, reply].filter(Boolean).join(" ");
const telefono = prev.telefono || pickPhone(fullText);
const email = prev.email || pickEmail(fullText);
const nombre = prev.nombre || "";

return [
  {
    json: {
      ...prev,
      iaReply: reply,
      wantsQuote,
      lead: {
        nombre,
        telefono: telefono ? "+57" + telefono : "",
        email
      }
    }
  }
];`;

const SYSTEM_COTIZ_CIERRE = `Redactas el mensaje final al cliente de Casetodo Carlos Ruiz (casetones para obra en Colombia).
Sé cordial y profesional. No inventes precios ni plazos exactos. Máximo 4 frases. Español natural.`;

const JS_PROCESAR_COTIZ = `const j = $input.first().json;
const md2 = j.metadata && typeof j.metadata === "object" ? j.metadata : {};
const req = String(j.requerimiento || md2.requerimiento || "").trim();
const fecha = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
const resumen = [
  "NUEVA SOLICITUD WEB (Casetodo)",
  "Fecha: " + fecha,
  "Asociado: " + String(j.associateSlug || ""),
  "Canal: " + String(j.channel || ""),
  "Nombre: " + String(j.lead?.nombre || "No informado"),
  "Telefono: " + String(j.lead?.telefono || "No informado"),
  "Email: " + String(j.lead?.email || "No informado"),
  "",
  "Requerimiento (que cotizar):",
  req || "No especificado",
  "",
  "Ultimo mensaje chat (contexto):",
  String(j.mensaje || "Sin mensaje"),
  "",
  "Respuesta IA al cliente:",
  String(j.iaReply || "Sin respuesta"),
  "",
  "Medios elegidos por el cliente (aviso al equipo):",
  "Telegram: " + (j.enviarCotizacionTelegram ? "si" : "no"),
  "Correo comercial: " + (j.enviarCotizacionCorreoEquipo ? "si" : "no"),
  "Correo de confirmacion al cliente: " + (j.enviarConfirmacionCliente ? "si" : "no")
].join("\\n");

return [{ json: { ...j, resumenCotizacion: resumen } }];`;

const GESTOR_NODE = {
  parameters: { jsCode: JS_GESTOR },
  id: "a11a1111-1111-4111-8111-111111111101",
  name: "Gestor conversacion",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [-1728, 80]
};

const IF_DATOS_NODE = {
  parameters: {
    conditions: {
      options: {
        caseSensitive: true,
        leftValue: "",
        typeValidation: "loose",
        version: 2
      },
      conditions: [
        {
          id: "datos-completos-true",
          leftValue:
            "={{ $json.datosCompletos === true || $json.datosCompletos === 'true' || $json.datosCompletos === 1 }}",
          rightValue: true,
          operator: { type: "boolean", operation: "equal" }
        }
      ],
      combinator: "and"
    },
    options: {}
  },
  id: "a11a1111-1111-4111-8111-111111111102",
  name: "IF datos completos",
  type: "n8n-nodes-base.if",
  typeVersion: 2.2,
  position: [-1520, 96]
};

const FALLBACK_NODE = {
  parameters: { jsCode: JS_FALLBACK },
  id: "a11a1111-1111-4111-8111-111111111104",
  name: "Fallback respuesta IA",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [-960, 400]
};

const IF_ENVIO_TELEGRAM = {
  parameters: {
    conditions: {
      options: {
        caseSensitive: true,
        leftValue: "",
        typeValidation: "loose",
        version: 2
      },
      conditions: [
        {
          id: "if-envio-tg",
          leftValue:
            "={{ $json.enviarCotizacionTelegram === true || $json.enviarCotizacionTelegram === 'true' || $json.enviarCotizacionTelegram === 1 }}",
          rightValue: true,
          operator: { type: "boolean", operation: "equal" }
        }
      ],
      combinator: "and"
    },
    options: {}
  },
  id: "b2b2b2b-2222-4222-8222-222222222201",
  name: "IF enviar Telegram cotizacion",
  type: "n8n-nodes-base.if",
  typeVersion: 2.2,
  position: [-752, -80]
};

const IF_ENVIO_CORREO_EQUIPO = {
  parameters: {
    conditions: {
      options: {
        caseSensitive: true,
        leftValue: "",
        typeValidation: "loose",
        version: 2
      },
      conditions: [
        {
          id: "if-envio-mail-equipo",
          leftValue:
            "={{ $json.enviarCotizacionCorreoEquipo === true || $json.enviarCotizacionCorreoEquipo === 'true' || $json.enviarCotizacionCorreoEquipo === 1 }}",
          rightValue: true,
          operator: { type: "boolean", operation: "equal" }
        }
      ],
      combinator: "and"
    },
    options: {}
  },
  id: "b2b2b2b-2222-4222-8222-222222222202",
  name: "IF enviar correo equipo cotizacion",
  type: "n8n-nodes-base.if",
  typeVersion: 2.2,
  position: [-592, -80]
};

const IF_CONF_CORREO_CLIENTE = {
  parameters: {
    conditions: {
      options: {
        caseSensitive: true,
        leftValue: "",
        typeValidation: "loose",
        version: 2
      },
      conditions: [
        {
          id: "if-conf-mail-cliente",
          leftValue:
            "={{ $json.enviarConfirmacionCliente === true || $json.enviarConfirmacionCliente === 'true' || $json.enviarConfirmacionCliente === 1 }}",
          rightValue: true,
          operator: { type: "boolean", operation: "equal" }
        }
      ],
      combinator: "and"
    },
    options: {}
  },
  id: "b2b2b2b-2222-4222-8222-222222222203",
  name: "IF confirmar correo cliente",
  type: "n8n-nodes-base.if",
  typeVersion: 2.2,
  position: [-432, -80]
};

const JS_PREPARAR_ENVIO_EQUIPO = `const j = $input.first().json;
const parts = [j.mensajeOriginal, j.structuredMensaje, j.mensaje].filter(
  (x) => x != null && String(x).trim() !== ""
);
const combined = parts.length
  ? parts.map((s) => String(s).trim()).join("\\n\\n")
  : String(j.mensaje || "").trim();
const md0 = j.metadata && typeof j.metadata === "object" ? j.metadata : {};
return [
  {
    json: {
      ...j,
      phase: "submit",
      mensaje: combined,
      iaReply: "",
      wantsQuote: true,
      enviarCotizacionTelegram: true,
      enviarCotizacionCorreoEquipo: true,
      enviarConfirmacionCliente: true,
      metadata: {
        ...md0,
        enviarCotizacionTelegram: true,
        enviarCotizacionCorreoEquipo: true,
        enviarConfirmacionCliente: true
      },
      lead: {
        nombre: j.nombre || "",
        telefono: j.telefono || "",
        email: j.email || ""
      }
    }
  }
];`;

const w = JSON.parse(fs.readFileSync(wfPath, "utf8"));

const norm = w.nodes.find((n) => n.name === "Normalizar entrada");
if (norm) norm.parameters.jsCode = JS_NORMALIZAR;

const prep = w.nodes.find(
  (n) => n.name === "Construir prompt OpenAI" || n.name === "Preparar contexto cotizacion"
);
if (prep) {
  prep.name = "Preparar contexto cotizacion";
  prep.parameters.jsCode = JS_PREPARAR_COTIZ;
}

const gestorNames = new Set([
  "Gestor conversacion",
  "IF datos completos",
  "Responder web gestor",
  "Fallback respuesta IA"
]);
const routingIfNames = new Set([
  "IF enviar Telegram cotizacion",
  "IF enviar correo equipo cotizacion",
  "IF confirmar correo cliente"
]);
w.nodes = w.nodes.filter((n) => !gestorNames.has(n.name) && !routingIfNames.has(n.name));
w.nodes.push(
  GESTOR_NODE,
  IF_DATOS_NODE,
  FALLBACK_NODE,
  IF_ENVIO_TELEGRAM,
  IF_ENVIO_CORREO_EQUIPO,
  IF_CONF_CORREO_CLIENTE
);

const par = w.nodes.find((n) => n.name === "Parsear respuesta IA");
if (par) par.parameters.jsCode = JS_PARSEAR;

const procCot = w.nodes.find((n) => n.name === "Procesar cotizacion");
if (procCot) procCot.parameters.jsCode = JS_PROCESAR_COTIZ;

const prepEnvio = w.nodes.find((n) => n.name === "Preparar envio equipo");
if (prepEnvio) prepEnvio.parameters.jsCode = JS_PREPARAR_ENVIO_EQUIPO;

const telNode = w.nodes.find((n) => n.name === "Enviar a Telegram");
if (telNode?.parameters) {
  telNode.parameters.chatId = "8251345831";
}

const agent = w.nodes.find((n) => n.name === "AI Agent");
if (agent) {
  agent.continueOnFail = true;
  agent.parameters.promptType = "define";
  agent.parameters.text = "={{ $json.mensaje }}";
  agent.parameters.options = agent.parameters.options || {};
  agent.parameters.options.systemMessage = SYSTEM_COTIZ_CIERRE;
  agent.parameters.options.maxIterations = 5;
  agent.parameters.options.returnIntermediateSteps = false;
}

const rw = w.nodes.find((n) => n.name === "Responder web");
if (rw) {
  rw.parameters.responseBody =
    "={{ ({ ok: true, reply: ($json.reply || $json.iaReply || ''), message: $json.phase === 'submit' ? '¡Listo! Ya quedó en manos del equipo; pronto te contactan.' : '', phase: $json.phase || 'chat', wantsQuote: Boolean($json.wantsQuote || $json.datosCompletos === true || $json.datosCompletos === 'true'), pasoActual: $json.pasoActual || '', nombre: $json.lead?.nombre || $json.nombre || '', telefono: $json.lead?.telefono || $json.telefono || '', email: $json.lead?.email || $json.email || '', requerimiento: $json.requerimiento || '', datosCompletos: ($json.datosCompletos === true || $json.datosCompletos === 'true'), enviarCotizacionTelegram: ($json.enviarCotizacionTelegram === true || $json.enviarCotizacionTelegram === 'true'), enviarCotizacionCorreoEquipo: ($json.enviarCotizacionCorreoEquipo === true || $json.enviarCotizacionCorreoEquipo === 'true'), enviarConfirmacionCliente: ($json.enviarConfirmacionCliente === true || $json.enviarConfirmacionCliente === 'true') }) }}";
}

w.connections["IF fase chat"] = {
  main: [
    [{ node: "Gestor conversacion", type: "main", index: 0 }],
    [{ node: "IF fase submit", type: "main", index: 0 }]
  ]
};

w.connections["Gestor conversacion"] = {
  main: [[{ node: "IF datos completos", type: "main", index: 0 }]]
};

w.connections["IF datos completos"] = {
  main: [
    [{ node: "Preparar contexto cotizacion", type: "main", index: 0 }],
    [{ node: "Responder web", type: "main", index: 0 }]
  ]
};

delete w.connections["Responder web gestor"];

w.connections["Preparar contexto cotizacion"] = {
  main: [[{ node: "AI Agent", type: "main", index: 0 }]]
};

delete w.connections["Construir prompt OpenAI"];

w.connections["AI Agent"] = {
  main: [[{ node: "Fallback respuesta IA", type: "main", index: 0 }]]
};

w.connections["Fallback respuesta IA"] = {
  main: [[{ node: "Parsear respuesta IA", type: "main", index: 0 }]]
};

w.connections["Procesar cotizacion"] = {
  main: [[{ node: "IF enviar Telegram cotizacion", type: "main", index: 0 }]]
};

w.connections["IF enviar Telegram cotizacion"] = {
  main: [
    [{ node: "Enviar a Telegram", type: "main", index: 0 }],
    [{ node: "IF enviar correo equipo cotizacion", type: "main", index: 0 }]
  ]
};

w.connections["Enviar a Telegram"] = {
  main: [[{ node: "IF enviar correo equipo cotizacion", type: "main", index: 0 }]]
};

w.connections["IF enviar correo equipo cotizacion"] = {
  main: [
    [{ node: "Enviar a correo equipo", type: "main", index: 0 }],
    [{ node: "IF confirmar correo cliente", type: "main", index: 0 }]
  ]
};

w.connections["Enviar a correo equipo"] = {
  main: [[{ node: "IF confirmar correo cliente", type: "main", index: 0 }]]
};

w.connections["IF confirmar correo cliente"] = {
  main: [
    [{ node: "IF hay email cliente", type: "main", index: 0 }],
    [{ node: "Responder web", type: "main", index: 0 }]
  ]
};

fs.writeFileSync(wfPath, JSON.stringify(w, null, 2), "utf8");
console.log("Parche aplicado:", wfPath);
