import { Component } from '@angular/core';
import { SITE_CONFIG } from '../../core/config/site.config';
import { WhatsappService } from '../../core/services/whatsapp.service';

@Component({
  selector: 'app-products-section',
  standalone: true,
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss',
})
export class ProductsSectionComponent {
  readonly site = SITE_CONFIG;

  constructor(private readonly whatsapp: WhatsappService) {}

  consult(productName: string): void {
    this.whatsapp.productInquiry(productName);
  }
}
