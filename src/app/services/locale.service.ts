import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, Injectable, isDevMode, LOCALE_ID, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

export type AppLanguage = 'ro' | 'en';

@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly document = inject(DOCUMENT);
  private readonly platform = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  readonly language: AppLanguage = inject(LOCALE_ID).split('-')[0] === 'en' ? 'en' : 'ro';
  readonly development = isDevMode();

  /** Load the other locale's compiled application, retaining the route and deployment prefix. */
  navigate(language: AppLanguage): boolean {
    if (language === this.language || this.development || !isPlatformBrowser(this.platform)) return false;

    let basePath = new URL(this.document.baseURI).pathname.replace(/\/+$/, '');
    if (this.language === 'en') basePath = basePath.replace(/\/en$/, '');
    const destination = new URL(
      `${basePath}${language === 'en' ? '/en' : ''}${this.router.url}`,
      this.document.location.origin,
    );
    if (destination.origin !== this.document.location.origin) return false;
    this.document.location.assign(destination.href);
    return true;
  }
}
