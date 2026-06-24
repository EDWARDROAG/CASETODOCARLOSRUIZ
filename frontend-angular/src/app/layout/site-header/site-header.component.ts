import { Component, output } from '@angular/core';
import { SITE_CONFIG } from '../../core/config/site.config';

@Component({
  selector: 'app-site-header',
  standalone: true,
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
})
export class SiteHeaderComponent {
  readonly site = SITE_CONFIG;
  readonly openAssistant = output<void>();

  scrollTo(sectionId: string, event: Event): void {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }
}
