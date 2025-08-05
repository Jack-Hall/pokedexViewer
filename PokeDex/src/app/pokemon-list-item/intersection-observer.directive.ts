import { Directive, ElementRef, EventEmitter, Output, inject, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appIntersectionObserver]',
  standalone: true
})
export class IntersectionObserverDirective implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);
  private intersectionObserver?: IntersectionObserver;

  @Output() visible = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          this.visible.emit(entry.isIntersecting);
        });
      },
      {
        root: null,
        rootMargin: '50px', // Start loading 50px before the item comes into view
        threshold: 0.1
      }
    );

    this.intersectionObserver.observe(this.elementRef.nativeElement);
  }
} 