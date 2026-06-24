import { Component } from '@angular/core';
import { SITE_CONFIG } from '../../core/config/site.config';

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  templateUrl: './testimonials-section.component.html',
  styleUrl: './testimonials-section.component.scss',
})
export class TestimonialsSectionComponent {
  readonly site = SITE_CONFIG;
}
