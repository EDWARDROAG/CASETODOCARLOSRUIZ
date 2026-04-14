// n8n-webhook.config.js - MODULO GENERICO
(function defineN8nWebhookConfig() {
  // URL del webhook en n8n (produccion)
  var N8N_WEBHOOK_URL_PRODUCTION = "https://n8n.platform.magnusai.co/webhook-test/casetodo-web-chat-v2";

  // URL para chat RAG
  var N8N_RAG_WEBHOOK_URL_PRODUCTION = "https://n8n.platform.magnusai.co/webhook-test/casetodo-web-chat-v2";

  function resolveWebhookUrl() {
    try {
      var host = (window.location && window.location.hostname) || "";
      if (host === "127.0.0.1" || host === "localhost") return "/api/n8n-lead";
      return N8N_WEBHOOK_URL_PRODUCTION;
    } catch (e) {
      return "";
    }
  }

  function resolveRagWebhookUrl() {
    try {
      var host = (window.location && window.location.hostname) || "";
      if (host === "127.0.0.1" || host === "localhost") return "/api/n8n-rag";
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

