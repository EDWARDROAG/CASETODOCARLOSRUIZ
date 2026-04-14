/**
 * Gestor de cotización sin IA
 * Estados: INIT → ASK_NAME → ASK_PHONE → ASK_EMAIL → ASK_PETICION → ASK_CONFIRMAR → ASK_MEDIO → DONE
 */
const input = $input.first().json;

let body = {};
if (input.body != null && typeof input.body === "object" && !Array.isArray(input.body)) {
  body = input.body;
} else if (typeof input.body === "string") {
  try {
    const p = JSON.parse(input.body);
    if (p && typeof p === "object") body = p;
  } catch (e) {
    body = {};
  }
}
const merged = { ...input, ...body };

const mensaje = String(merged.mensaje || merged.message || "").trim();
const sessionId = String(
  merged.ragSessionId ||
    merged.metadata?.ragSessionId ||
    merged.sessionId ||
    "anon"
).trim() || "anon";

const staticData = $getWorkflowStaticData("global");
staticData.sessions = staticData.sessions || {};
const S = staticData.sessions;

let sess = S[sessionId];
if (!sess) {
  sess = { step: "INIT", data: {}, createdAt: new Date().toISOString() };
}

const YES = /^(s[ií]|si|s|ok|dale|vale|claro|sip|sim[oó]n|confirmo)$/i;
const NO = /^(no|nop|nunca|ahora no|nel|negativo)$/i;
const SALUDO = /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|hi|ola)$/i;

function isYes(t) {
  return YES.test(String(t || "").trim());
}
function isNo(t) {
  return NO.test(String(t || "").trim());
}

let reply = "";
let done = false;
let medio = null;

function resetSession() {
  sess = { step: "INIT", data: {}, createdAt: new Date().toISOString() };
}

const lower = mensaje.toLowerCase();
if (sess.step === "DONE" && /^(hola|buenas|hey|hi)\b/i.test(mensaje)) {
  resetSession();
}

switch (sess.step) {
  case "INIT":
    if (mensaje && !SALUDO.test(mensaje)) {
      // Si el primer mensaje ya trae el nombre, avanzamos directo.
      sess.data.nombre = mensaje.slice(0, 80);
      reply =
        "Gracias, " +
        sess.data.nombre +
        ". ¿Cuál es tu número de WhatsApp? (10 dígitos, ej. 3001234567)";
      sess.step = "ASK_PHONE";
    } else {
      reply = "¡Hola! ¿Cómo te llamás?";
      sess.step = "ASK_NAME";
    }
    break;

  case "ASK_NAME":
    if (!mensaje) {
      reply = "¿Cómo te llamás?";
      break;
    }
    sess.data.nombre = mensaje.slice(0, 80);
    reply =
      "Gracias, " +
      sess.data.nombre +
      ". ¿Cuál es tu número de WhatsApp? (10 dígitos, ej. 3001234567)";
    sess.step = "ASK_PHONE";
    break;

  case "ASK_PHONE": {
    if (!mensaje) {
      reply = "¿Cuál es tu número de WhatsApp?";
      break;
    }
    const dig = mensaje.replace(/\D/g, "");
    if (dig.length < 10) {
      reply = "Necesito un número válido (al menos 10 dígitos). ¿Cuál es tu WhatsApp?";
      break;
    }
    sess.data.whatsapp = dig.slice(0, 15);
    reply = "Perfecto. ¿Cuál es tu correo electrónico? (para enviarte la cotización)";
    sess.step = "ASK_EMAIL";
    break;
  }

  case "ASK_EMAIL":
    if (!mensaje || !mensaje.includes("@") || mensaje.indexOf(".") <= mensaje.indexOf("@")) {
      reply = "Necesito un correo válido (debe incluir @ y dominio). ¿Cuál es tu email?";
      break;
    }
    sess.data.email = mensaje.trim().slice(0, 120);
    reply = "Listo. Escríbenos tu petición (qué necesitás cotizar)";
    sess.step = "ASK_PETICION";
    break;

  case "ASK_PETICION":
    if (!mensaje) {
      reply = "¿Qué necesitás cotizar?";
      break;
    }
    sess.data.peticion = mensaje.slice(0, 500);
    reply =
      "Por este medio solo podés solicitar una cotización. ¿Deseás cotizar?\n\nRespondé **sí** o **no**.";
    sess.step = "ASK_CONFIRMAR";
    break;

  case "ASK_CONFIRMAR":
    if (isYes(mensaje)) {
      reply =
        "¿Cómo preferís recibir tu cotización de prueba?\n\nRespondé: **gmail**, **telegram** o **ambos**";
      sess.step = "ASK_MEDIO";
    } else if (isNo(mensaje)) {
      reply = "Entendido. Gracias por contactarnos. ¡Que tengas un buen día!";
      sess.step = "DONE";
      done = true;
    } else {
      reply = "Respondé **sí** si querés cotizar, o **no** si no es así.";
    }
    break;

  case "ASK_MEDIO":
    if (lower.includes("ambos") || (lower.includes("gmail") && lower.includes("telegram"))) {
      medio = "ambos";
      reply =
        "✅ Listo. Recibirás tu cotización por correo y por Telegram en unos momentos. ¡Gracias!";
      done = true;
    } else if (lower.includes("gmail") || lower.includes("correo") || lower.includes("mail")) {
      medio = "gmail";
      reply = "✅ Listo. Recibirás tu cotización por correo electrónico. ¡Gracias!";
      done = true;
    } else if (lower.includes("telegram") || lower.includes("tg")) {
      medio = "telegram";
      reply = "✅ Listo. Te enviamos el resumen por Telegram. ¡Gracias!";
      done = true;
    } else {
      reply = "Escribí **gmail**, **telegram** o **ambos**.";
      break;
    }
    sess.data.medio = medio;
    sess.step = "DONE";
    break;

  case "DONE":
    reply = "Si necesitás otra cotización, escribí **hola** para empezar de nuevo.";
    break;

  default:
    reply = "Escribí **hola** para comenzar.";
    sess.step = "INIT";
}

