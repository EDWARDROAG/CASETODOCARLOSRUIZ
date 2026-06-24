import { Component } from '@angular/core';
import { SITE_CONFIG } from '../../core/config/site.config';
import { AnimateCounterDirective } from '../../shared/directives/animate-counter.directive';

@Component({
  selector: 'app-experience-section',
  standalone: true,
  imports: [AnimateCounterDirective],
  templateUrl: './experience-section.component.html',
  styleUrl: './experience-section.component.scss',
})
export class ExperienceSectionComponent {
  readonly site = SITE_CONFIG;
}
