// n8n-webhook.config.js - PARA PRODUCCIÓN CON MAGNUS AI
(function defineN8nWebhookConfig() {
  // URL del webhook en n8n (Magnus AI)
  var N8N_WEBHOOK_URL_PRODUCTION = "https://n8n.platform.magnusai.co/webhook-test/casetodo-web-chat-v2";

  // Misma URL para el chat RAG
  var N8N_RAG_WEBHOOK_URL_PRODUCTION = "https://n8n.platform.magnusai.co/webhook-test/casetodo-web-chat-v2";

  function resolveWebhookUrl() {
    try {
      var host = (window.location && window.location.hostname) || "";
      var path = ((window.location && window.location.pathname) || "").toLowerCase();
      var onCasetodoGithubPages = host === "edwardroag.github.io" && path.indexOf("casetodocarlosruiz") !== -1;

      if (onCasetodoGithubPages) {
        var u = String(N8N_WEBHOOK_URL_PRODUCTION || "").trim();
        if (u && /^https?:\/\//i.test(u)) {
          return u;
        }
        return "";
      }

      // Para desarrollo local
      if (host === "127.0.0.1" || host === "localhost") {
        return "/api/n8n-lead";
      }

      return N8N_WEBHOOK_URL_PRODUCTION;
    } catch (e) {
      return "";
    }
  }

  function resolveRagWebhookUrl() {
    try {
      var host = (window.location && window.location.hostname) || "";
      var path = ((window.location && window.location.pathname) || "").toLowerCase();

      if (host === "127.0.0.1" || host === "localhost") {
        return "/api/n8n-rag";
      }

      var onCasetodoGithubPages = host === "edwardroag.github.io" && path.indexOf("casetodocarlosruiz") !== -1;
      if (onCasetodoGithubPages) {
        var r = String(N8N_RAG_WEBHOOK_URL_PRODUCTION || "").trim();
        if (r && /^https?:\/\//i.test(r)) {
          return r;
        }
        return "";
      }

      return N8N_RAG_WEBHOOK_URL_PRODUCTION;
    } catch (e2) {
      return "";
    }
  }

  window.CASETODO_N8N = {
    webhookUrl: resolveWebhookUrl(),
    ragWebhookUrl: resolveRagWebhookUrl(),
    associateSlug: "casetodo-carlos-ruiz",
    channel: "web_chat_rag",
    twoPhaseSubmit: false,
    speechLang: "es-CO"
  };
})();
