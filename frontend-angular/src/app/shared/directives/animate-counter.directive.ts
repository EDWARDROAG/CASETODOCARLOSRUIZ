import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appAnimateCounter]',
  standalone: true,
})
export class AnimateCounterDirective implements AfterViewInit, OnDestroy {
  @Input('appAnimateCounter') target = 0;
  @Input() counterSuffix = '';

  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private animated = false;

  ngAfterViewInit(): void {
    this.el.nativeElement.textContent = `0${this.counterSuffix}`;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !this.animated) {
          this.animated = true;
          this.animate();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private animate(): void {
    const duration = 1600;
    const start = performance.now();
    const target = this.target;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      this.el.nativeElement.textContent = `${value.toLocaleString('es-CO')}${this.counterSuffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
