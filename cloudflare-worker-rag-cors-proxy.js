/**
 * ======================================================
 * ARCHIVO: cloudflare-worker-rag-cors-proxy.js
 * UBICACIÓN: associates/produccion/casetodo-carlos-ruiz/
 * VERSIÓN: 1.0 — Worker Cloudflare: CORS + reenvío POST al webhook RAG n8n
 * ÚLTIMA ACTUALIZACIÓN: 2026-04-12 14:10
 *
 * 🎯 PROPÓSITO:
 * GitHub Pages no puede llamar directo a n8n si el servidor no envía
 * Access-Control-Allow-Origin. Este Worker recibe POST del navegador y
 * reenvía el cuerpo al webhook n8n, devolviendo la misma respuesta con CORS.
 *
 * Despliegue rápido (Wrangler v3+):
 * 1. npm create cloudflare@latest -- casetodo-rag-bridge (Worker only) o wrangler init
 * 2. Reemplazar el contenido del handler por este módulo (export default).
 * 3. wrangler deploy
 * 4. Copiar la URL https://….workers.dev y pegarla en n8n-webhook.config.js
 *    como N8N_RAG_WEBHOOK_URL_PRODUCTION (sustituye la URL directa de n8n).
 *
 * ======================================================
 * 📋 HISTORIAL DE CAMBIOS:
 * ---
 * [1.0] - 2026-04-12 14:10
 * ✅ Versión inicial (OPTIONS + POST, origen GitHub Pages fijo)
 * ======================================================
 */

/** Webhook Production n8n (destino real). */
const UPSTREAM_RAG_WEBHOOK =
  "https://n8n.platform.magnusai.co/webhook-test/casetodo-web-chat-v2";

/** Origen del sitio estático (ajustá si cambiás usuario o repo en GitHub Pages). */
const ALLOW_ORIGIN = "https://edwardroag.github.io";

function corsHeaders(extra = {}) {
  return {
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
    ...extra
  };
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "method_not_allowed", reply: "" }), {
        status: 405,
        headers: corsHeaders({ "Content-Type": "application/json; charset=utf-8" })
      });
    }

    const bodyText = await request.text();

    const upstream = await fetch(UPSTREAM_RAG_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyText
    });

    const text = await upstream.text();
    const ct = upstream.headers.get("content-type") || "application/json; charset=utf-8";
    const base = ct.split(";")[0].trim();

    return new Response(text, {
      status: upstream.status,
      headers: corsHeaders({
        "Content-Type": base.includes("application/json")
          ? "application/json; charset=utf-8"
          : `${base}; charset=utf-8`
      })
    });
  }
};
