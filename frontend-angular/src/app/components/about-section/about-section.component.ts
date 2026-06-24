import { Component } from '@angular/core';
import { SITE_CONFIG } from '../../core/config/site.config';

@Component({
  selector: 'app-about-section',
  standalone: true,
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
export class AboutSectionComponent {
  readonly site = SITE_CONFIG;
}
