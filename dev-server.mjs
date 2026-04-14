/**
 * ======================================================
 * ARCHIVO: dev-server.mjs
 * UBICACIÓN: associates/casetodo-carlos-ruiz/ (raíz)
 * VERSIÓN: 1.6 — RAG Magnus casetodo-web-chat-v2: Production en .env → Test al arrancar (opt-out)
 * ÚLTIMA ACTUALIZACIÓN: 2026-04-13
 *
 * 🎯 PROPÓSITO:
 * Sirve frontend/ y reenvía POST al webhook n8n. No uses Live Server en el mismo
 * puerto: solo "npm run dev" desde esta raíz.
 *
 * ======================================================
 * 📋 HISTORIAL DE CAMBIOS:
 * ---
 * [1.6] - 2026-04-13
 * ✅ RAG: si .env tiene Production …/webhook/casetodo-web-chat-v2 (Magnus), usar Test al arrancar salvo N8N_RAG_PREFER_PRODUCTION=1
 *
 * [1.5] - 2026-04-13
 * ✅ RAG: si …/webhook/… responde 404, un POST de respaldo a …/webhook-test/… (mismo path)
 *
 * [1.4] - 2026-04-12 15:30
 * ✅ server.on('error') EADDRINUSE; logs de unhandledRejection (no deberían matar el proceso)
 * [1.3] - 2026-04-12 14:05
 * ✅ POST /api/n8n-rag → N8N_RAG_WEBHOOK_URL (mismo cuerpo JSON que el navegador enviaría a n8n)
 * [1.2] - 2026-04-11 01:10
 * ✅ Rutas API bajo express.Router; GET /api/health para verificar que es este servidor
 *
 * [1.1] - 2026-04-11 00:15
 * ✅ Dos paths de proxy
 * ======================================================
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const N8N_WEBHOOK_URL = String(process.env.N8N_WEBHOOK_URL || '').trim();
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const UPSTREAM_TIMEOUT_MS = 28000;

/** n8n: sin workflow Active, …/webhook/… suele 404; …/webhook-test/… puede seguir respondiendo. */
let ragProduction404FallbackNotified = false;

function toN8nWebhookTestUrl(primaryUrl) {
  const s = String(primaryUrl || '').trim();
  if (!s) return '';
  try {
    const u = new URL(s);
    if (u.pathname.startsWith('/webhook-test/')) return '';
    if (!u.pathname.startsWith('/webhook/')) return '';
    u.pathname = u.pathname.replace(/^\/webhook\//, '/webhook-test/');
    return u.toString();
  } catch {
    return '';
  }
}

/**
 * Magnus: …/webhook/casetodo-web-chat-v2 suele 404 hasta activar el workflow; Test responde con el mismo path.
 * Forzar Production solo con N8N_RAG_PREFER_PRODUCTION=1 en .env.
 */
function resolveN8nRagWebhookUrl(rawEnv) {
  const raw = String(rawEnv ?? '').trim();
  if (!raw) return raw;
  if (String(process.env.N8N_RAG_PREFER_PRODUCTION || '').trim() === '1') return raw;
  try {
    const u = new URL(raw);
    const p = (u.pathname || '').replace(/\/+$/, '') || u.pathname;
    if (u.hostname === 'n8n.platform.magnusai.co' && p === '/webhook/casetodo-web-chat-v2') {
      const t = toN8nWebhookTestUrl(raw);
      if (t) {
        console.warn(
          '[casetodo dev-server] RAG: Production …/webhook/casetodo-web-chat-v2 suele 404 sin workflow Active. Usando Test:',
          t
        ); // @strip
        return t;
      }
    }
  } catch {
    /* ignore */
  }
  return raw;
}

const N8N_RAG_WEBHOOK_URL = resolveN8nRagWebhookUrl(process.env.N8N_RAG_WEBHOOK_URL);

const app = express();
app.use(express.json({ limit: '512kb' }));

async function proxyToN8n(req, res) {
  if (!N8N_WEBHOOK_URL) {
    return res.status(503).json({
      error: 'webhook_no_configurado',
      message:
        'Crea .env en la raíz del asociado con N8N_WEBHOOK_URL= (URL del Webhook en n8n).'
    });
  }

  if (req.body === undefined || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'body_invalido' });
  }

  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), UPSTREAM_TIMEOUT_MS);
    const upstream = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: ac.signal
    });
    clearTimeout(t);

    const raw = await upstream.text();
    const ct = (upstream.headers.get('content-type') || '').toLowerCase();
    res.status(upstream.status);
    if (ct.includes('application/json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    return res.send(raw);
  } catch (err) {
    console.warn('[casetodo dev-server] n8n proxy', err?.message || err); // @strip
    return res.status(502).json({
      error: 'n8n_no_alcanzable',
      message: 'No se pudo contactar el webhook de n8n.'
    });
  }
}

