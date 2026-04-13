/**
 * ======================================================
 * ARCHIVO: main.js
 * UBICACIÓN: associates/casetodo-carlos-ruiz/frontend/js/
 * VERSIÓN: 4.3 - Chat tipo WhatsApp; RAG (ragWebhookUrl); sin saludo largo ni botones fase 2
 * ÚLTIMA ACTUALIZACIÓN: 2026-04-11 22:50
 *
 * 🎯 PROPÓSITO:
 * Gestionar la interacción del sitio de Casetodo Carlos Ruiz.
 * Construye mensajes para WhatsApp desde botones de productos
 * y desde el formulario de requerimientos de cotización.
 * Modal chat (voz o texto): opcional ragWebhookUrl (phase chat / PDF) y/o webhookUrl (lead structure+submit).
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
  const WHATSAPP_NUMBER = "573001234567";

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
      twoPhaseSubmit: true,
      speechLang: "es-CO",
      webhookUrl: "",
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
    const btnSkip = document.getElementById("n8n-btn-skip-ai");
    const btnFinal = document.getElementById("n8n-btn-final-send");
    const micBtn = document.getElementById("n8n-mic-btn");
    const phaseActions = document.getElementById("casetodo-chat-phase-actions");
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
    const sessionMensajeParts = [];
    let lastStructuredText = "";
    let micAutoSendTimer = null;
    let micTurnHadTranscript = false;
    const MIC_SETTLE_MS = 820;

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
      if (url) return;
      const host = (window.location && window.location.hostname) || "";
      const gh = /github\.io$/i.test(host);
      setStatus(
        gh
          ? "Falta la URL del asistente: en n8n-webhook.config.js definí N8N_WEBHOOK_URL_PRODUCTION (https://…/webhook/…). Si en la consola ves 404 en config.js o n8n-webhook.config.js, subí esos archivos a la raíz del repositorio y hacé push."
          : "Por ahora no podemos enviar por aquí. Puedes usar el formulario de cotización o escribirnos por WhatsApp.",
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

    function inferIntentFromText(full) {
      const x = String(full || "").toLowerCase();
      if (/visita|cita en obra|ir a la obra|obra en/.test(x)) return "visita";
      if (/reuni[oó]n|llamad[ao]|videollamada/.test(x)) return "reunion";
      if (/cotiz|precio|presupuesto|cu[aá]nto|necesito\s+\d/.test(x)) return "cotizacion";
      return "otro";
    }

    /**
     * Campos que antes venían del formulario: se infieren del texto del chat (heurística simple).
     */
    function inferContactFromChat(fullText) {
      const t = String(fullText || "");
      let nombre = "";
      let telefono = "";
      let email = "";
      const em = t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (em) email = em[0].trim();
      const ph =
        t.match(/\b3\d{9}\b/) ||
        t.match(/\+\s*57\s*3\d{9}\b/) ||
        t.match(/\b60\d{8}\b/) ||
        t.match(/\b\d{10}\b/);
      if (ph) telefono = ph[0].replace(/\s/g, "");
      const nm =
        t.match(/me llamo\s+([^\n,\.!]+)/i) ||
        t.match(/mi nombre es\s+([^\n,\.!]+)/i) ||
        t.match(/^soy\s+([^\n,\.!\d]+)/im);
      if (nm) nombre = nm[1].trim().split(/[\n,]/)[0].slice(0, 80);
      if (!nombre) {
        const first = t.split("\n")[0].trim();
        if (first && first.length < 55 && !/\d{9,}/.test(first)) nombre = first;
      }
      return {
        intent: inferIntentFromText(t),
        nombre: nombre || "Cliente (chat web)",
        telefono: telefono || "Por confirmar (chat)",
        email: email || ""
      };
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

    /**
     * Saludo y primeras líneas del asistente: FRONTEND (no llaman a n8n).
     * n8n solo entra con phase "structure" / "submit". Para saludo dinámico desde n8n habría que
     * añadir p.ej. phase "greeting" + Respond to Webhook y un fetch aquí al abrir el modal.
     */
    function pushOpeningGreetings(twoPhase) {
      appendChatMessage(
        "bot",
        "¡Hola! Soy el asistente virtual de Casetodo Carlos Ruiz. Estoy aquí para ayudarte a dejar bien claro tu requerimiento."
      );
      appendChatMessage(
        "bot",
        "Cuéntame con calma: qué necesitas (casetones, cantidades, ciudad de la obra, fechas…). " +
          "Podés escribir o dictar con el micrófono: si dictás varias veces, todo se junta en un solo requerimiento y, al terminar de hablar, lo enviamos solos (o usá el botón verde / Enter)."
      );
      if (!twoPhase) {
        appendChatMessage(
          "bot",
          "Cuando lo tengas listo, tocá el botón verde de enviar o Enter en el teclado y lo mandamos al equipo de una."
        );
      }
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

    function applyTwoPhaseUi() {
      const cfg = getN8nConfig();
      const two = cfg.twoPhaseSubmit !== false;
      if (phaseActions) {
        phaseActions.hidden = !two;
      }
      if (btnSkip) {
        btnSkip.hidden = !two;
        btnSkip.textContent = "Enviar tal cual (sin ordenar)";
      }
      if (btnFinal) {
        btnFinal.hidden = !two;
        if (!two) btnFinal.disabled = true;
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
      sessionMensajeParts.length = 0;
      lastStructuredText = "";
      if (chatMessages) chatMessages.textContent = "";
      if (chatInput) chatInput.value = "";
      if (btnFinal) btnFinal.disabled = true;
      applyTwoPhaseUi();
      form.reset();
      setupSpeechRecognition();
      const two = cfg.twoPhaseSubmit !== false;
      pushOpeningGreetings(two);
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
      sessionMensajeParts.length = 0;
      lastStructuredText = "";
      if (chatMessages) chatMessages.textContent = "";
      if (chatInput) chatInput.value = "";
      if (btnFinal) btnFinal.disabled = true;
    }

    function buildMeta() {
      return {
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        sentAt: new Date().toISOString()
      };
    }

    function joinedMensaje() {
      return sessionMensajeParts.join("\n\n").trim();
    }

    function collectBasePayload(cfg) {
      const joined = joinedMensaje();
      const inferred = inferContactFromChat(joined);
      return {
        associateSlug: String(cfg.associateSlug || "casetodo-carlos-ruiz"),
        channel: String(cfg.channel || "web_modal_requerimiento"),
        intent: inferred.intent,
        nombre: inferred.nombre,
        telefono: inferred.telefono,
        email: inferred.email,
        mensaje: joined,
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

    function parseStructuredMensaje(res) {
      return res.text().then((raw) => {
        const trimmed = raw.trim();
        if (!trimmed) return "";
        try {
          const data = JSON.parse(trimmed);
          if (typeof data.structuredMensaje === "string") return data.structuredMensaje;
          if (data.body && typeof data.body.structuredMensaje === "string") {
            return data.body.structuredMensaje;
          }
        } catch (e) {
          /* not JSON */ // @strip
        }
        return "";
      });
    }

    function setChatBusy(busy) {
      if (chatSend) chatSend.disabled = busy;
      if (btnSkip && !btnSkip.hidden) btnSkip.disabled = busy;
      if (btnFinal && !btnFinal.hidden) {
        btnFinal.disabled = busy || !lastStructuredText;
      }
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
        intent: base.intent,
        nombre: base.nombre,
        telefono: base.telefono,
        email: base.email,
        mensajeOriginal: base.mensaje,
        structuredMensaje: structuredText,
        clientConfirmed: true,
        mensajeSource: base.mensajeSource,
        metadata: buildMeta()
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
        if (btnFinal) btnFinal.disabled = !lastStructuredText;
      }
    }

    async function handleChatSend() {
      clearMicAutoSendTimer();
      const cfg = getN8nConfig();
      const url = String(cfg.webhookUrl || "").trim();
      const text = chatInput ? String(chatInput.value || "").trim() : "";
      if (!text) {
        setStatus("Cuando puedas, escribe o dicta un mensajito abajo y lo enviamos.", true);
        return;
      }
      if (!url) {
        setStatus(
          "Esta vía no está activa aún. Mientras tanto, cotización o WhatsApp son buenas opciones.",
          true
        );
        return;
      }

      clearAllStatus();
      appendChatMessage("user", text);
      if (chatInput) chatInput.value = "";

      const two = cfg.twoPhaseSubmit !== false;
      if (!two) {
        sessionMensajeParts.push(text);
        const base = collectBasePayload(cfg);
        await sendSubmit(base, base.mensaje, cfg);
        return;
      }

      sessionMensajeParts.push(text);
      const base = collectBasePayload(cfg);

      setStatus("Dame un segundito, estoy ordenando tu mensaje…", false);
      setChatBusy(true);
      try {
        const res = await postWebhook(url, { ...base, phase: "structure" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const structured = await parseStructuredMensaje(res);
        if (!structured.trim()) throw new Error("empty structured");
        lastStructuredText = structured.trim();
        appendChatMessage(
          "bot",
          `Así lo dejé listo para el equipo (puedes leerlo con calma):\n\n${lastStructuredText}`
        );
        if (btnFinal) btnFinal.disabled = false;
        setStatus("Si te cuadra el resumen, pulsá «Enviar al equipo» abajo (o «Enviar tal cual»).", false);
      } catch (err) {
        console.warn("[n8n modal structure]", err); // @strip
        sessionMensajeParts.pop();
        appendChatMessage(
          "bot",
          "Uy, ahora mismo no pude ordenar el texto. ¿Lo intentamos otra vez con otras palabras? También puedes usar «Enviar tal cual» y lo mandamos tal como lo escribiste."
        );
        setStatus("No pude ordenar el mensaje. Un reintento o «Enviar tal cual» suelen ayudar.", true);
      } finally {
        setChatBusy(false);
      }
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

    btnSkip?.addEventListener("click", async () => {
      const cfg = getN8nConfig();
      let raw = chatInput ? String(chatInput.value || "").trim() : "";
      if (raw) {
        sessionMensajeParts.push(raw);
        if (chatInput) chatInput.value = "";
        appendChatMessage("user", raw);
      }
      const joined = joinedMensaje();
      if (!joined) {
        setStatus("Escribe algo en el chat primero y lo enviamos con gusto.", true);
        return;
      }
      const base = collectBasePayload(cfg);
      await sendSubmit(base, joined, cfg);
    });

    btnFinal?.addEventListener("click", async () => {
      const cfg = getN8nConfig();
      const base = collectBasePayload(cfg);
      if (!lastStructuredText) {
        setStatus("Primero mandemos un mensaje para armar el resumen juntos.", true);
        return;
      }
      await sendSubmit(base, lastStructuredText, cfg);
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