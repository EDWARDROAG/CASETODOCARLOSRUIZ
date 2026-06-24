import { Component, viewChild } from '@angular/core';
import { SiteHeaderComponent } from '../../layout/site-header/site-header.component';
import { SiteFooterComponent } from '../../layout/site-footer/site-footer.component';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { AboutSectionComponent } from '../../components/about-section/about-section.component';
import { ExperienceSectionComponent } from '../../components/experience-section/experience-section.component';
import { TestimonialsSectionComponent } from '../../components/testimonials-section/testimonials-section.component';
import { ProductsSectionComponent } from '../../components/products-section/products-section.component';
import { QuoteSectionComponent } from '../../components/quote-section/quote-section.component';
import { AssistantWidgetComponent } from '../../components/assistant-widget/assistant-widget.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    ExperienceSectionComponent,
    TestimonialsSectionComponent,
    ProductsSectionComponent,
    QuoteSectionComponent,
    AssistantWidgetComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly assistant = viewChild(AssistantWidgetComponent);

  openAssistant(): void {
    this.assistant()?.open();
  }
}
