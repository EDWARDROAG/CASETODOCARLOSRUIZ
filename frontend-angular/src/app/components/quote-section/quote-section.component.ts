import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SITE_CONFIG } from '../../core/config/site.config';
import { WhatsappService } from '../../core/services/whatsapp.service';

@Component({
  selector: 'app-quote-section',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './quote-section.component.html',
  styleUrl: './quote-section.component.scss',
})
export class QuoteSectionComponent {
  readonly site = SITE_CONFIG;
  private readonly fb = inject(FormBuilder);
  private readonly whatsapp = inject(WhatsappService);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    empresa: ['', Validators.required],
    telefono: ['', Validators.required],
    servicio: ['', Validators.required],
    tipoCaseton: ['', Validators.required],
    cantidad: ['', [Validators.required, Validators.min(1)]],
    ciudad: ['', Validators.required],
    fecha: ['', Validators.required],
    detalles: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.whatsapp.quoteRequest(this.form.getRawValue());
  }
}
