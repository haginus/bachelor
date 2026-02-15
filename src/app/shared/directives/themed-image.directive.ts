import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import {toSignal } from '@angular/core/rxjs-interop';

@Directive({
  selector: 'img[themedImage]',
  standalone: true
})
export class ThemedImageDirective {
  private themeService = inject(ThemeService);
  private img = inject(ElementRef<HTMLImageElement>);
  lightSrc = input.required<string>();
  darkSrc = input.required<string>();
  isDarkMode = toSignal(this.themeService.isDarkMode$);

  constructor() {
    effect(() => {
      this.img.nativeElement.src = this.isDarkMode() ? this.darkSrc() : this.lightSrc();
    });
  }
}
