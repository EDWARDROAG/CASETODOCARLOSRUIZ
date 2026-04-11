/**
 * ======================================================
 * ARCHIVO: n8n-webhook.config.js
 * UBICACIÓN: frontend/ (proyecto independiente: Ideas HTML / associates)
 * VERSIÓN: 1.4 — Misma lógica que la plantilla Lamakinet; proxy local /api/n8n-lead
 * ÚLTIMA ACTUALIZACIÓN: 2026-04-11 19:15
 *
 * 🎯 PROPÓSITO:
 * Centralizar la URL del nodo Webhook (modo POST, JSON) en n8n.
 * El mismo webhook recibe JSON con phase: "structure" o "submit".
 * En la copia independiente: dev-server.mjs (raíz) reenvía a N8N_WEBHOOK_URL (.env).
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
  window.CASETODO_N8N = {
    /**
     * Mismo origen: dev-server.mjs (raíz) reenvía a N8N_WEBHOOK_URL en .env
     */
    webhookUrl: "/api/n8n-lead",

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
