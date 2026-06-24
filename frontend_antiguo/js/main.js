/**
 * ======================================================
 * ARCHIVO: main.js
 * UBICACIÓN: associates/casetodo-carlos-ruiz/frontend/js/
 * VERSIÓN: 5.0 - Sin captación en front: solo mensaje + metadata; n8n infiere y guarda historial
 * ÚLTIMA ACTUALIZACIÓN: 2026-04-13
 *
 * 🎯 PROPÓSITO:
 * Gestionar la interacción del sitio de Casetodo Carlos Ruiz.
 * Construye mensajes para WhatsApp desde botones de productos
 * y desde el formulario de requerimientos de cotización.
 * Modal chat (voz o texto): ragWebhookUrl (phase chat) y/o webhookUrl (solo submit con el texto enviado).
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
 * [5.0] - 2026-04-13
 * ✅ Eliminada inferencia intent/contacto en front; submit solo mensaje + metadata. RAG sin `conversation`
 *
 * [4.9] - 2026-04-13
 * ✅ RAG: body solo `mensaje` + `conversation: []` (contexto en n8n); sin two-phase/structure en el chat
 *
 * [4.8] - 2026-04-13
 * ✅ Chat RAG: historial conversation con role assistant + user; metadata.ragSessionId por sesión de modal
 *
 * [4.7] - 2026-04-13
 * ✅ postRagChat: tolera JSON de n8n (reply, output, text, body/json, arrays, choices OpenAI)
 *
 * [4.6] - 2026-04-12 16:40
 * ✅ postRagChat incluye `conversation` (últimos turnos) para orquestación de saludo/datos
 * [4.5] - 2026-04-12 16:05
 * ✅ Texto de ayuda cuando el proxy devuelve 404 desde n8n (Production / workflow activo)
 * [4.4] - 2026-04-12 14:12
 * ✅ postRagChat: metadata gestor (pasoActual, nombre, telefono, email) ↔ n8n; el modal no se cierra entre turnos (solo al enviar al equipo o cerrar).
 * ✅ n8n Gestor: si el primer mensaje no es solo un saludo, se toma como nombre y se pide el teléfono.
 * ✅ postRagChat captura fallos de red/CORS; localhost usa /api/n8n-rag (dev-server)
 * [4.3] - 2026-04-11 22:50
 * ✅ ragWebhookUrl → POST phase chat y burbuja con reply; sin bloque inicial largo; sin botones; twoPhase+webhook envía al equipo tras structure automático
 * [4.2] - 2026-04-11 21:40
 * ✅ Eliminados pie de ayuda, details y casilla; fase 2 en franja mínima; aviso compat. mic como mensaje del bot al intentar usarlo
 * [4.1] - 2026-04-11 20:15
 * ✅ Compositor estilo WhatsApp (campo + mic + envío circular); sin placeholder largo; dictados múltiples concatenan y disparan structure/submit tras pausa
 * [4.0] - 2026-04-12 17:05
 * ✅ UI asistente alineada a vitrina Yaruba: widget fijo, panel is-open, velo, botón lanzador
 * [3.9] - 2026-04-12 14:20
 * ✅ Al abrir modal: aviso explícito si no hay webhookUrl (GitHub sin N8N_WEBHOOK_URL_PRODUCTION o sin n8n-webhook.config.js)
 * [3.8] - 2026-04-12 12:05
 * ✅ Sin paso de casillas: chat visible al abrir; saludo del bot definido en JS (no en n8n); inferencia básica de contacto desde el texto
 *
 * [3.7] - 2026-04-12 11:20
 * ✅ UI del modal: asistente con ícono obra (casco naranja), etiquetas Tú/Asistente, textos más cercanos
 *
 * [3.6] - 2026-04-11 18:30
 * ✅ Modal reformulado como chat (burbujas, compositor, mismas fases n8n)
 *
 * [3.5] - 2026-04-11 17:05
 * ✅ Tras submit OK: si la respuesta JSON trae `message`, se muestra en el modal
 *
 * [3.4] - 2026-04-10 22:20
 * ✅ Micrófono, organizar vía phase structure, confirmar y enviar phase submit
 *
 * [3.3] - 2026-04-10 21:05
 * ✅ Modal de solicitud al equipo (POST JSON a webhook); textos de UI sin “n8n”
 *
 * [3.2] - 2026-04-10 14:22
 * ✅ Se añade rotación automática de imágenes en hero con transición suave
 *
 * [3.1] - 2026-04-10 14:05
 * ✅ Se agregan contadores animados al entrar en viewport
 *
 * [3.0] - 2026-04-09 10:40
 * ✅ Reemplazo total por lógica de formulario y CTA de WhatsApp
 * ======================================================
 */

