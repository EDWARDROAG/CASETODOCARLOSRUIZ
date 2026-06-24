import { Component, OnDestroy, OnInit, output } from '@angular/core';
import { SITE_CONFIG } from '../../core/config/site.config';
import { WhatsappService } from '../../core/services/whatsapp.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  readonly site = SITE_CONFIG;
  readonly openAssistant = output<void>();

  activeIndex = 0;
  frontIsLayerA = true;
  private timer?: ReturnType<typeof setInterval>;

  constructor(private readonly whatsapp: WhatsappService) {}

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.activeIndex = (this.activeIndex + 1) % this.site.heroImages.length;
      this.frontIsLayerA = !this.frontIsLayerA;
    }, 5500);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  bgUrl(index: number): string {
    return `url("${this.site.heroImages[index]}")`;
  }

  scrollToContact(event: Event): void {
    event.preventDefault();
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }

  openWhatsapp(): void {
    this.whatsapp.open(
      'Hola, quiero información sobre venta o alquiler de casetones.'
    );
  }
}