async function proxyToN8nRag(req, res) {
  if (!N8N_RAG_WEBHOOK_URL) {
    return res.status(503).json({
      error: 'rag_webhook_no_configurado',
      message:
        'Añade N8N_RAG_WEBHOOK_URL= en .env con la URL del nodo Webhook del chat RAG (Test o Production, según n8n).'
    });
  }

  if (req.body === undefined || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'body_invalido' });
  }

  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), UPSTREAM_TIMEOUT_MS);
    let upstream = await fetch(N8N_RAG_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: ac.signal
    });
    clearTimeout(t);

    let raw = await upstream.text();

    if (upstream.status === 404) {
      const testUrl = toN8nWebhookTestUrl(N8N_RAG_WEBHOOK_URL);
      if (testUrl) {
        const ac2 = new AbortController();
        const t2 = setTimeout(() => ac2.abort(), UPSTREAM_TIMEOUT_MS);
        try {
          const up2 = await fetch(testUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
            signal: ac2.signal
          });
          clearTimeout(t2);
          if (up2.status !== 404) {
            upstream = up2;
            raw = await up2.text();
            if (!ragProduction404FallbackNotified) {
              ragProduction404FallbackNotified = true;
              console.warn(
                '[casetodo dev-server] n8n RAG: Production (…/webhook/…) devolvió 404; se reenvió a Test:',
                testUrl,
                '| Activá el workflow en n8n (Active) para que la URL de Production deje de fallar.'
              ); // @strip
            }
          }
        } catch {
          clearTimeout(t2);
        }
      }
      if (upstream.status === 404) {
        console.warn(
          '[casetodo dev-server] n8n RAG → 404. Revisá en n8n: workflow Active; URL del nodo (Test vs Production); pegala en .env como N8N_RAG_WEBHOOK_URL. URL:',
          N8N_RAG_WEBHOOK_URL
        ); // @strip
      }
    }
    const ct = (upstream.headers.get('content-type') || '').toLowerCase();
    res.status(upstream.status);
    if (ct.includes('application/json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    return res.send(raw);
  } catch (err) {
    console.warn('[casetodo dev-server] n8n RAG proxy', err?.message || err); // @strip
    return res.status(502).json({
      error: 'n8n_rag_no_alcanzable',
      message: 'No se pudo contactar el webhook RAG de n8n.'
    });
  }
}

const api = express.Router();
api.get('/health', (_req, res) => {
  res.json({
    ok: true,
    server: 'casetodo-dev-server',
    n8nWebhookConfigured: Boolean(N8N_WEBHOOK_URL),
    n8nRagWebhookConfigured: Boolean(N8N_RAG_WEBHOOK_URL),
    postProxyPaths: [
      '/api/n8n-lead',
      '/api/n8n-rag',
      '/api/public/associates/casetodo/n8n-lead'
    ]
  });
});
api.post('/n8n-lead', proxyToN8n);
api.post('/n8n-rag', proxyToN8nRag);
api.post('/public/associates/casetodo/n8n-lead', proxyToN8n);

app.use('/api', api);

app.use(express.static(FRONTEND_DIR, { index: ['index.html'], fallthrough: true }));

process.on('unhandledRejection', (reason) => {
  console.error('[casetodo dev-server] unhandledRejection:', reason); // @strip
});

process.on('uncaughtException', (err) => {
  console.error('[casetodo dev-server] uncaughtException:', err); // @strip
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log('[casetodo] dev-server 1.6'); // @strip
  console.log(`[casetodo] Front + proxy n8n — http://127.0.0.1:${PORT}/`); // @strip
  console.log(`[casetodo] Comprueba: GET http://127.0.0.1:${PORT}/api/health`); // @strip
  console.log(`[casetodo] Proxy POST: /api/n8n-lead, /api/n8n-rag`); // @strip
  if (N8N_RAG_WEBHOOK_URL) {
    console.log('[casetodo] RAG upstream efectivo:', N8N_RAG_WEBHOOK_URL); // @strip
  }
  console.log(`[casetodo] Dejá esta ventana abierta; Ctrl+C para detener.`); // @strip
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(
      `[casetodo dev-server] El puerto ${PORT} ya está en uso. Cerrá el otro "npm run dev" o cambiá PORT en .env.`
    ); // @strip
  } else {
    console.error('[casetodo dev-server] Error al escuchar:', err?.message || err); // @strip
  }
  process.exit(1);
});
