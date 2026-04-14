/**
 * Nodo: Tras generar PDF (binario), define si se envía por correo y/o Telegram según pendingPdf.
 * Reenvía el binario del PDF sin modificarlo.
 */
const item = $input.first();
const j = item.json || {};
const bin = item.binary || {};
const sid = String(j._pdfSid || j.ragSessionId || "anon").trim();
const G = $getWorkflowStaticData("global");
const pend = (G.pendingPdf && G.pendingPdf[sid]) || {};
const por = String(pend.enviarPor || "").toLowerCase();

const sendMail = por === "correo" || por === "ambos";
const sendTg = por === "telegram" || por === "ambos";

return [
  {
    json: {
      ...j,
      sendMail,
      sendTg,
      clienteEmail: String(pend.clienteEmail || "").trim(),
      pdfFileName: String(pend.fileName || j.pdfFileName || "cotizacion.pdf"),
      iaReply: String(pend.iaReply || j.iaReply || "").trim(),
      _pdfSid: sid
    },
    binary: bin
  }
];
