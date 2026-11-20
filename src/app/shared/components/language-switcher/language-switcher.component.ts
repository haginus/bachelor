import { Component, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../services/auth.service';
import { LocaleService } from '../../../services/locale.service';
import { getErrorMessage } from '../../../lib/utils';

@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonModule, MatTooltipModule],
  template: `
    <button mat-icon-button type="button" [disabled]="disabled() || busy()"
      [attr.aria-label]="label" [matTooltip]="label" (click)="switchLanguage()">
      <img [src]="flag" alt="" aria-hidden="true" width="24" height="16" />
    </button>
  `,
  styles: `
    :host { display: inline-flex; }
    img { display: block; border-radius: 2px; box-shadow: 0 0 0 1px var(--mat-sys-outline-variant); }
  `,
})
export class LanguageSwitcherComponent {
  private readonly auth = inject(AuthService);
  private readonly locale = inject(LocaleService);
  private readonly snackBar = inject(MatSnackBar);
  readonly disabled = input(false);
  protected readonly busy = signal(false);
  protected readonly target = this.locale.language === 'ro' ? 'en' : 'ro';
  protected readonly flag = `assets/img/flags/${this.target}.svg`;
  protected readonly label = this.target === 'en'
    ? 'Switch to English'
    : 'Comutați la română';

  protected switchLanguage(): void {
    if (this.disabled() || this.busy()) return;
    this.busy.set(true);
    try {
      this.auth.setPreferredLanguage(this.target);
      if (!this.locale.navigate(this.target) && this.locale.development) {
        this.snackBar.open($localize`:@@languageSavedDevelopment:Preferința de limbă a fost salvată. Acest server de dezvoltare afișează o singură limbă.`);
      }
    } catch (error) {
      this.snackBar.open(getErrorMessage(error));
    } finally {
      this.busy.set(false);
    }
  }
}