(function initFrontCasetodo() {
  const WHATSAPP_NUMBER = "573118100228";

  function goWhatsapp(message) {
    const encoded = encodeURIComponent(message.trim());
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, "_blank", "noopener");
  }

  function bindProductButtons() {
    const buttons = document.querySelectorAll(".btn-whatsapp-producto");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const productName = button.getAttribute("data-producto") || "casetones";
        const message = [
          "Hola, estoy interesado en este tipo de caseton:",
          "",
          `- Producto: ${productName}`,
          "",
          "Quedo atento a disponibilidad, precio y condiciones."
        ].join("\n");
        goWhatsapp(message);
      });
    });
  }

  function bindQuoteForm() {
    const form = document.getElementById("quote-form");
    if (!form) return;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);

      const payload = {
        nombre: String(formData.get("nombre") || "").trim(),
        empresa: String(formData.get("empresa") || "").trim(),
        telefono: String(formData.get("telefono") || "").trim(),
        servicio: String(formData.get("servicio") || "").trim(),
        tipoCaseton: String(formData.get("tipoCaseton") || "").trim(),
        cantidad: String(formData.get("cantidad") || "").trim(),
        ciudad: String(formData.get("ciudad") || "").trim(),
        fecha: String(formData.get("fecha") || "").trim(),
        detalles: String(formData.get("detalles") || "").trim()
      };

      const message = [
        "Hola, quiero solicitar una cotizacion de casetones.",
        "",
        `- Nombre: ${payload.nombre}`,
        `- Empresa: ${payload.empresa}`,
        `- Telefono: ${payload.telefono}`,
        `- Servicio: ${payload.servicio}`,
        `- Tipo de caseton: ${payload.tipoCaseton}`,
        `- Cantidad estimada: ${payload.cantidad}`,
        `- Ciudad / Obra: ${payload.ciudad}`,
        `- Fecha requerida: ${payload.fecha}`,
        `- Detalles: ${payload.detalles}`
      ].join("\n");

      goWhatsapp(message);
    });
  }

  function formatCounterValue(value) {
    return value.toLocaleString("es-CO");
  }

  function animateCounter(element) {
    const target = Number(element.getAttribute("data-target") || "0");
    const suffix = element.getAttribute("data-suffix") || "";

    if (!Number.isFinite(target) || target <= 0) {
      element.textContent = `0${suffix}`;
      return;
    }

    const durationMs = 1600;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(target * eased);
      element.textContent = `${formatCounterValue(currentValue)}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  }

  function bindExperienceCounters() {
    const counters = document.querySelectorAll(".stat-counter");
    if (!counters.length) return;

    counters.forEach((counter) => {
      const suffix = counter.getAttribute("data-suffix") || "";
      counter.textContent = `0${suffix}`;
    });

    const section = document.getElementById("experiencia");
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          counters.forEach((counter) => animateCounter(counter));
          currentObserver.disconnect();
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(section);
  }

  function bindHeroBackgroundRotator() {
    const hero = document.getElementById("inicio");
    if (!hero) return;

    const layers = hero.querySelectorAll(".hero-bg-layer");
    if (layers.length < 2) return;

    const backgrounds = [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=1800&q=80",
      "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1800&q=80"
    ];

    let frontLayer = layers[0];
    let backLayer = layers[1];
    let activeIndex = 0;

    frontLayer.style.backgroundImage = `url("${backgrounds[activeIndex]}")`;
    frontLayer.classList.add("is-active");

    function switchBackground() {
      activeIndex = (activeIndex + 1) % backgrounds.length;
      backLayer.style.backgroundImage = `url("${backgrounds[activeIndex]}")`;
      backLayer.classList.add("is-active");
      frontLayer.classList.remove("is-active");

      const oldFront = frontLayer;
      frontLayer = backLayer;
      backLayer = oldFront;
    }

    window.setInterval(switchBackground, 5500);
  }

  function getN8nConfig() {
    const raw =
      window.CASETODO_N8N && typeof window.CASETODO_N8N === "object"
        ? window.CASETODO_N8N
        : {};
    return {
      associateSlug: "casetodo-carlos-ruiz",
      channel: "web_modal_requerimiento",
      ragChannel: "web_chat_rag",
      twoPhaseSubmit: false,
      speechLang: "es-CO",
      webhookUrl: "",
      ragWebhookUrl: "",
      ...raw
    };
  }

  function bindN8nLeadModal() {
    const modal = document.getElementById("n8n-lead-modal");
    const form = document.getElementById("n8n-lead-form");
    const statusEl = document.getElementById("n8n-modal-status");
    const chatLayout = document.getElementById("n8n-chat-layout");
    const chatMessages = document.getElementById("n8n-chat-messages");
    const chatInput = document.getElementById("n8n-chat-input");
    const chatSend = document.getElementById("n8n-chat-send");
    const micBtn = document.getElementById("n8n-mic-btn");
    const panel = modal.querySelector(".casetodo-chat-panel");
    const veil = modal.querySelector(".casetodo-chat-widget__veil");
    const launcher = document.getElementById("casetodo-chat-launcher");

    if (!modal || !form || !panel || !veil || !chatLayout || !chatMessages || !chatInput) return;

    function isPanelOpen() {
      return panel.classList.contains("is-open");
    }

    let recognition = null;
    let usedVoiceThisSession = false;
    let micListening = false;
    let ragSessionId = "";
    /** Estado del gestor n8n (nombre, teléfono, email, paso); se reenvía en metadata cada POST chat. */
    let gestorState = {
      pasoActual: "",
      nombre: "",
      telefono: "",
      email: "",
      requerimiento: "",
      enviarCotizacionTelegram: false,
      enviarCotizacionCorreoEquipo: false,
      enviarConfirmacionCliente: false
    };
    let micAutoSendTimer = null;
    let micTurnHadTranscript = false;
    const MIC_SETTLE_MS = 820;
    /** Turnos previos al mensaje actual (user / assistant) para n8n RAG. */
    let ragConversationHistory = [];

    function clearMicAutoSendTimer() {
      if (micAutoSendTimer != null) {
        window.clearTimeout(micAutoSendTimer);
        micAutoSendTimer = null;
      }
    }

    const openers = document.querySelectorAll(
      "#open-n8n-modal, #open-n8n-modal-hero"
    );

    function setStatus(text, isError) {
      if (!statusEl) return;
      statusEl.textContent = text || "";
      statusEl.classList.toggle("is-error", Boolean(isError));
    }

    function clearAllStatus() {
      setStatus("", false);
    }

    function warnIfAssistantNotWired(cfg) {
      const url = String(cfg.webhookUrl || "").trim();
      const rag = String(cfg.ragWebhookUrl || "").trim();
      if (url || rag) return;
      const host = (window.location && window.location.hostname) || "";
      const gh = /github\.io$/i.test(host);
      setStatus(
        gh
          ? "Falta URL en n8n-webhook.config.js: N8N_RAG_WEBHOOK_URL_PRODUCTION (chat con PDF) y/o N8N_WEBHOOK_URL_PRODUCTION (equipo). Subí el archivo a la raíz del sitio si ves 404."
          : "Asistente sin URL: definí ragWebhookUrl o webhookUrl en CASETODO_N8N / n8n-webhook.config.js.",
        true
      );
    }

    function scrollChatToEnd() {
      if (!chatMessages) return;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Inicial para el avatar del usuario a partir del texto de ese mensaje (sin formulario).
     */
    function initialFromUserText(userText) {
      const t = String(userText || "").trim();
      if (!t) return "?";
      const mLlamo = t.match(/me llamo\s+([^\s,\.\n!]+)/i);
      if (mLlamo && mLlamo[1]) return mLlamo[1].charAt(0).toUpperCase();
      const mSoy = t.match(/^soy\s+([^\s,\.\n!\d]+)/i);
      if (mSoy && mSoy[1]) return mSoy[1].charAt(0).toUpperCase();
      const word = t.split(/\s+/).find((w) => /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(w));
      if (word) return word.charAt(0).toUpperCase();
      return "Tú";
    }

    function appendBotAvatar(container) {
      const wrap = document.createElement("div");
      wrap.className = "n8n-chat__avatar n8n-chat__avatar--bot";
      wrap.setAttribute("aria-hidden", "true");
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 48 48");
      svg.setAttribute("width", "36");
      svg.setAttribute("height", "36");
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", "#icon-n8n-asistente-casco");
      svg.appendChild(use);
      wrap.appendChild(svg);
      container.appendChild(wrap);
    }

    function appendChatMessage(role, text) {
      if (!chatMessages) return;
      const isUser = role === "user";
      const wrap = document.createElement("div");
      wrap.className = `n8n-chat__msg n8n-chat__msg--${isUser ? "user" : "bot"}`;

      if (!isUser) {
        appendBotAvatar(wrap);
      }

      const col = document.createElement("div");
      col.className = "n8n-chat__msg-col";
      const label = document.createElement("span");
      label.className = "n8n-chat__sender";
      label.textContent = isUser ? "Tú" : "Asistente Casetodo";
      const bubble = document.createElement("div");
      bubble.className = "n8n-chat__bubble";
      bubble.textContent = text;
      col.appendChild(label);
      col.appendChild(bubble);
      wrap.appendChild(col);

      if (isUser) {
        const av = document.createElement("div");
        av.className = "n8n-chat__avatar n8n-chat__avatar--user";
        av.setAttribute("aria-hidden", "true");
        av.textContent = initialFromUserText(text);
        wrap.appendChild(av);
      }

      chatMessages.appendChild(wrap);
      scrollChatToEnd();
    }

    function stopSpeech() {
      if (recognition && micListening) {
        try {
          recognition.stop();
        } catch (e) {
          /* ignore */ // @strip
        }
      }
      micListening = false;
      if (micBtn) {
        micBtn.classList.remove("is-listening");
        micBtn.setAttribute("aria-pressed", "false");
      }
    }

    function setupSpeechRecognition() {
      const cfg = getN8nConfig();
      recognition = null;
      clearMicAutoSendTimer();
      micTurnHadTranscript = false;
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (micBtn) {
        micBtn.disabled = false;
      }
      if (!micBtn || !SR) return;
      const lang = String(cfg.speechLang || "es-CO").trim() || "es-CO";
      try {
        recognition = new SR();
        recognition.lang = lang;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onstart = () => {
          clearMicAutoSendTimer();
          micTurnHadTranscript = false;
        };
        recognition.onresult = (event) => {
          const chunk = event.results[0][0].transcript.trim();
          if (!chunk || !chatInput) return;
          usedVoiceThisSession = true;
          micTurnHadTranscript = true;
          const prev = chatInput.value.trim();
          const sep = prev ? " " : "";
          chatInput.value = (prev + sep + chunk).trim();
        };
        recognition.onerror = () => {
          appendChatMessage(
            "bot",
            "No se pudo usar el micrófono. Revisá permisos del navegador o probá con Chrome / Edge."
          );
          stopSpeech();
        };
        recognition.onend = () => {
          stopSpeech();
          const pending = chatInput ? String(chatInput.value || "").trim() : "";
          if (micTurnHadTranscript && pending) {
            micTurnHadTranscript = false;
            clearMicAutoSendTimer();
            micAutoSendTimer = window.setTimeout(() => {
              micAutoSendTimer = null;
              handleChatSend();
            }, MIC_SETTLE_MS);
          } else {
            micTurnHadTranscript = false;
          }
        };
      } catch (e) {
        recognition = null;
        if (micBtn) micBtn.disabled = false;
      }
    }

    function openModal() {
      const cfg = getN8nConfig();
      clearMicAutoSendTimer();
      stopSpeech();
      recognition = null;
      panel.classList.add("is-open");
      veil.removeAttribute("hidden");
      modal.setAttribute("aria-hidden", "false");
      if (launcher) launcher.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      clearAllStatus();
      ragSessionId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : "casetodo-" + String(Date.now()) + "-" + String(Math.random()).slice(2, 11);
      gestorState = {
        pasoActual: "",
        nombre: "",
        telefono: "",
        email: "",
        requerimiento: "",
        enviarCotizacionTelegram: false,
        enviarCotizacionCorreoEquipo: false,
        enviarConfirmacionCliente: false
      };
      ragConversationHistory = [];
      if (chatMessages) chatMessages.textContent = "";
      if (chatInput) chatInput.value = "";
      form.reset();
      setupSpeechRecognition();
      warnIfAssistantNotWired(cfg);
      if (chatInput) chatInput.focus();
    }

    function closeModal() {
      clearMicAutoSendTimer();
      stopSpeech();
      recognition = null;
      panel.classList.remove("is-open");
      veil.setAttribute("hidden", "");
      modal.setAttribute("aria-hidden", "true");
      if (launcher) launcher.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      clearAllStatus();
      form.reset();
      ragSessionId = "";
      gestorState = {
        pasoActual: "",
        nombre: "",
        telefono: "",
        email: "",
        requerimiento: "",
        enviarCotizacionTelegram: false,
        enviarCotizacionCorreoEquipo: false,
        enviarConfirmacionCliente: false
      };
      ragConversationHistory = [];
      if (chatMessages) chatMessages.textContent = "";
      if (chatInput) chatInput.value = "";
    }

    function syncGestorFromResponse(data) {
      if (data == null) return;
      if (Array.isArray(data) && data.length) {
        syncGestorFromResponse(data[0]);
        return;
      }
      if (typeof data !== "object") return;
      let layer = { ...data };
      if (data.data != null && typeof data.data === "object" && !Array.isArray(data.data)) {
        layer = { ...data.data, ...layer };
      }
      const md =
        layer.metadata && typeof layer.metadata === "object" ? layer.metadata : {};
      const keys = ["pasoActual", "nombre", "telefono", "email", "requerimiento"];
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        let v;
        if (Object.prototype.hasOwnProperty.call(layer, k)) v = layer[k];
        else if (Object.prototype.hasOwnProperty.call(md, k)) v = md[k];
        else continue;
        gestorState[k] = String(v ?? "");
      }
      const boolKeys = [
        "enviarCotizacionTelegram",
        "enviarCotizacionCorreoEquipo",
        "enviarConfirmacionCliente"
      ];
      for (let b = 0; b < boolKeys.length; b++) {
        const bk = boolKeys[b];
        let bv;
        if (Object.prototype.hasOwnProperty.call(layer, bk)) bv = layer[bk];
        else if (Object.prototype.hasOwnProperty.call(md, bk)) bv = md[bk];
        else continue;
        gestorState[bk] = bv === true || String(bv).toLowerCase() === "true";
      }
    }

    function buildMeta() {
      const meta = {
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        sentAt: new Date().toISOString()
      };
      if (ragSessionId) meta.ragSessionId = ragSessionId;
      meta.pasoActual = gestorState.pasoActual || "";
      meta.nombre = gestorState.nombre || "";
      meta.telefono = gestorState.telefono || "";
      meta.email = gestorState.email || "";
      meta.requerimiento = gestorState.requerimiento || "";
      meta.enviarCotizacionTelegram = Boolean(gestorState.enviarCotizacionTelegram);
      meta.enviarCotizacionCorreoEquipo = Boolean(gestorState.enviarCotizacionCorreoEquipo);
      meta.enviarConfirmacionCliente = Boolean(gestorState.enviarConfirmacionCliente);
      return meta;
    }

    /** Payload mínimo para submit al equipo: el texto va crudo; intent/datos los resuelve n8n. */
    function collectBasePayloadFromMessage(singleText, cfg) {
      const t = String(singleText || "").trim();
      return {
        associateSlug: String(cfg.associateSlug || "casetodo-carlos-ruiz"),
        channel: String(cfg.channel || "web_modal_requerimiento"),
        mensaje: t,
        mensajeSource: usedVoiceThisSession ? "voz" : "texto",
        metadata: buildMeta()
      };
    }

    async function postWebhook(url, payload) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "cors",
        cache: "no-store"
      });
      return res;
    }

    /**
     * Texto del asistente desde la respuesta del webhook n8n (varios formatos habituales).
     */
    function extractReplyFromRagJson(data) {
      if (data == null) return "";
      if (typeof data === "string") return data.trim();
      if (typeof data !== "object") return "";

      if (typeof data.reply === "string") return data.reply.trim();
      if (typeof data.output === "string") return data.output.trim();
      if (typeof data.text === "string") return data.text.trim();
      if (typeof data.response === "string") return data.response.trim();
      if (data.message && typeof data.message === "object") {
        const mc = data.message.content;
        if (typeof mc === "string") return mc.trim();
      }
      if (typeof data.message === "string") return data.message.trim();

      if (data.choices && Array.isArray(data.choices) && data.choices[0]) {
        const m = data.choices[0].message;
        if (m && typeof m.content === "string") return String(m.content).trim();
      }

      if (data.body && typeof data.body === "object") {
        const b = extractReplyFromRagJson(data.body);
        if (b) return b;
      }
      if (data.json && typeof data.json === "object") {
        const j = extractReplyFromRagJson(data.json);
        if (j) return j;
      }
      if (data.data && typeof data.data === "object") {
        const d = extractReplyFromRagJson(data.data);
        if (d) return d;
      }

      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          const r = extractReplyFromRagJson(data[i]);
          if (r) return r;
        }
      }
      return "";
    }

    /**
     * Webhook n8n RAG (phase chat). Envía `mensaje` + `conversation` (turnos previos); captación en n8n.
     */
    async function postRagChat(ragUrl, cfg, userText, conversationHistory) {
      const ch = String(cfg.ragChannel || cfg.channel || "web_chat_rag").trim() || "web_chat_rag";
      const payload = {
        phase: "chat",
        mensaje: String(userText || "").trim(),
        associateSlug: String(cfg.associateSlug || "casetodo-carlos-ruiz"),
        channel: ch,
        conversation: Array.isArray(conversationHistory) ? conversationHistory : [],
        mensajeSource: usedVoiceThisSession ? "voz" : "texto",
        metadata: buildMeta()
      };
      try {
        const res = await fetch(ragUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          mode: "cors",
          cache: "no-store"
        });
        const raw = await res.text();
        let reply = "";
        if (res.ok && raw.trim()) {
          const trimmed = raw.trim();
          try {
            const data = JSON.parse(trimmed);
            reply = extractReplyFromRagJson(data);
            syncGestorFromResponse(data);
          } catch (e) {
            void e; // @strip
            if (!/^[\[{]/.test(trimmed)) reply = trimmed;
          }
        }
        return { ok: res.ok, reply, status: res.status, networkError: false };
      } catch (err) {
        console.warn("[rag chat]", err); // @strip
        return { ok: false, reply: "", status: 0, networkError: true };
      }
    }

    function setChatBusy(busy) {
      if (chatSend) chatSend.disabled = busy;
      if (micBtn) {
        micBtn.disabled = Boolean(busy);
      }
    }

    async function sendSubmit(base, structuredText, cfg) {
      const url = String(cfg.webhookUrl || "").trim();
      if (!url) {
        setStatus(
          "Por ahora no podemos enviar por aquí. Puedes usar el formulario de cotización o escribirnos por WhatsApp.",
          true
        );
        return;
      }

      const payload = {
        phase: "submit",
        associateSlug: base.associateSlug,
        channel: base.channel,
        mensajeOriginal: base.mensaje,
        structuredMensaje: structuredText,
        clientConfirmed: true,
        mensajeSource: base.mensajeSource,
        metadata: base.metadata || buildMeta()
      };

      setStatus("Enviando al equipo…", false);
      setChatBusy(true);

      try {
        const res = await postWebhook(url, payload);
        const rawBody = await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let successMsg = "¡Listo! Ya quedó en manos del equipo; pronto te contactan.";
        try {
          const data = rawBody.trim() ? JSON.parse(rawBody) : {};
          if (typeof data.message === "string" && data.message.trim()) {
            successMsg = data.message.trim();
          }
        } catch (e) {
          /* respuesta no JSON */ // @strip
        }
        appendChatMessage("bot", successMsg);
        setStatus("", false);
        window.setTimeout(() => closeModal(), 3200);
      } catch (err) {
        console.warn("[n8n modal submit]", err); // @strip
        setStatus(
          "No pudimos enviarlo ahora. ¿Un intento más en un rato? Si urge, WhatsApp siempre está disponible.",
          true
        );
      } finally {
        setChatBusy(false);
      }
    }

    async function handleChatSend() {
      clearMicAutoSendTimer();
      const cfg = getN8nConfig();
      const ragUrl = String(cfg.ragWebhookUrl || "").trim();
      const url = String(cfg.webhookUrl || "").trim();
      const text = chatInput ? String(chatInput.value || "").trim() : "";
      if (!text) {
        setStatus("Escribí o dictá un mensaje y enviá con Enter o el botón verde.", true);
        return;
      }
      if (!ragUrl && !url) {
        setStatus(
          "Falta configurar el asistente (ragWebhookUrl y/o webhookUrl). Revisá n8n-webhook.config.js.",
          true
        );
        return;
      }

      clearAllStatus();
      appendChatMessage("user", text);
      if (chatInput) chatInput.value = "";

      if (ragUrl) {
        setStatus("Consultando…", false);
        setChatBusy(true);
        try {
          const prior = ragConversationHistory.map((t) => ({ role: t.role, content: t.content }));
          const { ok, reply, status, networkError } = await postRagChat(ragUrl, cfg, text, prior);
          const flujoCompletado =
            String(gestorState.pasoActual || "").toLowerCase() === "completado";
          if (networkError) {
            appendChatMessage(
              "bot",
              flujoCompletado
                ? "No pudimos conectar con el servidor en este momento. Tus datos ya quedaron registrados; el asesor te contactará pronto. Si urge, escribinos por WhatsApp."
                : "No se pudo conectar con el asistente. Si el sitio está en GitHub Pages, puede ser CORS; probá desde esta misma máquina con npm start o usá el Worker del repo."
            );
          } else {
            const out =
              reply && String(reply).trim()
                ? String(reply).trim()
                : ok
                  ? "Sin texto en la respuesta. En n8n, «Respond to Webhook» debe devolver JSON con «reply» (o «output» / «text»)."
                  : status === 404
                    ? flujoCompletado
                      ? "El servidor del asistente respondió 404 (revisá en n8n que el workflow esté activo y la URL en .env / n8n-webhook.config.js). Tus datos ya están registrados; el equipo te contactará igualmente."
                      : "Webhook no disponible (404). Revisá la URL en n8n y en n8n-webhook.config.js / .env."
                    : `Error ${status}. Revisá la ejecución en n8n.`;
            appendChatMessage("bot", out);
          }
          if (!networkError && ok && reply && String(reply).trim()) {
            ragConversationHistory.push({ role: "user", content: text });
            ragConversationHistory.push({ role: "assistant", content: String(reply).trim() });
          }
        } finally {
          setChatBusy(false);
          clearAllStatus();
        }
        return;
      }

      const base = collectBasePayloadFromMessage(text, cfg);
      await sendSubmit(base, base.mensaje, cfg);
    }

    chatSend?.addEventListener("click", () => {
      handleChatSend();
    });

    chatInput?.addEventListener("keydown", (ev) => {
      if (!(ev.key === "Enter" && !ev.shiftKey)) {
        clearMicAutoSendTimer();
      }
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        handleChatSend();
      }
    });

    openers.forEach((el) => {
      el.addEventListener("click", () => openModal());
    });

    launcher?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (isPanelOpen()) {
        closeModal();
      } else {
        openModal();
      }
    });

    modal.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t && t.getAttribute && t.getAttribute("data-n8n-close")) {
        closeModal();
      }
    });

    document.getElementById("close-n8n-modal")?.addEventListener("click", () => {
      closeModal();
    });

    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && isPanelOpen()) {
        closeModal();
      }
    });

    const params = new URLSearchParams(window.location.search);
    if (params.get("asistente") === "1" || params.get("n8n") === "1") {
      openModal();
    }

    micBtn?.addEventListener("click", () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        appendChatMessage(
          "bot",
          "Tu navegador no permite dictado por voz aquí. Probá con Chrome o Edge en escritorio."
        );
        return;
      }
      if (!recognition || micBtn.disabled) return;
      if (micListening) {
        stopSpeech();
        return;
      }
      micListening = true;
      micBtn.classList.add("is-listening");
      micBtn.setAttribute("aria-pressed", "true");
      try {
        recognition.start();
      } catch (e) {
        stopSpeech();
        appendChatMessage("bot", "No se pudo iniciar el dictado. Reintentá o escribí el mensaje.");
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });
  }

  bindProductButtons();
  bindQuoteForm();
  bindExperienceCounters();
  bindHeroBackgroundRotator();
  bindN8nLeadModal();
})();