/**
 * ======================================================
 * ARCHIVO: n8n-webhook.config.js
 * UBICACIÓN: frontend/ (proyecto independiente: Ideas HTML / associates)
 * VERSIÓN: 1.5 — GitHub Pages: webhook absoluto; local sigue en /api/n8n-lead
 * ÚLTIMA ACTUALIZACIÓN: 2026-04-11 16:45
 *
 * 🎯 PROPÓSITO:
 * Centralizar la URL del nodo Webhook (modo POST, JSON) en n8n.
 * El mismo webhook recibe JSON con phase: "structure" o "submit".
 * En la copia independiente: dev-server.mjs (raíz) reenvía a N8N_WEBHOOK_URL (.env).
 * En GitHub Pages (p. ej. /CASETODOCARLOSRUIZ/) no existe /api: usá N8N_WEBHOOK_URL_PRODUCTION abajo.
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
  var N8N_WEBHOOK_URL_PRODUCTION = "";

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

  window.CASETODO_N8N = {
    /** Local: proxy dev-server → .env | GitHub Pages: N8N_WEBHOOK_URL_PRODUCTION */
    webhookUrl: resolveWebhookUrl(),

    /** Identificador fijo para que n8n filtre por asociado. */
    associateSlug: "casetodo-carlos-ruiz",

    /** Origen lógico del evento (aparece en el JSON enviado). */
    channel: "web_modal_requerimiento",

    /** Si es true: primero "Organizar" (phase structure), luego confirmar y enviar (submit). */
    twoPhaseSubmit: true,

    /** Idioma para el micrófono (dictado en el navegador). */
    speechLang: "es-CO"
  };
})();
