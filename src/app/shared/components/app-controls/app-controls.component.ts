import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../../services/theme.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-controls',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, LanguageSwitcherComponent],
  template: `
    <button matIconButton type="button" matTooltip="Comutați tema" i18n-matTooltip
      aria-label="Comutați tema" i18n-aria-label (click)="themeService.toggleTheme()">
      <mat-icon>{{ themeService.isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
    <app-language-switcher />
  `,
  styles: `
    :host { display: inline-flex; align-items: center; }
  `,
})
export class AppControlsComponent {
  protected readonly themeService = inject(ThemeService);
}
