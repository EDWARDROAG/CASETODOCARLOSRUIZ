/**
 * Nodo: Code generar HTML (cotización para PDF)
 * Sustituye placeholders; bloques condicionales sin Handlebars (if manual).
 */
const j = $input.first().json;
const sid = String(j._pdfSid || j.ragSessionId || "anon").trim();
const G = $getWorkflowStaticData("global");
const pend = (G.pendingPdf && G.pendingPdf[sid]) || {};
const sess = pend.sess || {};
const d = sess.data || {};
const de = sess.datosEspecificos || {};
const c = sess.cotizacion || {};

const quoteNumber = "CT-" + String(sid).slice(0, 8) + "-" + String(Date.now()).slice(-6);
const fecha = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });

let direccion =
  sess.tipoPersona === "empresa"
    ? String(de.direccionEmpresa || "").trim()
    : String(de.direccion || "").trim();

let bloqueDocumento = "";
if (sess.tipoPersona === "natural" && de.documento) {
  bloqueDocumento =
    "<p><strong>Documento:</strong> " +
    String(de.documento).replace(/</g, "") +
    "</p>";
}

let bloqueEmpresa = "";
if (sess.tipoPersona === "empresa" && (de.nombreEmpresa || de.nit)) {
  bloqueEmpresa =
    "<p><strong>Empresa:</strong> " +
    String(de.nombreEmpresa || "").replace(/</g, "") +
    " | <strong>NIT:</strong> " +
    String(de.nit || "").replace(/</g, "") +
    "</p>";
}

const tipoCaseton = String(c.tipoCaseton || "").replace(/</g, "");
const medidas = String(c.medidas || "").replace(/</g, "");
const precioUnitario = Math.round(Number(c.precioUnitarioM2) || 0).toLocaleString("es-CO");
const precioTotal = Math.round(Number(c.precioCalculado) || pend.precioTotal || 0).toLocaleString("es-CO");

const html =
  "<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"UTF-8\"/><title>Cotización</title></head><body style=\"font-family:Arial,sans-serif;padding:40px;\">" +
  "<div style=\"text-align:center;margin-bottom:30px;\"><h1>Casetodo Carlos Ruiz</h1><p>casetones para construcción | Colombia</p></div>" +
  "<div style=\"margin-bottom:30px;\"><h2>Cotización #" +
  quoteNumber +
  "</h2><p>Fecha: " +
  fecha +
  "</p></div>" +
  "<div style=\"margin-bottom:30px;\"><h3>Datos del cliente</h3>" +
  "<p><strong>Nombre:</strong> " +
  String(d.nombre || "").replace(/</g, "") +
  "</p>" +
  bloqueDocumento +
  bloqueEmpresa +
  "<p><strong>Dirección:</strong> " +
  direccion.replace(/</g, "") +
  "</p>" +
  "<p><strong>Teléfono:</strong> " +
  String(d.telefono || "").replace(/</g, "") +
  " | <strong>Email:</strong> " +
  String(d.email || "").replace(/</g, "") +
  "</p>" +
  "<p><strong>Ciudad:</strong> " +
  String(d.ciudad || "").replace(/</g, "") +
  "</p></div>" +
  "<div style=\"margin-bottom:30px;\"><h3>Detalle de la cotización</h3>" +
  "<table style=\"width:100%;border-collapse:collapse;\">" +
  "<tr style=\"background:#f0f0f0;\">" +
  "<th style=\"padding:10px;border:1px solid #ddd;\">Producto</th>" +
  "<th style=\"padding:10px;border:1px solid #ddd;\">Medidas</th>" +
  "<th style=\"padding:10px;border:1px solid #ddd;\">Valor unitario (m²)</th>" +
  "<th style=\"padding:10px;border:1px solid #ddd;\">Total</th></tr>" +
  "<tr><td style=\"padding:10px;border:1px solid #ddd;\">Casetón " +
  tipoCaseton +
  "</td><td style=\"padding:10px;border:1px solid #ddd;\">" +
  medidas +
  "</td><td style=\"padding:10px;border:1px solid #ddd;\">" +
  precioUnitario +
  " COP</td><td style=\"padding:10px;border:1px solid #ddd;\">" +
  precioTotal +
  " COP</td></tr></table></div>" +
  "<div style=\"margin-top:40px;font-size:12px;color:#666;\">" +
  "<p>Esta cotización tiene una vigencia de 30 días. Para aceptarla, contactá a nuestro equipo comercial.</p>" +
  "<p>¡Gracias por confiar en Casetodo Carlos Ruiz!</p></div></body></html>";

pend.html = html;
pend.quoteNumber = quoteNumber;
G.pendingPdf[sid] = pend;

const buf = Buffer.from(html, "utf8");

const iaReply = String(pend.iaReply || j.iaReply || "").trim();

return [
  {
    json: {
      ...j,
      html,
      pdfFileName: pend.fileName || "cotizacion.pdf",
      iaReply,
      ragSessionId: sid,
      _pdfSid: sid
    },
    binary: {
      index_html: {
        data: buf.toString("base64"),
        mimeType: "text/html",
        fileExtension: "html",
        fileName: "index.html"
      }
    }
  }
];
