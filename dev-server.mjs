/**
 * ======================================================
 * ARCHIVO: dev-server.mjs
 * UBICACIÓN: associates/casetodo-carlos-ruiz/ (raíz)
 * VERSIÓN: 1.2 — Router /api aislado + GET /api/health
 * ÚLTIMA ACTUALIZACIÓN: 2026-04-11 01:10
 *
 * 🎯 PROPÓSITO:
 * Sirve frontend/ y reenvía POST al webhook n8n. No uses Live Server en el mismo
 * puerto: solo "npm run dev" desde esta raíz.
 *
 * ======================================================
 * 📋 HISTORIAL DE CAMBIOS:
 * ---
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

const api = express.Router();
api.get('/health', (_req, res) => {
  res.json({
    ok: true,
    server: 'casetodo-dev-server',
    n8nWebhookConfigured: Boolean(N8N_WEBHOOK_URL),
    postProxyPaths: ['/api/n8n-lead', '/api/public/associates/casetodo/n8n-lead']
  });
});
api.post('/n8n-lead', proxyToN8n);
api.post('/public/associates/casetodo/n8n-lead', proxyToN8n);

app.use('/api', api);

app.use(express.static(FRONTEND_DIR, { index: ['index.html'], fallthrough: true }));

app.listen(PORT, () => {
  console.log(`[casetodo] Front + proxy n8n — http://127.0.0.1:${PORT}/`); // @strip
  console.log(`[casetodo] Comprueba: GET http://127.0.0.1:${PORT}/api/health`); // @strip
  console.log(`[casetodo] Proxy POST: /api/n8n-lead`); // @strip
});
