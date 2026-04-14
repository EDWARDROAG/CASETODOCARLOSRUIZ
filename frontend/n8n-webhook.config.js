/**
 * ======================================================
 * ARCHIVO: n8n-webhook.config.js
 * UBICACIÓN: frontend/ (proyecto independiente: Ideas HTML / associates)
 * VERSIÓN: 1.7 — URL RAG Magnus AI para GitHub Pages (test)
 * ÚLTIMA ACTUALIZACIÓN: 2026-04-12 12:10
 *
 * 🎯 PROPÓSITO:
 * Centralizar la URL del nodo Webhook (modo POST, JSON) en n8n.
 * El mismo webhook recibe JSON con phase: "structure" o "submit".
 * En la copia independiente: dev-server.mjs (raíz) reenvía a N8N_WEBHOOK_URL (.env).
 * En GitHub Pages (p. ej. /CASETODOCARLOSRUIZ/) no existe /api: usá N8N_WEBHOOK_URL_PRODUCTION y/o N8N_RAG_WEBHOOK_URL_PRODUCTION abajo.
 * En soluciones-lamakinet-app suele usarse el proxy del backend global
 * (/api/public/associates/casetodo/n8n-lead); aquí usamos /api/n8n-lead.
 * Nunca uses la URL del editor (/workflow/...?projectId=...).
 *
 * ======================================================
 * 📋 REGLAS PARA PRODUCCIÓN:
 * ---
 * - Console marcados con // @strip se eliminan en build para cliente
 * - Esta cabecera se elimina en versión para cliente
 *
 * ======================================================
 * 📋 HISTORIAL DE CAMBIOS:
 * ---
 * [1.7] - 2026-04-12 12:10
 * ✅ N8N_RAG_WEBHOOK_URL_PRODUCTION apuntando a webhook Production casetodo-rag-chat (Magnus AI)
 * [1.6] - 2026-04-11 22:55
 * ✅ ragWebhookUrl (RAG phase chat) con N8N_RAG_WEBHOOK_URL_PRODUCTION en GitHub Pages; twoPhaseSubmit por defecto false en main.js
 * [1.5] - 2026-04-11 16:45
 * ✅ Detección edwardroag.github.io + path CASETODOCARLOSRUIZ → webhook HTTPS (constante editable)
 * [1.4] - 2026-04-11 19:15
 * ✅ Nota de sincronización con plantilla associates/ en soluciones-lamakinet-app
 *
 * [1.3] - 2026-04-10 23:55
 * ✅ Proyecto independiente: proxy /api/n8n-lead (dev-server.mjs en la raíz)
 *
 * [1.2] - 2026-04-10 23:35
 * ✅ webhookUrl alternativo: proxy Lamakinet /api/public/associates/casetodo/n8n-lead
 *
 * [1.1] - 2026-04-10 22:15
 * ✅ Opciones twoPhaseSubmit y speechLang
 *
 * [1.0] - 2026-04-10 20:30
 * ✅ Configuración inicial para modal → n8n
 * ======================================================
 */

(function defineN8nWebhookConfig() {
  /**
   * URL del webhook n8n en **producción** (modo Production del nodo Webhook).
   * Ejemplo: https://n8n.tu-dominio.com/webhook/casetodo-lead-modal
   * Dejala vacía hasta tener la URL; en GitHub Pages el asistente mostrará el aviso de “no activo”.
   */
  var N8N_WEBHOOK_URL_PRODUCTION = "https://n8n.platform.magnusai.co/webhook-test/casetodo-web-chat-v2";

  /**
   * GitHub Pages: URL que ve el navegador. Si n8n bloquea CORS, no uses la URL directa de n8n:
   * desplegá el Worker en `cloudflare-worker-rag-cors-proxy.js` y pegá aquí la URL https del Worker.
   * O pedí a Magnus que permitan origen https://edwardroag.github.io en el proxy de n8n.
   */
  var N8N_RAG_WEBHOOK_URL_PRODUCTION =
    "https://n8n.platform.magnusai.co/webhook-test/casetodo-web-chat-v2";

  function resolveWebhookUrl() {
    try {
      
      var host = (window.location && window.location.hostname) || "";
      var path = ((window.location && window.location.pathname) || "").toLowerCase();
      var onCasetodoGithubPages =
        host === "edwardroag.github.io" && path.indexOf("casetodocarlosruiz") !== -1;
      if (onCasetodoGithubPages) {
        var u = String(N8N_WEBHOOK_URL_PRODUCTION || "").trim();
        if (u && /^https?:\/\//i.test(u)) {
          return u;
        }
        return "";
      }
    } catch (e) {
      void e;
    }
    return "/api/n8n-lead";
  }

  function resolveRagWebhookUrl() {
    try {
      var host = (window.location && window.location.hostname) || "";
      var path = ((window.location && window.location.pathname) || "").toLowerCase();
      /** Mismo origen: dev-server reenvía a n8n (sin CORS). Requiere .env N8N_RAG_WEBHOOK_URL + npm run dev */
      if (host === "127.0.0.1" || host === "localhost") {
        return "/api/n8n-rag";
      }
      var onCasetodoGithubPages =
        host === "edwardroag.github.io" && path.indexOf("casetodocarlosruiz") !== -1;
      if (onCasetodoGithubPages) {
        var r = String(N8N_RAG_WEBHOOK_URL_PRODUCTION || "").trim();
        if (r && /^https?:\/\//i.test(r)) {
          return r;
        }
        return "";
      }
    } catch (e2) {
      void e2;
    }
    return "";
  }

  window.CASETODO_N8N = {
    /** Local: proxy dev-server → .env | GitHub Pages: N8N_WEBHOOK_URL_PRODUCTION */
    webhookUrl: resolveWebhookUrl(),

    /** Chat con guía PDF (n8n phase chat). GitHub Pages: N8N_RAG_WEBHOOK_URL_PRODUCTION */
    ragWebhookUrl: resolveRagWebhookUrl(),

    /** Identificador fijo para que n8n filtre por asociado. */
    associateSlug: "casetodo-carlos-ruiz",

    /** Origen lógico del evento (aparece en el JSON enviado). */
    channel: "web_modal_requerimiento",

    /** Si es true: structure y luego submit automático (sin botones en UI). */
    twoPhaseSubmit: false,

    /** Idioma para el micrófono (dictado en el navegador). */
    speechLang: "es-CO"
  };
})();
