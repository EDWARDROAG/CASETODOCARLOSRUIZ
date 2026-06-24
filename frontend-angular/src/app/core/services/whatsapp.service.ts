import { Injectable } from '@angular/core';
import { SITE_CONFIG } from '../config/site.config';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  private readonly number = SITE_CONFIG.whatsapp;

  open(message: string): void {
    const encoded = encodeURIComponent(message.trim());
    window.open(`https://wa.me/${this.number}?text=${encoded}`, '_blank', 'noopener');
  }

  productInquiry(productName: string): void {
    const message = [
      'Hola, estoy interesado en este tipo de casetón:',
      '',
      `- Producto: ${productName}`,
      '',
      'Quedo atento a disponibilidad, precio y condiciones.',
    ].join('\n');
    this.open(message);
  }

  quoteRequest(payload: Record<string, string>): void {
    const message = [
      'Hola, quiero solicitar una cotización de casetones.',
      '',
      `- Nombre: ${payload['nombre']}`,
      `- Empresa: ${payload['empresa']}`,
      `- Teléfono: ${payload['telefono']}`,
      `- Servicio: ${payload['servicio']}`,
      `- Tipo de casetón: ${payload['tipoCaseton']}`,
      `- Cantidad estimada: ${payload['cantidad']}`,
      `- Ciudad / Obra: ${payload['ciudad']}`,
      `- Fecha requerida: ${payload['fecha']}`,
      `- Detalles: ${payload['detalles']}`,
    ].join('\n');
    this.open(message);
  }

  assistantFallback(): void {
    this.open(
      'Hola, no pude resolver mi requerimiento en el asistente, me pueden ayudar por favor?'
    );
  }
}
