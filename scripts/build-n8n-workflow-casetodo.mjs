import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const src = path.join(
  "C:",
  "Users",
  "ADMIN",
  "Downloads",
  "Casetodo — Web chat OpenAI + cotizador.json"
);
const dst = path.join(root, "frontend", "n8n-workflow-casetodo-web-chat-openai-cotizador.json");

const JS_NORMALIZAR = `const item = $input.first().json;
const body = item.body && typeof item.body === "object" ? item.body : {};

function pickMensaje(b, it) {
  const m1 = b.mensaje ?? it.mensaje;
  if (m1 != null && String(m1).trim()) return String(m1).trim();
  const o = b.mensajeOriginal ?? it.mensajeOriginal;
  const s = b.structuredMensaje ?? it.structuredMensaje;
  const parts = [o, s].filter((x) => x != null && String(x).trim());
  if (parts.length) return parts.map((x) => String(x).trim()).join("\\n\\n");
  const m2 = b.message ?? it.message;
  if (m2 != null && String(m2).trim()) return String(m2).trim();
  const t = b.text ?? it.text;
  if (t != null && String(t).trim()) return String(t).trim();
  return "";
}

const mensaje = pickMensaje(body, item);

let conversation = [];
if (Array.isArray(body.conversation)) conversation = body.conversation;
else if (Array.isArray(item.conversation)) conversation = item.conversation;

let phase = "chat";
if (body.phase != null && String(body.phase).trim()) phase = String(body.phase).trim();
else if (item.phase != null && String(item.phase).trim()) phase = String(item.phase).trim();
phase = (phase || "chat").toLowerCase();

const metadata =
  body.metadata && typeof body.metadata === "object"
    ? body.metadata
    : item.metadata && typeof item.metadata === "object"
      ? item.metadata
      : {};

const ragSessionId =
  metadata.ragSessionId != null && String(metadata.ragSessionId).trim() !== ""
    ? String(metadata.ragSessionId).trim()
    : "";

const channel = String(
  body.channel ||
    item.channel ||
    (phase === "chat" ? "web_chat_rag" : "web_modal_requerimiento")
);

const clientConfirmed = Boolean(body.clientConfirmed ?? item.clientConfirmed ?? false);

const mensajeOriginal =
  body.mensajeOriginal != null
    ? String(body.mensajeOriginal)
    : item.mensajeOriginal != null
      ? String(item.mensajeOriginal)
      : "";
const structuredMensaje =
  body.structuredMensaje != null
    ? String(body.structuredMensaje)
    : item.structuredMensaje != null
      ? String(item.structuredMensaje)
      : "";

return [
  {
    json: {
      associateSlug: String(body.associateSlug || item.associateSlug || "casetodo-carlos-ruiz"),
      channel,
      mensaje,
      mensajeOriginal,
      structuredMensaje,
      mensajeSource: String(body.mensajeSource || item.mensajeSource || "texto"),
      conversation,
      phase,
      metadata,
      ragSessionId,
      clientConfirmed,
      nombre: "",
      telefono: "",
      email: "",
      telegramId: "",
      pasoActual: "inicio"
    }
  }
];`;

const JS_PREPARAR_ENVIO = `const j = $input.first().json;
const parts = [j.mensajeOriginal, j.structuredMensaje, j.mensaje].filter(
  (x) => x != null && String(x).trim() !== ""
);
const combined = parts.length
  ? parts.map((s) => String(s).trim()).join("\\n\\n")
  : String(j.mensaje || "").trim();
return [
  {
    json: {
      ...j,
      phase: "submit",
      mensaje: combined,
      iaReply: "",
      wantsQuote: true,
      lead: {
        nombre: j.nombre || "",
        telefono: j.telefono || "",
        email: j.email || ""
      }
    }
  }
];`;

const JS_CONSTRUIR = `const d = $input.first().json;
return [{ json: { ...d, conversation: Array.isArray(d.conversation) ? d.conversation : [] } }];`;

const JS_PARSEAR = `const prev = $('Construir prompt OpenAI').first().json;
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

const reply =
  extractAgentText(api) || "No pude generar respuesta en este momento.";
const texto = (String(prev.mensaje || "") + String(reply || "")).toLowerCase();
const wantsQuote = /(cotiz|cotizacion|cotizar|precio|valor|presupuesto)/i.test(texto);

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

const SYSTEM_CASETODO = `Eres el asistente comercial de Casetodo Carlos Ruiz (venta y alquiler de casetones para obra en Colombia).

