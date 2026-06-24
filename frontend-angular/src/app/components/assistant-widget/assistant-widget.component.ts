import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SITE_CONFIG } from '../../core/config/site.config';
import { ChatTurn, N8nChatService } from '../../core/services/n8n-chat.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-assistant-widget',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './assistant-widget.component.html',
  styleUrl: './assistant-widget.component.scss',
})
export class AssistantWidgetComponent implements OnInit, OnDestroy {
  readonly site = SITE_CONFIG;
  private readonly chat = inject(N8nChatService);
  private readonly whatsapp = inject(WhatsappService);

  isOpen = signal(false);
  statusText = signal('');
  statusError = signal(false);
  busy = signal(false);
  inputText = '';
  messages = signal<ChatTurn[]>([]);
  micListening = signal(false);

  private recognition: SpeechRecognition | null = null;
  private micTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    if (params.get('asistente') === '1' || params.get('n8n') === '1') {
      this.open();
    }
  }

  ngOnDestroy(): void {
    this.stopMic();
    this.clearMicTimer();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.close();
  }

  toggle(): void {
    if (this.isOpen()) this.close();
    else this.open();
  }

  open(): void {
    this.chat.resetSession();
    this.messages.set([]);
    this.inputText = '';
    this.statusText.set('');
    this.statusError.set(false);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
    this.setupSpeech();
    if (!this.chat.isConfigured()) {
      this.statusText.set(
        'Asistente sin URL configurada. Revisá environment o proxy n8n.'
      );
      this.statusError.set(true);
    }
  }

  close(): void {
    this.stopMic();
    this.chat.clearSession();
    this.messages.set([]);
    this.inputText = '';
    this.isOpen.set(false);
    document.body.style.overflow = '';
    this.statusText.set('');
    this.statusError.set(false);
  }

  async send(): Promise<void> {
    const text = this.inputText.trim();
    if (!text) {
      this.statusText.set('Escribí o dictá un mensaje y enviá con Enter o el botón verde.');
      this.statusError.set(true);
      return;
    }
    if (!this.chat.isConfigured()) return;

    this.statusText.set('');
    this.statusError.set(false);
    this.messages.update((m) => [...m, { role: 'user', content: text }]);
    this.inputText = '';
    this.busy.set(true);

    try {
      const result = await this.chat.sendChat(text);
      const flujoCompletado =
        String(this.chat.gestorState.pasoActual || '').toLowerCase() === 'completado';

      let reply: string;
      if (result.networkError) {
        reply = flujoCompletado
          ? 'No pudimos conectar con el servidor. Tus datos ya quedaron registrados; el asesor te contactará pronto.'
          : 'No se pudo conectar con el asistente. Probá de nuevo o escribinos por WhatsApp.';
      } else if (result.reply) {
        reply = result.reply;
        this.chat.conversationHistory.push({ role: 'user', content: text });
        this.chat.conversationHistory.push({ role: 'assistant', content: reply });
      } else if (result.status === 404) {
        reply = 'Webhook no disponible (404). Revisá la configuración de n8n.';
      } else {
        reply = 'Sin respuesta del asistente. Intentá de nuevo en un momento.';
      }

      this.messages.update((m) => [...m, { role: 'assistant', content: reply }]);
    } finally {
      this.busy.set(false);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.send();
    }
  }

  toggleMic(): void {
    const SR = getSpeechRecognitionCtor();
    if (!SR) {
      this.messages.update((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'Tu navegador no permite dictado por voz. Probá Chrome o Edge.',
        },
      ]);
      return;
    }
    if (this.micListening()) {
      this.stopMic();
      return;
    }
    if (!this.recognition) this.setupSpeech();
    if (!this.recognition) return;

    this.micListening.set(true);
    try {
      this.recognition.start();
    } catch {
      this.micListening.set(false);
    }
  }

  openWhatsappFallback(): void {
    this.whatsapp.assistantFallback();
  }

  userInitial(text: string): string {
    const t = text.trim();
    if (!t) return '?';
    const word = t.split(/\s+/).find((w) => /[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(w));
    return word ? word.charAt(0).toUpperCase() : 'T';
  }

  private setupSpeech(): void {
    const SR = getSpeechRecognitionCtor();
    if (!SR) return;

    const recognition = new SR();
    this.recognition = recognition;
    recognition.lang = environment.speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let hadTranscript = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const chunk = event.results[0][0].transcript.trim();
      if (!chunk) return;
      this.chat.usedVoiceThisSession = true;
      hadTranscript = true;
      const prev = this.inputText.trim();
      this.inputText = (prev ? `${prev} ${chunk}` : chunk).trim();
    };
    recognition.onerror = () => {
      this.stopMic();
      this.messages.update((m) => [
        ...m,
        { role: 'assistant', content: 'No se pudo usar el micrófono. Revisá permisos del navegador.' },
      ]);
    };
    recognition.onend = () => {
      this.micListening.set(false);
      if (hadTranscript && this.inputText.trim()) {
        hadTranscript = false;
        this.clearMicTimer();
        this.micTimer = setTimeout(() => void this.send(), 820);
      }
    };
  }

  private stopMic(): void {
    if (this.recognition && this.micListening()) {
      try {
        this.recognition.stop();
      } catch {
        /* ignore */
      }
    }
    this.micListening.set(false);
  }

  private clearMicTimer(): void {
    if (this.micTimer) {
      clearTimeout(this.micTimer);
      this.micTimer = null;
    }
  }
}

function getSpeechRecognitionCtor(): SpeechRecognitionStatic | undefined {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}