S[sessionId] = sess;

const cotizacionNumero = "COT-" + Date.now().toString().slice(-8);
const fechaActual = new Date().toLocaleDateString("es-CO", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "long",
  day: "numeric"
});

const nombre = sess.data.nombre || "";
const whatsapp = sess.data.whatsapp || "";
const email = sess.data.email || "";
const peticion = sess.data.peticion || "";

const cotizacion = {
  numero: cotizacionNumero,
  fecha: fechaActual,
  producto:
    "Casetón estándar (referencia 2,5 m × 2,5 m × 2,5 m) — cotización de prueba",
  precio: "$ 450.000 COP (orientativo, sujeto a validación comercial)",
  vigencia: "30 días"
};

const output = {
  reply,
  sessionId,
  done,
  nombre,
  whatsapp,
  email,
  peticion,
  medio: medio || sess.data.medio || "",
  cotizacion,
  associateSlug: String(merged.associateSlug || "casetodo-carlos-ruiz"),
  channel: String(merged.channel || "web_chat_rag"),
  suggestedActions: [],
  pasoActual: sess.step,
  metadata: {
    ...(merged.metadata && typeof merged.metadata === "object" ? merged.metadata : {}),
    pasoActual: sess.step
  }
};

let enviarEmail = false;
let enviarTelegram = false;
if (done && medio) {
  enviarEmail = medio === "gmail" || medio === "ambos";
  enviarTelegram = medio === "telegram" || medio === "ambos";
}
output.enviarEmail = enviarEmail;
output.enviarTelegram = enviarTelegram;

function escHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

if (enviarEmail && email) {
  output.emailHtml =
    "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"/></head><body style=\"font-family:Arial,sans-serif;line-height:1.6;color:#333;\">" +
    "<div style=\"max-width:600px;margin:0 auto;padding:20px;\">" +
    "<div style=\"text-align:center;border-bottom:2px solid #e0a800;padding-bottom:10px;\">" +
    "<h1 style=\"color:#e0a800;margin:0;\">Casetodo Carlos Ruiz</h1>" +
    "<p style=\"color:#666;\">casetones para construcción | Colombia</p></div>" +
    "<p>Hola <strong>" +
    escHtml(nombre) +
    "</strong>,</p>" +
    "<p>Gracias por tu interés. Detalle de tu cotización de prueba:</p>" +
    "<table style=\"width:100%;border-collapse:collapse;margin:15px 0;\">" +
    "<tr><th style=\"padding:10px;border:1px solid #ddd;background:#f5f5f5;width:40%;\">N° Cotización</th><td style=\"padding:10px;border:1px solid #ddd;\"><strong>" +
    escHtml(cotizacion.numero) +
    "</strong></td></tr>" +
    "<tr><th style=\"padding:10px;border:1px solid #ddd;\">Fecha</th><td style=\"padding:10px;border:1px solid #ddd;\">" +
    escHtml(cotizacion.fecha) +
    "</td></tr>" +
    "<tr><th style=\"padding:10px;border:1px solid #ddd;\">Producto</th><td style=\"padding:10px;border:1px solid #ddd;\">" +
    escHtml(cotizacion.producto) +
    "</td></tr>" +
    "<tr><th style=\"padding:10px;border:1px solid #ddd;\">Valor total</th><td style=\"padding:10px;border:1px solid #ddd;color:#e0a800;font-weight:bold;\">" +
    escHtml(cotizacion.precio) +
    "</td></tr>" +
    "<tr><th style=\"padding:10px;border:1px solid #ddd;\">Vigencia</th><td style=\"padding:10px;border:1px solid #ddd;\">" +
    escHtml(cotizacion.vigencia) +
    "</td></tr>" +
    "<tr><th style=\"padding:10px;border:1px solid #ddd;\">WhatsApp</th><td style=\"padding:10px;border:1px solid #ddd;\">" +
    escHtml(whatsapp) +
    "</td></tr></table>" +
    "<p><strong>Tu solicitud:</strong> «" +
    escHtml(peticion) +
    "»</p>" +
    "<p>Un asesor comercial puede contactarte para confirmar disponibilidad.</p>" +
    "<p>¡Gracias por confiar en Casetodo Carlos Ruiz!</p>" +
    "<hr/><p style=\"font-size:12px;color:#666;\">Mensaje automático de cotización de prueba.</p></div></body></html>";
}

if (enviarTelegram) {
  output.telegramText = [
    "Casetodo Carlos Ruiz — cotización de prueba",
    "",
    "Hola " + nombre + ",",
    "",
    "N° " + cotizacion.numero,
    "Fecha: " + cotizacion.fecha,
    "Producto: " + cotizacion.producto,
    "Valor: " + cotizacion.precio,
    "Vigencia: " + cotizacion.vigencia,
    "WhatsApp: " + whatsapp,
    "Email: " + email,
    "",
    "Tu solicitud: " + peticion,
    "",
    "Un asesor te contactará pronto. ¡Gracias!"
  ].join("\n");
}

return [{ json: output }];