Reglas:
- Saluda breve y pregunta en qué puedes ayudar.
- NO inventes precios: el asesor comercial confirmará valores y disponibilidad.
- Si piden cotización o precio, pide datos de a uno: nombre, teléfono, email, ciudad y qué necesitan (tipo de casetón, cantidad aproximada si la saben).
- Respuestas cortas (máximo 4 oraciones). Español natural.
- No hables de otros negocios, productos de software ni marcas que no sean Casetodo / casetones.`;

if (!fs.existsSync(src)) {
  console.error("No existe el archivo fuente:", src);
  process.exit(1);
}

const w = JSON.parse(fs.readFileSync(src, "utf8"));

const normNode = w.nodes.find((n) => n.name === "Normalizar entrada");
if (normNode) normNode.parameters.jsCode = JS_NORMALIZAR;

const cons = w.nodes.find((n) => n.name === "Construir prompt OpenAI");
if (cons) cons.parameters.jsCode = JS_CONSTRUIR;

const par = w.nodes.find((n) => n.name === "Parsear respuesta IA");
if (par) par.parameters.jsCode = JS_PARSEAR;

w.nodes = w.nodes.filter((n) => n.id !== "0747d632-15e3-4999-839a-23a09f4bb578");

const ifPhaseChat = {
  parameters: {
    conditions: {
      options: {
        caseSensitive: true,
        leftValue: "",
        typeValidation: "strict",
        version: 2
      },
      conditions: [
        {
          id: "phase-eq-chat",
          leftValue: "={{ $json.phase }}",
          rightValue: "chat",
          operator: {
            type: "string",
            operation: "equals"
          }
        }
      ],
      combinator: "and"
    },
    options: {}
  },
  id: "f1f2f3f4-a5b6-4789-c012-ifphasechat01",
  name: "IF fase chat",
  type: "n8n-nodes-base.if",
  typeVersion: 2.2,
  position: [-1800, 200]
};

const ifPhaseSubmit = {
  parameters: {
    conditions: {
      options: {
        caseSensitive: true,
        leftValue: "",
        typeValidation: "strict",
        version: 2
      },
      conditions: [
        {
          id: "phase-eq-submit-01",
          leftValue: "={{ $json.phase }}",
          rightValue: "submit",
          operator: {
            type: "string",
            operation: "equals"
          }
        }
      ],
      combinator: "and"
    },
    options: {}
  },
  id: "d0e1f2a3-b4c5-4678-9012-submitif01",
  name: "IF fase submit",
  type: "n8n-nodes-base.if",
  typeVersion: 2.2,
  position: [-1664, 352]
};

const prepararEnvioEquipo = {
  parameters: {
    jsCode: JS_PREPARAR_ENVIO
  },
  id: "c9d8e7f6-a5b4-4321-0fed-prepar01",
  name: "Preparar envio equipo",
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [-1488, 288]
};

w.nodes = w.nodes.filter(
  (n) =>
    n.id !== ifPhaseChat.id &&
    n.id !== ifPhaseSubmit.id &&
    n.id !== prepararEnvioEquipo.id
);
w.nodes.push(ifPhaseChat, ifPhaseSubmit, prepararEnvioEquipo);

const agent = w.nodes.find((n) => n.name === "AI Agent");
if (agent) {
  agent.parameters.promptType = "define";
  agent.parameters.text = "={{ $json.mensaje }}";
  agent.parameters.options = agent.parameters.options || {};
  agent.parameters.options.systemMessage = SYSTEM_CASETODO;
  agent.parameters.options.maxIterations = 5;
  agent.parameters.options.returnIntermediateSteps = false;
}

const rw = w.nodes.find((n) => n.name === "Responder web");
if (rw) {
  rw.parameters.responseBody =
    "={{ ({ ok: true, reply: $json.iaReply || '', message: $json.phase === 'submit' ? '¡Listo! Ya quedó en manos del equipo; pronto te contactan.' : '', phase: $json.phase, wantsQuote: !!$json.wantsQuote }) }}";
}

const errPhase = w.nodes.find((n) => n.name === "Responder error phase");
if (errPhase) {
  errPhase.parameters.responseBody =
    '={{ { ok: false, error: \'phase_invalida\', hint: \'Usa phase "chat" (modal asistente) o phase "submit" (envio al equipo).\', recibido: $json.phase } }}';
}

w.connections["Normalizar entrada"] = {
  main: [[{ node: "IF fase chat", type: "main", index: 0 }]]
};

w.connections["IF fase chat"] = {
  main: [
    [{ node: "Construir prompt OpenAI", type: "main", index: 0 }],
    [{ node: "IF fase submit", type: "main", index: 0 }]
  ]
};

w.connections["IF fase submit"] = {
  main: [
    [{ node: "Preparar envio equipo", type: "main", index: 0 }],
    [{ node: "Responder error phase", type: "main", index: 0 }]
  ]
};

w.connections["Preparar envio equipo"] = {
  main: [[{ node: "Procesar cotizacion", type: "main", index: 0 }]]
};

w.connections["Construir prompt OpenAI"] = {
  main: [[{ node: "AI Agent", type: "main", index: 0 }]]
};

w.connections["AI Agent"] = {
  main: [[{ node: "Parsear respuesta IA", type: "main", index: 0 }]]
};

delete w.connections.if;

w.connections["Responder error phase"] = { main: [[]] };

fs.writeFileSync(dst, JSON.stringify(w, null, 2), "utf8");
console.log("Escrito:", dst);
