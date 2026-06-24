import { Component } from '@angular/core';
import { SITE_CONFIG } from '../../core/config/site.config';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
})
export class SiteFooterComponent {
  readonly site = SITE_CONFIG;
  readonly year = new Date().getFullYear();

  scrollTo(sectionId: string, event: Event): void {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }
}
