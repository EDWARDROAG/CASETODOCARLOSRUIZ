import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface GestorState {
  pasoActual: string;
  nombre: string;
  telefono: string;
  email: string;
  requerimiento: string;
  enviarCotizacionTelegram: boolean;
  enviarCotizacionCorreoEquipo: boolean;
  enviarConfirmacionCliente: boolean;
}

export interface RagChatResult {
  ok: boolean;
  reply: string;
  status: number;
  networkError: boolean;
}

@Injectable({ providedIn: 'root' })
export class N8nChatService {
  private readonly http = inject(HttpClient);

  gestorState: GestorState = this.emptyGestor();
  ragSessionId = '';
  conversationHistory: ChatTurn[] = [];
  usedVoiceThisSession = false;

  resetSession(): void {
    this.gestorState = this.emptyGestor();
    this.conversationHistory = [];
    this.usedVoiceThisSession = false;
    this.ragSessionId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `casetodo-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  clearSession(): void {
    this.gestorState = this.emptyGestor();
    this.conversationHistory = [];
    this.ragSessionId = '';
    this.usedVoiceThisSession = false;
  }

  isConfigured(): boolean {
    return Boolean(environment.ragWebhookUrl?.trim() || environment.webhookUrl?.trim());
  }

  async sendChat(userText: string): Promise<RagChatResult> {
    const ragUrl = environment.ragWebhookUrl?.trim();
    if (!ragUrl) {
      return { ok: false, reply: '', status: 0, networkError: false };
    }

    const payload = {
      phase: 'chat',
      mensaje: userText.trim(),
      associateSlug: environment.associateSlug,
      channel: environment.ragChannel,
      conversation: this.conversationHistory.map((t) => ({ role: t.role, content: t.content })),
      mensajeSource: this.usedVoiceThisSession ? 'voz' : 'texto',
      metadata: this.buildMeta(),
    };

    try {
      const raw = await firstValueFrom(
        this.http.post(ragUrl, payload, { responseType: 'text' })
      );
      let data: unknown = raw;
      try {
        data = JSON.parse(String(raw));
      } catch {
        /* texto plano */
      }
      const reply = this.extractReply(data, raw);
      this.syncGestorFromResponse(data);
      return { ok: true, reply, status: 200, networkError: false };
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status ?? 0;
      return { ok: false, reply: '', status, networkError: status === 0 };
    }
  }

  private buildMeta(): Record<string, unknown> {
    return {
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      sentAt: new Date().toISOString(),
      ragSessionId: this.ragSessionId,
      pasoActual: this.gestorState.pasoActual,
      nombre: this.gestorState.nombre,
      telefono: this.gestorState.telefono,
      email: this.gestorState.email,
      requerimiento: this.gestorState.requerimiento,
      enviarCotizacionTelegram: this.gestorState.enviarCotizacionTelegram,
      enviarCotizacionCorreoEquipo: this.gestorState.enviarCotizacionCorreoEquipo,
      enviarConfirmacionCliente: this.gestorState.enviarConfirmacionCliente,
    };
  }

  private extractReply(data: unknown, raw: string): string {
    if (data == null) return '';
    if (typeof data === 'string') return data.trim();
    if (typeof data !== 'object') return String(raw || '').trim();

    const obj = data as Record<string, unknown>;
    const keys = ['reply', 'output', 'text', 'response'];
    for (const k of keys) {
      if (typeof obj[k] === 'string') return (obj[k] as string).trim();
    }
    if (obj['message'] && typeof obj['message'] === 'object') {
      const mc = (obj['message'] as { content?: string }).content;
      if (typeof mc === 'string') return mc.trim();
    }
    if (typeof obj['message'] === 'string') return obj['message'].trim();
    if (Array.isArray(obj['choices']) && obj['choices'][0]) {
      const m = (obj['choices'][0] as { message?: { content?: string } }).message;
      if (m?.content) return String(m.content).trim();
    }
    if (obj['data'] && typeof obj['data'] === 'object') {
      return this.extractReply(obj['data'], raw);
    }
    return String(raw || '').trim();
  }

  private syncGestorFromResponse(data: unknown): void {
    if (!data || typeof data !== 'object') return;
    const layer = { ...(data as Record<string, unknown>) };
    const md =
      layer['metadata'] && typeof layer['metadata'] === 'object'
        ? (layer['metadata'] as Record<string, unknown>)
        : {};

    for (const k of ['pasoActual', 'nombre', 'telefono', 'email', 'requerimiento'] as const) {
      const v = layer[k] ?? md[k];
      if (v !== undefined) this.gestorState[k] = String(v ?? '');
    }
    for (const k of [
      'enviarCotizacionTelegram',
      'enviarCotizacionCorreoEquipo',
      'enviarConfirmacionCliente',
    ] as const) {
      const v = layer[k] ?? md[k];
      if (v !== undefined) this.gestorState[k] = v === true || String(v).toLowerCase() === 'true';
    }
  }

  private emptyGestor(): GestorState {
    return {
      pasoActual: '',
      nombre: '',
      telefono: '',
      email: '',
      requerimiento: '',
      enviarCotizacionTelegram: false,
      enviarCotizacionCorreoEquipo: false,
      enviarConfirmacionCliente: false,
    };
  }
}
